const TelegramBot = require('node-telegram-bot-api');
const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const { checkUserExist, createUser, updateUserName, getUserAchievements, deleteAchievement } = require('./database');

// Replace with your actual Telegram Bot Token
const token = '6651061258:AAEV-0YJUk5zmweYJnaz9fSMWdoBDUQPvS4';
const bot = new TelegramBot(token, { polling: true });

// Export the token
module.exports.token = token;

// Create uploads folder if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir);
}

const pipelineAsync = promisify(require('stream').pipeline);

// State management to track user upload requests
global.userStates = {};


/*
// Function to format an achievement message
function formatAchievementMessage(achievement) {
    let message = `Title: ${achievement.TITLE}\n`;
    message += `Description: ${achievement.DESCRIPTION}\n`;
    message += `Date: ${achievement.ACHIEVEMENT_DATE}\n`;
    message += `Category: ${achievement.CATEGORY}\n`;
    message += `Attached files: ${achievement.ATTACHMENTS.length}\n`;

    return message;
}

// Function to send achievement page
async function sendAchievementPage(chatId, userId, page, messageId = null) {
    const achievements = await getUserAchievements(userId);
    const pageSize = 1; // Number of achievements per page
    const totalPages = Math.ceil(achievements.length / pageSize);

    // Ensure the page is within bounds
    if (page < 1) page = 1;
    if (page > totalPages) page = totalPages;

    const startIndex = (page - 1) * pageSize;
    const endIndex = Math.min(startIndex + pageSize, achievements.length);
    const currentAchievements = achievements.slice(startIndex, endIndex);

    let message = `Your Achievements (Page ${page}/${totalPages}):\n\n`;
    for (let achievement of currentAchievements) {
        message += formatAchievementMessage(achievement);
        message += '\n';
    }

    const inlineKeyboard = {
        inline_keyboard: [
            [
                { text: '⬅️ Prev', callback_data: `prev_${page}` },
                { text: '📎 Send Attachment', callback_data: `send_attachment_${page}` },
                { text: '➡️ Next', callback_data: `next_${page}` }
            ],
            [
                { text: '📝 Edit', callback_data: `edit_${page}` },
                { text: '🗑 Delete', callback_data: `delete_${page}` }
            ]
        ]
    };

    if (messageId) {
        bot.editMessageText(message, {
            chat_id: chatId,
            message_id: messageId,
            reply_markup: inlineKeyboard
        }).catch((error) => {
            if (error.response && error.response.body && error.response.body.error_code === 400 && error.response.body.description.includes('message is not modified')) {
                console.log('Message not modified, skipping update.');
            } else {
                console.error('Failed to edit message:', error);
            }
        });
    } else {
        bot.sendMessage(chatId, message, { reply_markup: inlineKeyboard });
    }
}
*/

/*
// Command to show user achievements
bot.onText(/\/ping/, async (msg) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id;
    userStates[userId] = { page: 1 }; // Initialize user state

    try {
        await sendAchievementPage(chatId, userId, userStates[userId].page);
    } catch (error) {
        bot.sendMessage(chatId, 'Error retrieving achievements. Please try again later.', error);
    }
});
*/

/*
// Handle button presses
bot.on('callback_query', async (query) => {
    const chatId = query.message.chat.id;
    const messageId = query.message.message_id;
    const userId = query.from.id;

    if (!userStates[userId]) return;

    let currentPage = userStates[userId].page;

    const achievements = await getUserAchievements(userId);
    const totalPages = Math.ceil(achievements.length / 1);

    if (query.data.startsWith('prev_') && currentPage > 1) {
        currentPage--;
    } else if (query.data.startsWith('next_') && currentPage < totalPages) {
        currentPage++;
    } else if (query.data.startsWith('send_attachment_')) {
        const pageToSendAttachment = parseInt(query.data.split('_')[2], 10) - 1;
        const achievementToSendAttachment = achievements[pageToSendAttachment];

        if (achievementToSendAttachment.ATTACHMENTS.length > 0) {
            let attachmentMessage = `Attachments for ${achievementToSendAttachment.TITLE}:\n`;
            let attachmentFiles = achievementToSendAttachment.ATTACHMENTS.map((attachment, index) => ({
                type: 'document',
                media: attachment,
                caption: index === 0 ? attachmentMessage : '' // Add caption only to the first attachment
            }));

            try {
                await bot.sendMediaGroup(chatId, attachmentFiles);
            } catch (error) {
                console.error('Error sending attachments:', error);
            }
        }

        // Acknowledge the callback immediately
        bot.answerCallbackQuery(query.id, { text: 'Attachment sent!' });

        return;
    } else if (query.data.startsWith('delete_')) {
        const pageToDelete = parseInt(query.data.split('_')[1], 10) - 1;
        const achievementToDelete = achievements[pageToDelete];

        try {
            await deleteAchievement(achievementToDelete.ACHIEVEMENT_ID);
            await sendAchievementPage(chatId, userId, currentPage, messageId);
            bot.answerCallbackQuery(query.id, { text: 'Achievement deleted!' });
        } catch (error) {
            console.error('Error deleting achievement:', error);
            bot.answerCallbackQuery(query.id, { text: 'Failed to delete achievement.' });
        }

        return;
    }

    userStates[userId].page = currentPage;

    try {
        await sendAchievementPage(chatId, userId, currentPage, messageId);
    } catch (error) {
        bot.sendMessage(chatId, 'Error retrieving achievements. Please try again later.');
    }

    // Acknowledge the callback
    bot.answerCallbackQuery(query.id);
});
*/

