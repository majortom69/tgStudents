const { checkUserExist } = require('../database');
const path = require('path');

module.exports = {
    pattern: /\/update/,
    execute: async (bot, msg) => {
        const chatId = msg.chat.id;
        delete userStates[chatId];
        const exists = await checkUserExist(chatId);
        if (exists) {
            const options = {
                reply_markup: {
                    inline_keyboard: [
                        [{ text: 'Изменить имя', callback_data: 'set_name'}],
                        [{ text: 'Изменить роль(Студент/преподаватель)', callback_data: 'set_role'}],
                        [{ text: 'Изменить студенческую группу', callback_data: 'set_student_group'}],
                        [{ text: '❌Отмена❌', callback_data: 'cancel' }]
                    ]
                }
            };
            bot.sendMessage(chatId, 'Ваш выбор:', options);
        } else {
            bot.sendMessage(chatId, '🚨Вы должны быть зарегистрированы!🚨');
            const animationPath = path.resolve(__dirname, '..', 'animations', 'ezgif.com-video-to-gif-converter.gif');
            bot.sendAnimation(chatId, animationPath).catch(err => {
                console.error('Failed to send animation:', err);
            });
        }
    }
};
