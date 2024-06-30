const { checkUserExist } = require('../database');

module.exports = {
    pattern: /\/update/,
    execute: async (bot, msg) => {
        const chatId = msg.chat.id;
        const exists = await checkUserExist(chatId);
        if (exists) {
            bot.sendMessage(chatId, 'Редактирование.\nПожалуйста введите полное имя:');
            userStates[chatId] = { step: 'change_name' };
        } else {
            bot.sendMessage(chatId, 'Такого пользователя не существует');
            const animationUrl = 'https://cdn.discordapp.com/attachments/1222666666308010124/1252576399487795271/ezgif.com-video-to-gif-converter.gif';
            bot.sendAnimation(chatId, animationUrl).catch(err => {
                console.error('Failed to send animation:', err);
            });
        }
    }
};
