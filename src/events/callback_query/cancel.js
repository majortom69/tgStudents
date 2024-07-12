module.exports = {
    callbackData: 'cancel',
    execute: (bot, callbackQuery) => {
        const chatId = callbackQuery.message.chat.id;
        const messageId = callbackQuery.message.message_id;
        bot.editMessageText('Действие отменено.', {
            chat_id: chatId,
            message_id: messageId,
            reply_markup: { inline_keyboard: [] }
        }).catch(error => {
            console.error('Ошибка при редактировании сообщения:', error);
        });
    }
};