// Load commands
const commandFiles = fs.readdirSync(path.join(__dirname, 'commands')).filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    bot.onText(command.pattern, (msg) => command.execute(bot, msg));
}
console.log('✅ Commands has been loaded successfully');

// Load events
const eventFiles = fs.readdirSync(path.join(__dirname, 'events')).filter(file => file.endsWith('.js'));
for (const file of eventFiles) {
    const event = require(`./events/${file}`);
    bot.on(event.type, (data) => event.execute(bot, data));
}
console.log('✅ Events has been loaded successfully');

console.log('Bot has been started 🤫🧏🏻‍♂️');

// // List of available commands (excluding /help)
// const commands = ['/register - Регистрация пользователя', '/upload - Загрузка достижения', '/update - Редактирование имени пользователя'];

// // Function to generate the help message
// const getHelpMessage = () => {
//     const availableCommands = commands.filter(cmd => cmd !== '/help');
//     return `Доступные команды:\n${availableCommands.join('\n')}`;
// };

// // Handle the /help command
// bot.onText(/\/help/, (msg) => {
//     const chatId = msg.chat.id;
//     const response = getHelpMessage();
//     bot.sendMessage(chatId, response);
// });

// bot.onText(/\/start/, (msg) => {
//     const chatId = msg.chat.id;
//     bot.sendMessage(chatId,
//     `📚 Добро пожаловать в Бота для сбора и каталогизации информации о достижениях студентов! 📚

//     Этот бот помогает вам собирать и оценивать достижения студентов.
        
//     ${getHelpMessage()}
        
//     Если вам нужна помощь, введите /help.`
//     )
// });

// // Listen for the /upload command
// bot.onText(/\/upload/, async (msg) => {
//     const chatId = msg.chat.id;
//     const exists = await checkUserExist(chatId);
//     if(!exists){
//         const animationUr = 'https://cdn.discordapp.com/attachments/1222666666308010124/1252576399487795271/ezgif.com-video-to-gif-converter.gif?ex=668138ad&is=667fe72d&hm=2b427236f930a720a5b62147b70e2eefb6a957783d37e96c3b852ea2ca620fd6';
//         bot.sendMessage(chatId,'Вы должны быть зарегистрированы');
//         bot.sendAnimation(chatId, animationUr).catch(err => {
//         console.error('Failed to send animation:', err);
//     });
//     } else{
//         userStates[chatId] = { step: 'awaiting_title' };
//         const options = {
//             reply_markup: {
//                 inline_keyboard: [
//                     [{ text: '🧬Научное🧬', callback_data: 'scientific' }],
//                     [{ text: '🏆Спортивное🏆', callback_data: 'sport' }],
//                     [{ text: '🎭Культурная🎭', callback_data: 'cultural' }],
//                     [{ text: '❓Другое❓', callback_data: 'other' }],
//                     [{ text: 'Отмена', callback_data: 'cancel' }]
//                 ]
//             }
//         };
//         bot.sendMessage(chatId, 'Выберите категорию достижения:', options);
//     }
// });

