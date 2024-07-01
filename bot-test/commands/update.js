const { checkUserExist } = require('../database');
const path = require('path');

module.exports = {
    pattern: /\/update/,
    execute: async (bot, msg) => {
        const chatId = msg.chat.id;
        const exists = await checkUserExist(chatId);
        if (exists) {
            bot.sendMessage(chatId, 'Редактирование.\nПожалуйста, введите полное имя:');
            userStates[chatId] = { step: 'change_name' };
        } else {
            bot.sendMessage(chatId, 'Вы должны быть зарегистрированы');
            const animationPath = path.resolve(__dirname, '..', 'animations', 'ezgif.com-video-to-gif-converter.gif');
            bot.sendAnimation(chatId, animationPath).catch(err => {
                console.error('Failed to send animation:', err);
            });
        }
    }
};
