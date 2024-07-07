module.exports = {
    callbackData: 'search_ach_id',
    execute: async (bot, callbackQuery) => {
        const chatId = callbackQuery.message.chat.id;
        const messageId = callbackQuery.message.message_id;

        if (!userStates[chatId]) {
            userStates[chatId] = {};
        }

        userStates[chatId].step = 'awaiting_ach_id';
        bot.editMessageText('🏆Введите id достижения🏆', {
            chat_id: chatId,
            message_id: messageId,
            reply_markup: { inline_keyboard: [] }
        }).then(() => {
            userStates[chatId].lastMessageId = messageId;
        });
    }
};
