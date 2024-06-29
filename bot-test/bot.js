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

// List of available commands (excluding /help)
const commands = ['/register - Регистрация пользователя', '/upload - Загрузка достижения'];

// Function to generate the help message
const getHelpMessage = () => {
    const availableCommands = commands.filter(cmd => cmd !== '/help');
    return `Доступные команды:\n${availableCommands.join('\n')}`;
};

// Handle the /help command
bot.onText(/\/help/, (msg) => {
    const chatId = msg.chat.id;
    const response = getHelpMessage();
    bot.sendMessage(chatId, response);
});

bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId,
    `📚 Добро пожаловать в Бота для сбора и каталогизации информации о достижениях студентов! 📚

    Этот бот помогает вам собирать и оценивать достижения студентов.
        
    ${getHelpMessage()}
        
    Если вам нужна помощь, введите /help.`
    )
});

// Listen for the /upload command
bot.onText(/\/upload/, (msg) => {
    const chatId = msg.chat.id;
    userStates[chatId] = { step: 'awaiting_title' };
    bot.sendMessage(chatId, 'Please send the title of the achievement.');
});

// Listen for the /register command
bot.onText(/\/register/, (msg) => {
    const chatId = msg.chat.id;
    userStates[chatId] = { step: 'select_role' };
    const options = {
        reply_markup: {
            inline_keyboard: [
                [{ text: 'Student', callback_data: 'student' }],
                [{ text: 'Teacher', callback_data: 'teacher' }]
            ]
        }
    };
    bot.sendMessage(chatId, 'Please select your role:', options);
});

// Handle callback queries for role selection
bot.on('callback_query', (callbackQuery) => {
    const chatId = callbackQuery.message.chat.id;
    const messageId = callbackQuery.message.message_id;
    const role = callbackQuery.data;

    userStates[chatId] = { step: 'awaiting_name', role: role };
    bot.sendMessage(chatId, 'Please send your full name.');

    // Delete the message with the buttons
    bot.deleteMessage(chatId, messageId).catch((error) => {
        console.error('Failed to delete message:', error);
    });
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

        case 'awaiting_name':
            userState.name = msg.text;
            if (userState.role === 'student') {
                userState.step = 'awaiting_group';
                bot.sendMessage(chatId, 'Please send your group (e.g., 1488K or M249).');
            } else {
                // Save teacher data
                const teacher = {
                    role: userState.role,
                    name: userState.name
                };
                console.log('Teacher registered:', teacher);
                bot.sendMessage(chatId, 'You have been registered successfully as a teacher.');
                // Clear the user state
                delete userStates[chatId];
            }
            break;

        case 'awaiting_group':
            userState.group = msg.text;
            // Save student data
            const student = {
                role: userState.role,
                name: userState.name,
                group: userState.group
            };
            console.log('Student registered:', student);
            bot.sendMessage(chatId, 'You have been registered successfully as a student.');
            // Clear the user state
            delete userStates[chatId];
            break;

        default:
            bot.sendMessage(chatId, 'Unexpected state. Please start again with /register.');
            delete userStates[chatId];
    }
});