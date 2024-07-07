const { updateStudentGroup } = require('../../database')

module.exports = {
    callbackData: 'set_student_group',
    execute: async (bot, callbackQuery) => {
        const chatId = callbackQuery.message.chat.id;
        const messageId = callbackQuery.message.message_id;

        bot.editMessageText('Пожалуйста введите студенческую группу:', {
            chat_id: chatId,
            message_id: messageId,
            reply_markup: { inline_keyboard: [] }
        }).then(() => {
            bot.once('message', async (msg) => {
                const group = msg.text;
                updateStudentGroup(chatId, group)
                bot.sendMessage(chatId, '🎉Группа успешно обновлена!🎉');
            });
        });
    }
}