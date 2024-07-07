module.exports = {
    callbackData: 'search_group',
    execute: async (bot, callbackQuery) => {
        const chatId = callbackQuery.message.chat.id;
        const messageId = callbackQuery.message.message_id;

        if (!userStates[chatId]) {
            userStates[chatId] = {};
        }

        userStates[chatId].step = 'awaiting_group_id';
        bot.editMessageText('Введите номер студенческой группы ', {
            chat_id: chatId,
            message_id: messageId,
            reply_markup: { inline_keyboard: [] }
        }).then(() => {
            userStates[chatId].lastMessageId = messageId;
        });
    }
};
