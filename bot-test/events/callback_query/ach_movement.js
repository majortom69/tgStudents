const { getUserAchievements } = require('../../database');

module.exports = {
    callbackData: ['previous', 'following'],
    execute: async (bot, callbackQuery) => {
        const chatId = callbackQuery.message.chat.id;
        const messageId = callbackQuery.message.message_id;
        const data = callbackQuery.data;

        if (!userStates[chatId]) {
            userStates[chatId] = { step: '', index: 0, lastMessageId: 0 };
        }

        let newIndex;
        if (data === 'previous') {
            newIndex = userStates[chatId].index - 1;
            userStates[chatId].index = newIndex;
        } else if (data === 'following') {
            newIndex = userStates[chatId].index + 1;
            userStates[chatId].index = newIndex;
        }

        const achievements = await getUserAchievements(chatId);
        const achievement = achievements[newIndex];

        const options = {
            reply_markup: {
                inline_keyboard: [
                    [
                        { text: '◀', callback_data: 'previous' },
                        { text: '▶', callback_data: 'following' }
                    ],
                    [{ text: 'Редактировать достижение', callback_data: 'edit_ach' }],
                    [{ text: 'Удалить достижение', callback_data: 'delete_ach' }]
                ]
            }
        };

        let message = `Категория: ${achievement.CATEGORY}\n`;
        message += `Название: ${achievement.TITLE}\n`;
        message += `Описание: ${achievement.DESCRIPTION}\n`;
        message += `Вложения:\n`;
        for (const attachment of achievement.ATTACHMENTS) {
            message += `${attachment}\n`;
        }

        await bot.editMessageText(message, {
            chat_id: chatId,
            message_id: messageId,
            reply_markup: options.reply_markup
        }).catch(error => {
            console.error('Ошибка при редактировании сообщения:', error);
        });
    }
};
