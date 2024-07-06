const path = require('path');
const { sendAchievementPage } = require('../../utilit');
const { checkUserExist, getUserAchievements } = require('../../database');

module.exports = {
    step: 'awaitin_student_id',
    execute: async (bot, msg) => {
        const chatId = msg.chat.id;
        const userId = msg.text;
        const animationPath = path.resolve(__dirname, '..', 'animations', 'ezgif.com-video-to-gif-converter.gif');

        try {
            const exists = await checkUserExist(userId);
            if (!exists) {
                await bot.sendMessage(chatId, 'Нет такого пользователя.');
                await bot.sendAnimation(chatId, animationPath);
                return;
            }

            const achievements = await getUserAchievements(userId);
            if (achievements.length === 0) {
                await bot.sendMessage(chatId, 'У пользователя нет достижений.');
                await bot.sendAnimation(chatId, animationPath);
                return;
            }

            global.userStates[chatId] = { userId: userId, page: 1 };

            await sendAchievementPage(bot, chatId, userId, global.userStates[chatId].page);
        } catch (error) {
            console.error('Error executing command:', error);
            await bot.sendMessage(chatId, 'Произошла ошибка при обработке запроса. Пожалуйста, попробуйте позже.');
        }
    }
};