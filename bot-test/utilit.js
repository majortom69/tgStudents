const { getUserAchievements } = require('./database');

function formatAchievementMessage(achievement) {
    let message = `Title: ${achievement.TITLE}\n`;
    message += `Description: ${achievement.DESCRIPTION}\n`;
    message += `Date: ${achievement.ACHIEVEMENT_DATE}\n`;
    message += `Category: ${achievement.CATEGORY}\n`;
    message += `Attached files: ${achievement.ATTACHMENTS.length}\n`;

    return message;
}

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
                { text: '📝 Edit', callback_data: `edit` },
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

module.exports = { formatAchievementMessage, sendAchievementPage };
