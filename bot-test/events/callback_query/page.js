const { getUserAchievements, getGroupAchievements, getAchievementById, deleteAchievement, updateAchievementComment } = require('../../database');
const { sendAchievementPage, sendAchievementPageByGroupId, sendAchievementPageByAchId } = require('../../utilit');

const PAGE_SIZE = 1;

module.exports = {
    callbackData: ['prev', 'next', 'delete', 'send_attachment', 'comment', 'confirm_delete'],
    execute: async (bot, callbackQuery) => {
        const chatId = callbackQuery.message.chat.id;
        const messageId = callbackQuery.message.message_id;
        const userState = global.userStates[chatId];

        if (!userState) {
            console.error('User state not found.');
            return;
        }

        const userId = userState.userId;
        const groupId = userState.groupId;
        const achId = userState.achId;

        let achievements;

        if (userId) {
            achievements = await getUserAchievements(userId);
        } else if (groupId) {
            achievements = await getGroupAchievements(groupId);
        } else if (achId) {
            achievements = await getAchievementById(achId);
        }else {
            console.error('Neither userId nor groupId provided.');
            return;
        }

        if (!Array.isArray(achievements)) {
            achievements = [achievements];
        }

        const query = callbackQuery;

        let currentPage = userState.page;
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
                        bot.answerCallbackQuery(query.id, { text: 'Вложения добавлены!' });
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
                        await bot.sendMessage(chatId, 'Вы уверены, что хотите удалить это достижение?', {
                            reply_markup: {
                                inline_keyboard: [
                                    [
                                        { text: 'Подтвердить', callback_data: 'confirm_delete' },
                                        { text: 'Отмена', callback_data: 'cancel' }
                                    ]
                                ]
                            }
                        });
                    } else {
                        throw new Error('Achievement not found.');
                    }
                } catch (error) {
                    console.error('Error initiating delete confirmation:', error);
                    bot.answerCallbackQuery(query.id, { text: 'Failed to initiate delete confirmation.' });
                }
            break;
            case 'confirm_delete':
                try {
                    if (currentAchievement) {
                        await deleteAchievement(currentAchievement.ACHIEVEMENT_ID); // удалить с БД
                        // Удалить с google sheets

                        await sendAchievementPage(bot, chatId, userId, currentPage, messageId);
                        bot.answerCallbackQuery(query.id, { text: 'Достижение удалено!' });
                    } else {
                        throw new Error('Achievement not found.');
                    }
                } catch (error) {
                    console.error('Error deleting achievement:', error);
                    bot.answerCallbackQuery(query.id, { text: 'Failed to delete achievement.' });
                }
            break;
            case 'comment':
                if(currentAchievement) {
                    bot.sendMessage(chatId, 'Введите комментарий к достижению:').then(() => {
                        bot.once('message', async (msg) => {
                            const comment = msg.text;
                            await updateAchievementComment(currentAchievement.ACHIEVEMENT_ID, comment);
                            bot.sendMessage(chatId, 'Комментарий добавлен!');
                        });
                });}
                break;
                /*
            case 'edit':
                try {
                    if (currentAchievement) {
                        const uploadResult = await upload.execute(bot, callbackQuery.message);
                        if (uploadResult === 'cancel') {
                            bot.answerCallbackQuery(query.id, { text: 'Редактирование достижения отменено.' });
                            return;
                        }        
                        await deleteAchievement(currentAchievement.ACHIEVEMENT_ID);
                        await bot.deleteMessage(chatId, messageId);        
                        bot.answerCallbackQuery(query.id, { text: 'Достижение отредактировано!' });
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
            if(userId) {
                await sendAchievementPage(bot, chatId, userId, currentPage, messageId);
            } else if(groupId) {
                await sendAchievementPageByGroupId(bot, chatId, groupId, currentPage, messageId);
            } else if(achId) {
                await sendAchievementPageByAchId(bot, chatId, achId, currentPage, messageId);
            }
        } catch (error) {
            bot.sendMessage(chatId, 'Error retrieving achievements. Please try again later.');
        }
        
        bot.answerCallbackQuery(query.id);
    }
};
