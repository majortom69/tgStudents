const path = require('path');
const { sendAchievementPageByGroupId } = require('../../utilit');
const { checkGroupExist, getGroupAchievements } = require('../../database');

module.exports = {
    step: 'awaiting_group_id',
    execute: async (bot, msg) => {
        const chatId = msg.chat.id;
        const groupId = msg.text;
        const animationPath = path.resolve(__dirname, '..', 'animations', 'ezgif.com-video-to-gif-converter.gif');

        try {
            const exists = await checkGroupExist(groupId);
            if (!exists) {
                await bot.sendMessage(chatId, '⚠️Нет такой группы⚠️.');
                await bot.sendAnimation(chatId, animationPath);
                return;
            }

            const achievements = await getGroupAchievements(groupId);
            if (achievements.length === 0) {
                await bot.sendMessage(chatId, '⚠️У группы нет достижений⚠️.');
                await bot.sendAnimation(chatId, animationPath);
                return;
            }

            global.userStates[chatId] = { groupId: groupId, page: 1 };

            await sendAchievementPageByGroupId(bot, chatId, groupId, global.userStates[chatId].page);
        } catch (error) {
            console.error('Error executing command:', error);
            await bot.sendMessage(chatId, '🆘Пожалуйста, повторите попытку позже или свяжитесь с администраторами.🆘');
        }
    }
};