const path = require('path');
const { sendAchievementPageByAchId } = require('../../utilit');
const { getAchievementById } = require('../../database');

module.exports = {
    step: 'awaiting_ach_id',
    execute: async (bot, msg) => {
        const chatId = msg.chat.id;
        const achId = msg.text;
        const animationPath = path.resolve(__dirname, '..', 'animations', 'ezgif.com-video-to-gif-converter.gif');

        try {
            const achievements = await getAchievementById(achId);
            if (achievements.length === 0) {
                await bot.sendMessage(chatId, '⚠️У пользователя нет достижений.⚠️');
                await bot.sendAnimation(chatId, animationPath);
                return;
            }

            global.userStates[chatId] = { achId: achId, page: 1 };

            await sendAchievementPageByAchId(bot, chatId, achId, global.userStates[chatId].page);
        } catch (error) {
            console.error('Error executing command:', error);
            await bot.sendMessage(chatId, '🆘Пожалуйста, повторите попытку позже или свяжитесь с администраторами🆘.');
        }
    }
};