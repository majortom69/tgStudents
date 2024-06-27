const TelegramBot = require('node-telegram-bot-api');
const fs = require('fs');
const path = require('path');
const { pipeline } = require('stream');
const { promisify } = require('util');

// Replace with your actual Telegram Bot Token
const token = '6651061258:AAEV-0YJUk5zmweYJnaz9fSMWdoBDUQPvS4';

const bot = new TelegramBot(token, { polling: true });

// Create uploads folder if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir);
}

const pipelineAsync = promisify(pipeline);

// State management to track user upload requests
const userStates = {};

console.log('✅ Бот работает(заебись)');

// Listen for the /upload command
bot.onText(/\/upload/, (msg) => {
    const chatId = msg.chat.id;
    userStates[chatId] = { step: 'awaiting_title' };
    bot.sendMessage(chatId, 'Please send the title of the achievement.');
});

// Listen for any kind of message
bot.on('message', (msg) => {
    const chatId = msg.chat.id;
    const userState = userStates[chatId];

    if (!userState) return;

    switch (userState.step) {
        case 'awaiting_title':
            userState.title = msg.text;
            userState.step = 'awaiting_description';
            bot.sendMessage(chatId, 'Please send the description of the achievement.');
            break;

        case 'awaiting_description':
            userState.description = msg.text;
            userState.step = 'awaiting_image';
            bot.sendMessage(chatId, 'Please send an image for the achievement.');
            break;

        case 'awaiting_image':
            if (msg.photo) {
                const fileId = msg.photo[msg.photo.length - 1].file_id;

                bot.getFile(fileId).then(file => {
                    const filePath = file.file_path;
                    const url = `https://api.telegram.org/file/bot${token}/${filePath}`;
                    
                    fetch(url)
                        .then(async res => {
                            const dest = fs.createWriteStream(path.join(uploadsDir, path.basename(filePath)));
                            try {
                                await pipelineAsync(res.body, dest);
                                const achievement = {
                                    title: userState.title,
                                    description: userState.description,
                                    imagePath: path.join(uploadsDir, path.basename(filePath))
                                };
                                // Save the achievement data as needed
                                // For example, you can log it or save it to a database
                                console.log('Achievement:', achievement);
                                
                                bot.sendMessage(chatId, 'Achievement has been uploaded successfully.');
                                // Clear the user state
                                delete userStates[chatId];
                            } catch (err) {
                                console.error(err);
                                bot.sendMessage(chatId, 'Failed to save the image.');
                            }
                        })
                        .catch(err => {
                            console.error(err);
                            bot.sendMessage(chatId, 'Failed to download the image.');
                        });
                });
            } else {
                bot.sendMessage(chatId, 'Please send a valid image.');
            }
            break;

        default:
            bot.sendMessage(chatId, 'Unexpected state. Please start again with /upload.');
            delete userStates[chatId];
    }
});