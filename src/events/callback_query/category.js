module.exports = {
    callbackData: ['scientific', 'sports', 'cultural', 'other', 'back_title'],
    execute: (bot, callbackQuery) => {
        const chatId = callbackQuery.message.chat.id;
        const messageId = callbackQuery.message.message_id;
        const data = callbackQuery.data;

        if (userStates[chatId]?.step !== 'awaiting_title') {
            return; // Ignore if not in the correct step
        }

        if (data === 'scientific' || data === 'sports' || data === 'cultural' || data === 'other') {
            userStates[chatId] = { step: 'awaiting_title', category: data };
            const options = {
                reply_markup: {
                    inline_keyboard: [
                        [{ text: 'Назад', callback_data: 'back_title' }]
                    ]
                }
            };
            bot.editMessageText('🏆Пожалуйста введите название достижения🏆:', {
                chat_id: chatId,
                message_id: messageId,
                reply_markup: options.reply_markup
            }).then(() => {
                userStates[chatId].lastMessageId = messageId;
            });
        } else if (data === 'back_title') {
            userStates[chatId] = {};
            const options = {
                reply_markup: {
                    inline_keyboard: [
                        [{ text: '🧬Научное🧬', callback_data: 'scientific' }],
                        [{ text: '🏆Спортивное🏆', callback_data: 'sports' }],
                        [{ text: '🎭Культурная🎭', callback_data: 'cultural' }],
                        [{ text: '❓Другое❓', callback_data: 'other' }],
                        [{ text: '❌Отмена❌', callback_data: 'cancel' }]
                    ]
                }
            };
            bot.editMessageText('Выберите категорию достижения:', {
                chat_id: chatId,
                message_id: messageId,
                reply_markup: options.reply_markup
            });
        }
    }
};
