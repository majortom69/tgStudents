const { getUserAchievements, getGroupAchievements, getAchievementById, deleteAchievement, updateAchievementComment,  } = require('../../database');
const { sendAchievementPage, sendAchievementPageByGroupId, sendAchievementPageByAchId, uveGotComment } = require('../../utilit');

const {removeAchievementFromSheet} = require('../../googleSheets');
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
                        bot.answerCallbackQuery(query.id, { text: '🎉Вложения добавлены!🎉' });
                    } catch (error) {
                        console.error('Error sending attachments:', error);
                    }
                } else {
                    bot.answerCallbackQuery(query.id, { text: '⚠️Вложения недоступны.⚠️' });
                }
                break;
            case 'delete':
                try {
                    if (currentAchievement) {
                        await bot.sendMessage(chatId, 'Вы уверены, что хотите удалить это достижение?', {
                            reply_markup: {
                                inline_keyboard: [
                                    [
                                        { text: '✅Подтвердить✅', callback_data: 'confirm_delete' },
                                        { text: '❌Отмена❌', callback_data: 'cancel' }
                                    ]
                                ]
                            }
                        });
                    } else {
                        throw new Error('Achievement not found.');
                    }
                } catch (error) {
                    console.error('Error initiating delete confirmation:', error);
                    bot.answerCallbackQuery(query.id, { text: '⚠️Не удалось подтвердить удаление.⚠️' });
                }
            break;
            case 'confirm_delete':
                try {
                    if (currentAchievement) {

                        removeAchievementFromSheet(currentAchievement.ACHIEVEMENT_ID)// Удалить с google sheets
                        await deleteAchievement(currentAchievement.ACHIEVEMENT_ID); // удалить с БД
                        

                        await sendAchievementPage(bot, chatId, userId, currentPage, messageId);
                        bot.answerCallbackQuery(query.id, { text: '🎉Достижение удалено!🎉' });
                    } else {
                        throw new Error('Achievement not found.');
                    }
                } catch (error) {
                    console.error('Error deleting achievement:', error);
                    bot.answerCallbackQuery(query.id, { text: '⚠️Не удалось удалить достижение.⚠️' });
                }
            break;
            case 'comment':
                if (currentAchievement) {
                    bot.sendMessage(chatId, 'Введите комментарий к достижению:').then(() => {
                        bot.once('message', async (msg) => {
                            const comment = msg.text;
                            const currentDate = new Date().toLocaleString('en-GB', { timeZone: 'Europe/Moscow', hour12: false }).replace(',', ''); // Get current date in Moscow time
                            await updateAchievementComment(currentAchievement.ACHIEVEMENT_ID, comment, currentDate);
                            currentAchievement.COMMENT = comment;
                            currentAchievement.ACHIEVEMENT_DATE = currentDate;
                            bot.sendMessage(chatId, '🎉Комментарий добавлен!🎉');
                            await uveGotComment(bot, chatId, currentAchievement);
                        });
                    });
                }
                break;
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
            bot.sendMessage(chatId, '⚠️Не удалось выслать достижения. Пожалуйста, повторите попытку позже или свяжитесь с администраторами.⚠️');
        }
        
        bot.answerCallbackQuery(query.id);
    }
};
