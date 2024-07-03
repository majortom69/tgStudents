// const { getUserAchievements, deleteAchievement } = require('../../database'); // Adjust path as per your project structure

// function formatAchievementMessage(achievement) {
//     let message = `Title: ${achievement.TITLE}\n`;
//     message += `Description: ${achievement.DESCRIPTION}\n`;
//     message += `Date: ${achievement.ACHIEVEMENT_DATE}\n`;
//     message += `Category: ${achievement.CATEGORY}\n`;
//     message += `Attached files: ${achievement.ATTACHMENTS.length}\n`;

//     return message;
// }

// module.exports = {
//     callbackData: ['prev_', 'next_', 'send_attachment_', 'delete_'],
//     execute: async (bot, query, userStates) => {
//         const chatId = query.message.chat.id;
//         const messageId = query.message.message_id;
//         const userId = query.from.id;

//         if (!userStates[userId]) return;

//         async function sendAchievementPage(chatId, userId, page, messageId = null) {
//             try {
//                 const achievements = await getUserAchievements(userId);
//                 const pageSize = 1; // Number of achievements per page
//                 const totalPages = Math.ceil(achievements.length / pageSize);

//                 // Ensure the page is within bounds
//                 if (page < 1) page = 1;
//                 if (page > totalPages) page = totalPages;

//                 const startIndex = (page - 1) * pageSize;
//                 const endIndex = Math.min(startIndex + pageSize, achievements.length);
//                 const currentAchievements = achievements.slice(startIndex, endIndex);

//                 let message = `Your Achievements (Page ${page}/${totalPages}):\n\n`;
//                 for (let achievement of currentAchievements) {
//                     message += formatAchievementMessage(achievement);
//                     message += '\n';
//                 }

//                 const inlineKeyboard = {
//                     inline_keyboard: [
//                         [
//                             { text: '⬅️ Prev', callback_data: `prev_${page}` },
//                             { text: '📎 Send Attachment', callback_data: `send_attachment_${page}` },
//                             { text: '➡️ Next', callback_data: `next_${page}` }
//                         ],
//                         [
//                             { text: '📝 Edit', callback_data: `edit_${page}` },
//                             { text: '🗑 Delete', callback_data: `delete_${page}` }
//                         ]
//                     ]
//                 };

//                 if (messageId) {
//                     bot.editMessageText(message, {
//                         chat_id: chatId,
//                         message_id: messageId,
//                         reply_markup: inlineKeyboard
//                     }).catch((error) => {
//                         if (error.response && error.response.body && error.response.body.error_code === 400 && error.response.body.description.includes('message is not modified')) {
//                             console.log('Message not modified, skipping update.');
//                         } else {
//                             console.error('Failed to edit message:', error);
//                         }
//                     });
//                 } else {
//                     bot.sendMessage(chatId, message, { reply_markup: inlineKeyboard });
//                 }
//             } catch(error) {
//                 console.log(error);
//             }
//         }

//         let currentPage = userStates[userId].page;
//         const achievements = await getUserAchievements(userId);
//         const totalPages = Math.ceil(achievements.length / 1);

//         if (query.data.startsWith('prev_') && currentPage > 1) {
//             currentPage--;
//         } else if (query.data.startsWith('next_') && currentPage < totalPages) {
//             currentPage++;
//         } else if (query.data.startsWith('send_attachment_')) {
//             const pageToSendAttachment = parseInt(query.data.split('_')[1], 10) - 1;
//             const achievementToSendAttachment = achievements[pageToSendAttachment];

//             if (achievementToSendAttachment.ATTACHMENTS.length > 0) {
//                 let attachmentMessage = `Attachments for ${achievementToSendAttachment.TITLE}:\n`;
//                 let attachmentFiles = achievementToSendAttachment.ATTACHMENTS.map((attachment, index) => ({
//                     type: 'document',
//                     media: attachment,
//                     caption: index === 0 ? attachmentMessage : '' // Add caption only to the first attachment
//                 }));

//                 try {
//                     await bot.sendMediaGroup(chatId, attachmentFiles);
//                 } catch (error) {
//                     console.error('Error sending attachments:', error);
//                 }
//             }

//             // Acknowledge the callback immediately
//             bot.answerCallbackQuery(query.id, { text: 'Attachment sent!' });

//             return;
//         } else if (query.data.startsWith('delete_')) {
//             const pageToDelete = parseInt(query.data.split('_')[1], 10) - 1;
//             const achievementToDelete = achievements[pageToDelete];

//             try {
//                 await deleteAchievement(achievementToDelete.ACHIEVEMENT_ID);
//                 await sendAchievementPage(chatId, userId, currentPage, messageId);
//                 bot.answerCallbackQuery(query.id, { text: 'Achievement deleted!' });
//             } catch (error) {
//                 console.error('Error deleting achievement:', error);
//                 bot.answerCallbackQuery(query.id, { text: 'Failed to delete achievement.' });
//             }

//             return;
//         }

//         userStates[userId].page = currentPage;

//         try {
//             await sendAchievementPage(chatId, userId, currentPage, messageId);
//         } catch (error) {
//             bot.sendMessage(chatId, 'Error retrieving achievements. Please try again later.');
//         }

//         // Acknowledge the callback
//         bot.answerCallbackQuery(query.id);
//     }
// };
