const { checkUserExist} = require('../database');
const path = require('path');

module.exports = {
    pattern: /\/register/,
    execute: async (bot, msg) => {
        const chatId = msg.chat.id;
        delete userStates[chatId];
        const exists = await checkUserExist(chatId);
        if (exists) {
            bot.sendMessage(chatId, '🚨Вы уже зарегистрированы!🚨');
            const animationPath = path.resolve(__dirname, '..', 'animations', 'ezgif.com-video-to-gif-converter.gif');
            bot.sendAnimation(chatId, animationPath).catch(err => {
                console.error('Failed to send animation:', err);
            });
        } else {
            const options = {
                reply_markup: {
                    inline_keyboard: [
                        [{ text: '👨‍🎓👩‍🎓Студент👨‍🎓👩‍🎓', callback_data: 'student' }],
                        [{ text: '👩‍🏫👨‍🏫Преподаватель👩‍🏫👨‍🏫', callback_data: 'teacher' }]
                    ]
                }
            };
            bot.sendMessage(chatId, 'Пожалуйста выберите роль:', options);
        }
    }
};
