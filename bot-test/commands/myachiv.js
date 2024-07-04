const path = require('path');
const { checkUserExist, getUserAchievements } = require('../database');
const { sendAchievementPage } = require('../utilit')


module.exports = {
    pattern: /\/myachiv/,
    execute: async (bot, msg) => {
        const chatId = msg.chat.id;
        const userId = msg.from.id;
        const animationPath = path.resolve(__dirname, '..', 'animations', 'ezgif.com-video-to-gif-converter.gif');
            

        const exists = await checkUserExist(chatId);
        if (!exists) {
            bot.sendMessage(chatId, 'Вы должны быть зарегистрированы');
            bot.sendAnimation(chatId, animationPath).catch(err => {
                console.error('Failed to send animation:', err);
            });
            return;
        }
        
        const achievements = await getUserAchievements(chatId);
        if (achievements.length === 0) {
            await bot.sendMessage(chatId, 'У пользователя нет достижений.');
            bot.sendAnimation(chatId, animationPath).catch(err => {
                console.error('Failed to send animation:', err);
            });
            return;
        }

        userStates[userId] = { page: 1 };
    
        try {
            await sendAchievementPage(bot, chatId, userId, userStates[userId].page);
        } catch (error) {
            console.log(`Fetching achievements for user: ${userId}, page: ${userStates[userId].page}`);
            bot.sendMessage(chatId, 'Error retrieving achievements. Please try again later.', error);
        }
    }
}

/*
module.exports = {
    pattern: /\/myachiv/,
    execute: async (bot, msg) => {
        const chatId = msg.chat.id;
        const exists = await checkUserExist(chatId);
        if (!exists) {
            bot.sendMessage(chatId, 'Вы должны быть зарегистрированы');
            const animationPath = path.resolve(__dirname, '..', 'animations', 'ezgif.com-video-to-gif-converter.gif');
            bot.sendAnimation(chatId, animationPath).catch(err => {
                console.error('Failed to send animation:', err);
            });
            return;
        }
        
        const achievements = await getUserAchievements(chatId);
        if (achievements.length === 0) {
            await bot.sendMessage(chatId, 'У пользователя нет достижений.');
            return;
        }

        const index = 0
        const achievement = achievements[index];

        const options = {
            reply_markup: {
                inline_keyboard: [
                    [
                        { text: '◀', callback_data: 'previous' },
                        { text: '▶', callback_data: 'following' }
                    ],
                    [{ text: 'Редактировать достижение', callback_data: 'edit_ach' }],
                    [{ text: 'Удалить достижение', callback_data: 'delete_ach' }]
                ]
            }
        };

        let message = `Категория: ${achievement.CATEGORY}\n`;
        message += `Название: ${achievement.TITLE}\n`;
        message += `Описание: ${achievement.DESCRIPTION}\n`;
        message += `Вложения:\n`;
        for (const attachment of achievement.ATTACHMENTS) {
            message += `${attachment}\n`;
        }

        await bot.sendMessage(chatId, message, options);
    }
};
*/