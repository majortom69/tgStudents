const { checkUserExist, createUser } = require('../database');

module.exports = {
    pattern: /\/register/,
    execute: async (bot, msg) => {
        const chatId = msg.chat.id;
        const exists = await checkUserExist(chatId);
        if (exists) {
            const animationUrl = 'https://media.discordapp.net/attachments/1222666666308010124/1252576399487795271/ezgif.com-video-to-gif-converter.gif?ex=6681e16d&is=66808fed&hm=734784e4041a7b0e46616a523f87f7412c6c533ae5d22a5535c51ddc3d793276&=';
            bot.sendMessage(chatId, 'Вы уже зарегистрированы');
            bot.sendAnimation(chatId, animationUrl).catch(err => {
                console.error('Failed to send animation:', err);
            });
        } else {
            const options = {
                reply_markup: {
                    inline_keyboard: [
                        [{ text: 'Студент', callback_data: 'student' }],
                        [{ text: 'Преподаватель', callback_data: 'teacher' }]
                    ]
                }
            };
            bot.sendMessage(chatId, 'Пожалуйста выберите роль:', options);
        }
    }
};
