const path = require('path');
const { checkUserExist, getUserAchievements } = require('../database');
const { sendAchievementPage } = require('../utilit')


module.exports = {
    pattern: /\/myachiv/,
    execute: async (bot, msg) => {
        const chatId = msg.chat.id;
        delete userStates[chatId];
        const userId = msg.from.id;
        const animationPath = path.resolve(__dirname, '..', 'animations', 'ezgif.com-video-to-gif-converter.gif');
            

        const exists = await checkUserExist(chatId);
        if (!exists) {
            bot.sendMessage(chatId, '🚨Вы должны быть зарегистрированы!🚨');
            bot.sendAnimation(chatId, animationPath).catch(err => {
                console.error('Failed to send animation:', err);
            });
            return;
        }
        
        const achievements = await getUserAchievements(chatId);
        if (achievements.length === 0) {
            await bot.sendMessage(chatId, '🚨У пользователя нет достижений!🚨');
            bot.sendAnimation(chatId, animationPath).catch(err => {
                console.error('Failed to send animation:', err);
            });
            return;
        }

        //userStates[userId] = { page: 1 };
        global.userStates[chatId] = { userId: userId, page: 1 };
    
        try {
            await sendAchievementPage(bot, chatId, userId, userStates[userId].page);
        } catch (error) {
            console.log(`Fetching achievements for user: ${userId}, page: ${userStates[userId].page}`);
            bot.sendMessage(chatId, '⚠️Не удалось получить достижения. Пожалуйста, повторите попытку позже или свяжитесь с администраторами.⚠️', error);
        }
    }
}