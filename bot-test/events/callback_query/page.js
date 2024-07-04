const { getUserAchievements, deleteAchievement } = require('../../database');
const upload = require('../../commands/upload')
const { sendAchievementPage } = require('../../utilit');

const PAGE_SIZE = 1;

module.exports = {
    callbackData: ['prev', 'next', 'delete', 'send_attachment', 'edit'],
    execute: async (bot, callbackQuery) => {
        const chatId = callbackQuery.message.chat.id;
        const messageId = callbackQuery.message.message_id;
        const userId = chatId;
        const query = callbackQuery;
        const userState = global.userStates[userId];

        if (!userState) return;

        let currentPage = userState.page;
        const achievements = await getUserAchievements(userId);
        const totalPages = Math.ceil(achievements.length / PAGE_SIZE);

        let currentAchievement = achievements[currentPage - 1];

        switch (query.data) {
            case 'prev':
                if (currentPage > 1) currentPage--;
                break;
            case 'next':
                if (currentPage < totalPages) currentPage++;
                break;
            case 'send_attachment':
                if (currentAchievement && currentAchievement.ATTACHMENTS.length > 0) {
                    const attachmentFiles = currentAchievement.ATTACHMENTS.map((attachment, index) => ({
                        type: 'document',
                        media: attachment,
                        caption: index === 0 ? `Attachments for ${currentAchievement.TITLE}:\n` : ''
                    }));
                    try {
                        await bot.sendMediaGroup(chatId, attachmentFiles);
                        bot.answerCallbackQuery(query.id, { text: 'Attachment sent!' });
                    } catch (error) {
                        console.error('Error sending attachments:', error);
                    }
                } else {
                    bot.answerCallbackQuery(query.id, { text: 'No attachments available.' });
                }
                break;
            case 'delete':
                try {
                    if (currentAchievement) {
                        await deleteAchievement(currentAchievement.ACHIEVEMENT_ID);
                        await sendAchievementPage(bot, chatId, userId, currentPage, messageId);
                        bot.answerCallbackQuery(query.id, { text: 'Achievement deleted!' });
                    } else {
                        throw new Error('Achievement not found.');
                    }
                } catch (error) {
                    console.error('Error deleting achievement:', error);
                    bot.answerCallbackQuery(query.id, { text: 'Failed to delete achievement.' });
                }
                break;
            case 'edit':
                const options = {
                    reply_markup: {
                        inline_keyboard: [
                            [{ text: 'Изменить категорию достижения', callback_data: `edit_category:${currentPage}` }],
                            [{ text: 'Изменить название достижения', callback_data: `edit_title:${currentPage}` }],
                            [{ text: 'Изменить описание достижения', callback_data: `edit_description:${currentPage}` }],
                            [{ text: 'Изменить вложение', callback_data: `edit_image:${currentPage}` }],
                            [{ text: 'Отмена', callback_data: `cancel` }]
                        ]
                    }
                };
                await bot.editMessageText('Что вы хотите отредактировать?', {
                    chat_id: chatId,
                    message_id: messageId,
                    reply_markup: options.reply_markup
                }).then(() => {
                    userStates[chatId].lastMessageId = messageId;
                });
                return;
                /*
            case 'edit':
                try{
                    if(currentAchievement) {
                        await upload.execute(bot, callbackQuery.message);
                        await deleteAchievement(currentAchievement.ACHIEVEMENT_ID);
                        bot.answerCallbackQuery(query.id, { text: 'Достижение отредактировано!' });
                    } else {
                        throw new Error('Achievement not found.');
                    }
                } catch (error){
                    console.error('Error editing achievement:', error);
                }
                break;
                */
                /*
            case 'edit':
                try {
                    if (currentAchievement) {
                        await editAchievement(currentAchievement, currentAchievement.ACHIEVEMENT_ID);
                        // Handle editing logic
                        bot.answerCallbackQuery(query.id, { text: 'Achievement edited!' });
                    } else {
                        throw new Error('Achievement not found.');
                    }
                } catch (error) {
                    console.error('Error editing achievement:', error);
                }
                break;
                */
            default:
                break;
        }

        userState.page = currentPage;

        try {
            await sendAchievementPage(bot, chatId, userId, currentPage, messageId);
        } catch (error) {
            bot.sendMessage(chatId, 'Error retrieving achievements. Please try again later.');
        }

        bot.answerCallbackQuery(query.id);
    }
};
