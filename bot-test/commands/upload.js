const { checkUserExist } = require('../database');

module.exports = {
    pattern: /\/upload/,
    execute: async (bot, msg) => {
        const chatId = msg.chat.id;
        const exists = await checkUserExist(chatId);
        if (!exists) {
            const animationUrl = 'https://cdn.discordapp.com/attachments/1222666666308010124/1252576399487795271/ezgif.com-video-to-gif-converter.gif';
            bot.sendMessage(chatId, 'Вы должны быть зарегистрированы');
            bot.sendAnimation(chatId, animationUrl).catch(err => {
                console.error('Failed to send animation:', err);
            });
        } else {
            userStates[chatId] = { step: 'awaiting_title' };
            const options = {
                reply_markup: {
                    inline_keyboard: [
                        [{ text: '🧬Научное🧬', callback_data: 'scientific' }],
                        [{ text: '🏆Спортивное🏆', callback_data: 'sport' }],
                        [{ text: '🎭Культурная🎭', callback_data: 'cultural' }],
                        [{ text: '❓Другое❓', callback_data: 'other' }],
                        [{ text: 'Отмена', callback_data: 'cancel' }]
                    ]
                }
            };
            bot.sendMessage(chatId, 'Выберите категорию достижения:', options);
        }
    }
};