// // Listen for the /register command
// bot.onText(/\/register/, async (msg) => {
//     const chatId = msg.chat.id;
//     const exists = await checkUserExist(chatId);
//     if(exists){
//         const animationUr = 'https://cdn.discordapp.com/attachments/1222666666308010124/1252576399487795271/ezgif.com-video-to-gif-converter.gif?ex=668138ad&is=667fe72d&hm=2b427236f930a720a5b62147b70e2eefb6a957783d37e96c3b852ea2ca620fd6';
//         bot.sendMessage(chatId,'Вы уже зарегестрированы');
//         bot.sendAnimation(chatId, animationUr).catch(err => {
//         console.error('Failed to send animation:', err);
//     });
//     } else{
//         const options = {
//             reply_markup: {
//                 inline_keyboard: [
//                     [{ text: 'Студент', callback_data: 'student' }],
//                     [{ text: 'Преподаватель', callback_data: 'teacher' }]
//                 ]
//             }
//         };
//         bot.sendMessage(chatId, 'Пожалуйста выберите роль:', options);
//     }
// });

// bot.onText(/\/update/, async (msg) =>{
//     const chatId = msg.chat.id;
//     const exists = await checkUserExist(chatId);
//     if(exists){
//         bot.sendMessage(chatId, 'Редактирование.\nПожалуйста введите полное имя:');
//         userStates[chatId] = { step: 'change_name' };
//     }
//     else{
//         bot.sendMessage(chatId, 'Такого пользователя не существует');
//         const animationUr = 'https://cdn.discordapp.com/attachments/1222666666308010124/1252576399487795271/ezgif.com-video-to-gif-converter.gif?ex=668138ad&is=667fe72d&hm=2b427236f930a720a5b62147b70e2eefb6a957783d37e96c3b852ea2ca620fd6';
//         bot.sendAnimation(chatId, animationUr).catch(err => {
//             console.error('Failed to send animation:', err);
//         });
//     }
// });

// // Handle callback queries
// bot.on('callback_query', (callbackQuery) => {
//     const chatId = callbackQuery.message.chat.id;
//     const messageId = callbackQuery.message.message_id;
//     const data = callbackQuery.data;

//     if (data === 'cancel') {
//         delete userStates[chatId];
//         bot.editMessageText('Действие отменено', {
//             chat_id: chatId,
//             message_id: messageId,
//             reply_markup: { inline_keyboard: [] }
//         }).catch(error => {
//             console.error('Ошибка при редактировании сообщения:', error);
//         });
//         return;
//     }
    
//     if(data === 'scientific' || data === 'sport' || data === 'cultural' || data === 'other'){
//         userStates[chatId] = { step: 'awaiting_title', category: data};
//         const options = {
//             reply_markup: {
//                 inline_keyboard: [
//                     [{ text: 'Назад', callback_data: 'back_title' }]
//                 ]
//             }
//         };
//         bot.editMessageText('Пожалуйста введите название достижения:', {
//             chat_id: chatId,
//             message_id: messageId,
//             reply_markup: options.reply_markup
//         }).then(() => {
//             userStates[chatId].lastMessageId = messageId;
//         });
//     } else if( data === 'back_title'){
//         userStates[chatId] = {};
//         const options = {
//             reply_markup: {
//                 inline_keyboard: [
//                     [{ text: '🧬Научное🧬', callback_data: 'scientific' }],
//                     [{ text: '🏆Спортивное🏆', callback_data: 'sport' }],
//                     [{ text: '🎭Культурная🎭', callback_data: 'cultural' }],
//                     [{ text: '❓Другое❓', callback_data: 'other' }],
//                     [{ text: 'Отмена', callback_data: 'cancel' }]
//                 ]
//             }
//         };
//         bot.editMessageText('Выберите категорию достижения:', {
//             chat_id: chatId,
//             message_id: messageId,
//             reply_markup: options.reply_markup
//         });
//     }

//     if (data === 'student') {
//         userStates[chatId] = { step: 'awaiting_name', role: data };
//         const options = {
//             reply_markup: {
//                 inline_keyboard: [
//                     [{ text: 'Назад', callback_data: 'back' }]
//                 ]
//             }
//         };
//         bot.editMessageText('Пожалуйста введите полное имя студента:', {
//             chat_id: chatId,
//             message_id: messageId,
//             reply_markup: options.reply_markup
//         }).then(() => {
//             userStates[chatId].lastMessageId = messageId;
//         });
//     } else if (data === 'teacher') {
//         userStates[chatId] = { step: 'awaiting_password', role: data };
//         const options = {
//             reply_markup: {
//                 inline_keyboard: [
//                     [{ text: 'Назад', callback_data: 'back' }]
//                 ]
//             }
//         };
//         bot.editMessageText('Пожалуйста введите пароль для преподавателя:', {
//             chat_id: chatId,
//             message_id: messageId,
//             reply_markup: options.reply_markup
//         }).then(() => {
//             userStates[chatId].lastMessageId = messageId;
//         });
//     } else if (data === 'back') {
//         userStates[chatId] = {};
//         const options = {
//             reply_markup: {
//                 inline_keyboard: [
//                     [{ text: 'Студент', callback_data: 'student' }],
//                     [{ text: 'Преподаватель', callback_data: 'teacher' }]
//                 ]
//             }
//         };
//         bot.editMessageText('Пожалуйста выберите роль:', {
//             chat_id: chatId,
//             message_id: messageId,
//             reply_markup: options.reply_markup
//         });
//     }
// });

