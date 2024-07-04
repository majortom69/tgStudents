const { getUserAchievements, deleteAchievement } = require('../../database');
const { sendAchievementPage } = require('../../utilit');

module.exports = {
    callbackData: ['prev', 'next', 'delete', 'send_attachment', 'edit'],
    execute: async (bot, callbackQuery) => {
        const chatId = callbackQuery.message.chat.id;
        const messageId = callbackQuery.message.message_id;
        const userId = chatId;
        const query = callbackQuery;

        if (!userStates[userId]) return;

        let currentPage = userStates[userId].page;

        const achievements = await getUserAchievements(userId);
        const totalPages = Math.ceil(achievements.length / 1);

        if (query.data.startsWith('prev') && currentPage > 1) {
            currentPage--;
        } else if (query.data.startsWith('next') && currentPage < totalPages) {
            currentPage++;
        } else if (query.data.startsWith('send_attachment')) {
            const currentPage = global.userStates[userId].page; // Получаем текущую страницу из состояния пользователя
            const achievementToSendAttachment = achievements[currentPage - 1]; // currentPage - 1, так как индексы начинаются с 0
        
            // Остальная логика отправки вложений
            if (achievementToSendAttachment.ATTACHMENTS.length > 0) {
                let attachmentMessage = `Attachments for ${achievementToSendAttachment.TITLE}:\n`;
                let attachmentFiles = achievementToSendAttachment.ATTACHMENTS.map((attachment, index) => ({
                    type: 'document',
                    media: attachment,
                    caption: index === 0 ? attachmentMessage : '' // Add caption only to the first attachment
                }));
        
                try {
                    await bot.sendMediaGroup(chatId, attachmentFiles);
                } catch (error) {
                    console.error('Error sending attachments:', error);
                }
            }
        
            // Acknowledge the callback immediately
            bot.answerCallbackQuery(query.id, { text: 'Attachment sent!' });
        }
        else if (query.data.startsWith('delete')) {
            const currentPage = global.userStates[userId].page; // Получаем текущую страницу из состояния пользователя
            const achievementToDelete = achievements[currentPage - 1]; // currentPage - 1, так как индексы начинаются с 0
        
            // Остальная логика удаления ачивмента и обновления страницы
            try {
                await deleteAchievement(achievementToDelete.ACHIEVEMENT_ID);
                await sendAchievementPage(bot, chatId, userId, currentPage, messageId);
                bot.answerCallbackQuery(query.id, { text: 'Achievement deleted!' });
            } catch (error) {
                console.error('Error deleting achievement:', error);
                bot.answerCallbackQuery(query.id, { text: 'Failed to delete achievement.' });
            }
        }
        

        userStates[userId].page = currentPage;

        try {
            await sendAchievementPage(bot, chatId, userId, currentPage, messageId);
        } catch (error) {
            bot.sendMessage(chatId, 'Error retrieving achievements. Please try again later.');
        }

        // Acknowledge the callback
        bot.answerCallbackQuery(query.id);
    }
};