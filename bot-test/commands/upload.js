const { checkUserExist, isUserTeacher } = require('../database');
const { sendUploadButtons } = require('../utilit');
const path = require('path');

module.exports = {
    pattern: /\/upload/,
    execute: async (bot, msg) => {
        const chatId = msg.chat.id;
        const animationPath = path.resolve(__dirname, '..', 'animations', 'ezgif.com-video-to-gif-converter.gif');
        
        const exists = await checkUserExist(chatId);
        const isTeacher = await isUserTeacher(chatId);
        if (!exists) {
            bot.sendMessage(chatId, 'Вы должны быть зарегистрированы!');
            bot.sendAnimation(chatId, animationPath).catch(err => {
                console.error('Failed to send animation:', err);
            });
        } else if(isTeacher) {
            bot.sendMessage(chatId, 'Вы должны быть студентом, чтобы загружать достижения!');
            const animationPath = path.resolve(__dirname, '..', 'animations', 'ezgif.com-video-to-gif-converter.gif');
            bot.sendAnimation(chatId, animationPath).catch(err => {
                console.error('Failed to send animation:', err);
            });
        } else {
            userStates[chatId] = { step: 'awaiting_title' };
            sendUploadButtons(bot,chatId);
        }
    }
};