// // Listen for any kind of message
// bot.on('message', (msg) => {
//     const chatId = msg.chat.id;
//     const userState = userStates[chatId];

//     if (!userState) return;

//     switch (userState.step) {
//         case 'awaiting_title':
//             userState.title = msg.text;
//             bot.deleteMessage(chatId, userState.lastMessageId);
//             userState.step = 'awaiting_description';
//             bot.sendMessage(chatId, 'Please send the description of the achievement.');
//             break;

//         case 'awaiting_description':
//             userState.description = msg.text;
//             userState.step = 'awaiting_image';
//             bot.sendMessage(chatId, 'Please send an image for the achievement.');
//             break;
//         case 'awaiting_image':
//             if (msg.photo) {
//                 const fileId = msg.photo[msg.photo.length - 1].file_id;

//                 bot.getFile(fileId).then(file => {
//                     const filePath = file.file_path;
//                     const url = `https://api.telegram.org/file/bot${token}/${filePath}`;
                    
//                     fetch(url)
//                         .then(async res => {
//                             const dest = fs.createWriteStream(path.join(uploadsDir, path.basename(filePath)));
//                             try {
//                                 await pipelineAsync(res.body, dest);
//                                 const achievement = {
//                                     category: userState.category,
//                                     title: userState.title,
//                                     description: userState.description,
//                                     imagePath: path.join(uploadsDir, path.basename(filePath))
//                                 };
//                                 // Save the achievement data as needed
//                                 // For example, you can log it or save it to a database
//                                 console.log('Achievement:', achievement);
                                
//                                 bot.sendMessage(chatId, 'Achievement has been uploaded successfully.');
//                                 // Clear the user state
//                                 delete userStates[chatId];
//                             } catch (err) {
//                                 console.error(err);
//                                 bot.sendMessage(chatId, 'Failed to save the image.');
//                             }
//                         })
//                         .catch(err => {
//                             console.error(err);
//                             bot.sendMessage(chatId, 'Failed to download the image.');
//                         });
//                 });
//             } else {
//                 bot.sendMessage(chatId, 'Please send a valid image.');
//             }
//             break;

//         case 'awaiting_name':
//             userState.name = msg.text;
//             bot.deleteMessage(chatId, userState.lastMessageId);
//             if (userState.role === 'student') {
//                 userState.step = 'awaiting_group';
//                 bot.sendMessage(chatId, 'Пожалуйста введите вашу группу (например, 1488К или М249).');
//             } else {
//                 // Save teacher data
//                 const teacher = {
//                     userId: chatId,
//                     role: userState.role,
//                     name: userState.name
//                 };
//                 console.log('Teacher registered:', teacher);
//                 createUser(teacher);
//                 bot.sendMessage(chatId, 'Вы успешно зарегистрированы как преподаватель.');
//                 // Clear the user state
//                 delete userStates[chatId];
//             }
//             break;

//         case 'awaiting_group':
//             userState.group = msg.text;
//             // Save student data
//             const student = {
//                 userId: chatId,
//                 role: userState.role,
//                 name: userState.name,
//                 group: userState.group
//             };
//             console.log('Student registered:', student);
//             createUser(student);
//             bot.sendMessage(chatId, 'Вы успешно зарегистрированы как студент.');
//             // Clear the user state
//             delete userStates[chatId];
//             break;
        
//         case 'change_name':
//             userState.name = msg.text;
//             updateUserName(chatId, userState.name);
//             break;

//         case 'awaiting_password':
//             const password = msg.text;
//             if (password === '123') {
//                 bot.deleteMessage(chatId, userState.lastMessageId);
//                 userState.step = 'awaiting_name';
//                 bot.sendMessage(chatId, 'Пароль подтверждён.\nПожалуйста введите полное имя преподавателя:');
//             } else {
//                 bot.sendMessage(chatId, 'Неверный пароль. Пожалуйста, попробуйте снова.');
//             }
//             break;
//         default:
//             bot.sendMessage(chatId, 'Unexpected state. Please start again with /register.');
//             delete userStates[chatId];
//     }
// });