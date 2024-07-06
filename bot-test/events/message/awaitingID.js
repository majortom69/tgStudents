const path = require('path');
const { checkUserExist, getUserAchievements } = require('../../database');

module.exports = {
    step: 'awaitin_student_id',
    execute: async (bot, msg, userStates) => {
        const chatId = msg.chat.id;
        const userId = msg.text;
        const animationPath = path.resolve(__dirname, '..', 'animations', 'ezgif.com-video-to-gif-converter.gif');

        try {
            const exists = await checkUserExist(userId);
            if (!exists) {
                await bot.sendMessage(chatId, 'Нет такого пользователя.');
                await bot.sendAnimation(chatId, animationPath);
                return;
            }

            const achievements = await getUserAchievements(userId);
            if (achievements.length === 0) {
                await bot.sendMessage(chatId, 'У пользователя нет достижений.');
                await bot.sendAnimation(chatId, animationPath);
                return;
            }

            console.log('User ID: ', userId, global.userStates[chatId])
            global.userStates[chatId] = { userId: userId, page: 1 };
            console.log('User State Updated: ', userId, global.userStates[chatId])

            await sendAchievementPage(bot, chatId, userId, global.userStates[chatId].page);
        } catch (error) {
            console.error('Error executing command:', error);
            await bot.sendMessage(chatId, 'Произошла ошибка при обработке запроса. Пожалуйста, попробуйте позже.');
        }
    }
};

async function sendAchievementPage(bot, chatId, userId, page, messageId = null) {
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
                { text: '⬅️ Prev', callback_data: `prev` },
                { text: '📎 Send Attachment', callback_data: `send_attachment` },
                { text: '➡️ Next', callback_data: `next` }
            ],
            [
                { text: '🗑 Delete', callback_data: `delete` }
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

function formatAchievementMessage(achievement) {
    let message = `Title: ${achievement.TITLE}\n`;
    message += `Description: ${achievement.DESCRIPTION}\n`;
    message += `Date: ${achievement.ACHIEVEMENT_DATE}\n`;
    message += `Category: ${achievement.CATEGORY}\n`;
    message += `Attached files: ${achievement.ATTACHMENTS.length}\n`;

    return message;
}
