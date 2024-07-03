const  {getUserAchievements} = require('../database')


function formatAchievementMessage(achievement) {
    let message = `Title: ${achievement.TITLE}\n`;
    message += `Description: ${achievement.DESCRIPTION}\n`;
    message += `Date: ${achievement.ACHIEVEMENT_DATE}\n`;
    message += `Category: ${achievement.CATEGORY}\n`;
    message += `Attached files: ${achievement.ATTACHMENTS.length}\n`;

    return message;
}

// Function to send achievement page


module.exports = {
    pattern: /\/myachiv/,
    execute: async (bot, msg) => {
        const chatId = msg.chat.id;
        const userId = msg.from.id;
        userStates[userId] = { page: 1 }; // Initialize user state

        try {

            async function sendAchievementPage(chatId, userId, page, messageId = null) {
                try {
                    
                } catch(error) {
                    console.log(error);
                }
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

            

            await sendAchievementPage(chatId, userId, userStates[userId].page);
        } catch (error) {
            bot.sendMessage(chatId, 'Error retrieving achievements. Please try again later.');
        }
    }
};





// const path = require('path');
// const { checkUserExist, getUserAchievements } = require('../database');

// module.exports = {
//     pattern: /\/myachiv/,
//     execute: async (bot, msg) => {
//         const chatId = msg.chat.id;
//         const exists = await checkUserExist(chatId);
//         if (!exists) {
//             bot.sendMessage(chatId, 'Вы должны быть зарегистрированы');
//             const animationPath = path.resolve(__dirname, '..', 'animations', 'ezgif.com-video-to-gif-converter.gif');
//             bot.sendAnimation(chatId, animationPath).catch(err => {
//                 console.error('Failed to send animation:', err);
//             });
//             return;
//         }
        
//         const achievements = await getUserAchievements(chatId);
//         if (achievements.length === 0) {
//             await bot.sendMessage(chatId, 'У пользователя нет достижений.');
//             return;
//         }

//         const index = 0
//         const achievement = achievements[index];

//         const options = {
//             reply_markup: {
//                 inline_keyboard: [
//                     [
//                         { text: '◀', callback_data: 'previous' },
//                         { text: '▶', callback_data: 'following' }
//                     ],
//                     [{ text: 'Редактировать достижение', callback_data: 'edit_ach' }],
//                     [{ text: 'Удалить достижение', callback_data: 'delete_ach' }]
//                 ]
//             }
//         };

//         let message = `Категория: ${achievement.CATEGORY}\n`;
//         message += `Название: ${achievement.TITLE}\n`;
//         message += `Описание: ${achievement.DESCRIPTION}\n`;
//         message += `Вложения:\n`;
//         for (const attachment of achievement.ATTACHMENTS) {
//             message += `${attachment}\n`;
//         }

//         await bot.sendMessage(chatId, message, options);
//     }
// };
