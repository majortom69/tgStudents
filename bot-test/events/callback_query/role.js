module.exports = {
    callbackData: ['student', 'teacher', 'back'],
    execute: (bot, callbackQuery) => {
        const chatId = callbackQuery.message.chat.id;
        const messageId = callbackQuery.message.message_id;
        const data = callbackQuery.data;

        if (data === 'student') {
            userStates[chatId] = { step: 'awaiting_name', role: data };
            const options = {
                reply_markup: {
                    inline_keyboard: [
                        [{ text: '↩️Назад↩️', callback_data: 'back' }]
                    ]
                }
            };
            bot.editMessageText('👨‍🎓👩‍🎓Пожалуйста введите полное имя студента:👨‍🎓👩‍🎓', {
                chat_id: chatId,
                message_id: messageId,
                reply_markup: options.reply_markup
            }).then(() => {
                userStates[chatId].lastMessageId = messageId;
            });
        } else if (data === 'teacher') {
            userStates[chatId] = { step: 'awaiting_password', role: data };
            const options = {
                reply_markup: {
                    inline_keyboard: [
                        [{ text: '↩️Назад↩️', callback_data: 'back' }]
                    ]
                }
            };
            bot.editMessageText('🔐Пожалуйста введите пароль для преподавателя:🔐', {
                chat_id: chatId,
                message_id: messageId,
                reply_markup: options.reply_markup
            }).then(() => {
                userStates[chatId].lastMessageId = messageId;
            });
        } else if (data === 'back') {
            userStates[chatId] = {};
            const options = {
                reply_markup: {
                    inline_keyboard: [
                        [{ text: '👨‍🎓👩‍🎓Студент👨‍🎓👩‍🎓', callback_data: 'student' }],
                        [{ text: '👩‍🏫👨‍🏫Преподаватель👩‍🏫👨‍🏫', callback_data: 'teacher' }]
                    ]
                }
            };
            bot.editMessageText('Пожалуйста выберите роль:', {
                chat_id: chatId,
                message_id: messageId,
                reply_markup: options.reply_markup
            });
        }
    }
};
