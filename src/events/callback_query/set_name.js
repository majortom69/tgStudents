const { updateUserName } = require('../../database')

module.exports = {
    callbackData: 'set_name',
    execute: async (bot, callbackQuery) => {
        const chatId = callbackQuery.message.chat.id;
        const messageId = callbackQuery.message.message_id;

        bot.editMessageText('Пожалуйста введите имя пользователя:', {
            chat_id: chatId,
            message_id: messageId,
            reply_markup: { inline_keyboard: [] }
        }).then(() => {
            bot.once('message', async (msg) => {
                const name = msg.text;
                updateUserName(chatId, name);
                bot.sendMessage(chatId, '🎉Имя пользователя успешно обновлено!🎉');
            });
        });
    }
}