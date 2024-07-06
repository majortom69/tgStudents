const path = require('path');
const { isUserTeacher } = require('../database');

module.exports = {
    pattern: /\/search/,
    execute: async (bot, msg) => {
        const chatId = msg.chat.id;
        delete userStates[chatId];
        const isTeacher = await isUserTeacher(chatId);
        if(!isTeacher) {
            bot.sendMessage(chatId, 'У вас нет прав');
            const animationPath = path.resolve(__dirname, '..', 'animations', 'ezgif.com-video-to-gif-converter.gif');
            bot.sendAnimation(chatId, animationPath).catch(err => {
                console.error('Failed to send animation:', err);
            });
            return
        }

        const options = {
            reply_markup: {
                inline_keyboard: [
                    [{ text: 'Вывод достижений определенного студента - ID', callback_data: 'search_id' }],
                    [{ text: 'Вывод достижений определенный группы - Group', callback_data: 'search_group' }],
                    [{ text: 'Поиск достижения по ID', callback_data: 'search_ach_id' }]
                ]
            }
        };

        bot.sendMessage(chatId, 'Выберите, что вы хотите найти', options);
    }
}