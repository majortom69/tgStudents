const { updateUserRole, isUserTeacher } = require('../../database')

module.exports = {
    callbackData: 'set_role',
    execute: async (bot, callbackQuery) => {
        const chatId = callbackQuery.message.chat.id;
        const messageId = callbackQuery.message.message_id;

        let role;

        await isUserTeacher(chatId) ? role = 'student' : role = 'teacher';
        
        if(role === 'student') {
            updateUserRole(chatId, 'student');
            bot.sendMessage(chatId, '🎉Роль изменена на студента успешно!🎉');
        } else {
            bot.editMessageText('Пожалуйста введите пароль:', {
                chat_id: chatId,
                message_id: messageId,
                reply_markup: { inline_keyboard: [] }
            }).then(() => {
                bot.once('message', async (msg) => {
                    const password = msg.text;
                    if(password === '123') {
                        updateUserRole(chatId, 'teacher');
                        bot.sendMessage(chatId, '🎉Роль изменена на преподавателя успешно!🎉');
                    } else {
                        bot.sendMessage(chatId, '⚠️Пароль неверный!⚠️');
                        return;
                    }
                });
            });
        }
    }
}