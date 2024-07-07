const { getUserAchievements, editAchievement } = require('../../database');
const { sendUploadButtons, handleImageMessage } = require('../../utilit');

module.exports = {
    callbackData: 'edit',
    execute: async (bot, callbackQuery) => {
        const chatId = callbackQuery.message.chat.id;
        const messageId = callbackQuery.message.message_id;
        const data = callbackQuery.data;

        // Проверяем, что userStates[chatId] существует и инициализируем, если нет
        if (!userStates[chatId]) {
            userStates[chatId] = {};
        }

        // Проверяем, что userStates[chatId].page существует и инициализируем, если нет
        if (!userStates[chatId].page) {
            userStates[chatId].page = 1; // Например, инициализируем первой страницей
        }
        
        let currentPage = userStates[chatId].page;

        const achievements = await getUserAchievements(chatId);
        let currentAchievement = achievements[currentPage - 1];

        if (data === 'edit') {
            const options = {
                reply_markup: {
                    inline_keyboard: [
                        [{ text: '🏆Изменить категорию достижения🏆', callback_data: 'edit_category' }],
                        [{ text: '🏆Изменить название достижения🏆', callback_data: 'edit_title' }],
                        [{ text: '🏆Изменить описание достижения🏆', callback_data: 'edit_description' }],
                        [{ text: '📎Изменить вложение📎', callback_data: 'edit_image' }],
                        [{ text: '❌Отмена❌', callback_data: 'cancel' }]
                    ]
                }
            };

            bot.editMessageText('Ваш выбор:', {
                chat_id: chatId,
                message_id: messageId,
                reply_markup: options.reply_markup
            }).then(() => {
                userStates[chatId].lastMessageId = messageId;
            }).catch((error) => {
                if (error.response.body.error_code === 400 && error.response.body.description.includes('message is not modified')) {
                    console.log('Message is not modified, ignoring error.');
                } else {
                    console.error('Error updating message:', error);
                }
            });
        }

        const removeEditListeners = () => {
            bot.removeListener('message', editTitleListener);
            bot.removeListener('message', editDescriptionListener);
            bot.removeListener('message', handleImageResponse);
            bot.removeListener('callback_query', handleImageResponse);
        };

        const editTitleListener = async (newMsg) => {
            if (newMsg.text) {
                currentAchievement.TITLE = newMsg.text;
                await editAchievement(currentAchievement, currentAchievement.ACHIEVEMENT_ID);
                bot.sendMessage(chatId, '🎉Название успешно обновлено!🎉');
                removeEditListeners();
            } else {
                console.log('Error: No message text provided for editing category.');
            }
        };

        const editDescriptionListener = async (newMsg) => {
            if (newMsg.text) {
                currentAchievement.DESCRIPTION = newMsg.text;
                await editAchievement(currentAchievement, currentAchievement.ACHIEVEMENT_ID);
                bot.sendMessage(chatId, '🎉Описание обновлено успешно!🎉');
                removeEditListeners();
            } else {
                console.log('Error: No message text provided for editing category.');
            }
        };

        const handleImageResponse = async (msg) => {
            if (msg.text === 'Отмена' || (msg.callback_query && msg.callback_query.data === 'cancel_image')) {
                bot.sendMessage(chatId, 'Действие отменено.');
                userStates[chatId].step = null;
                removeEditListeners();
                return;
            }

            // Проверяем, что userStates[chatId] определен перед доступом к его свойству step
            if (userStates[chatId] && userStates[chatId].step === 'awaiting_edit_image') {
                await handleImageMessage(bot, msg, userStates, chatId, currentAchievement);
                bot.sendMessage(chatId, '🎉Фотографии обновлены успешно!🎉');
                removeEditListeners();
            }
        };

        switch (data) {
            case 'edit_category':
                removeEditListeners();
                if (userStates[chatId].lastMessageId) {
                    bot.deleteMessage(chatId, userStates[chatId].lastMessageId).catch((err) => {
                        console.error('Failed to delete message:', err);
                    });
                }
                sendUploadButtons(bot, chatId);

                bot.once('callback_query', async (categoryCallbackQuery) => {
                    const categoryData = categoryCallbackQuery.data;

                        if (['scientific', 'sports', 'cultural', 'other'].includes(categoryData)) {
                            currentAchievement.CATEGORY = categoryData;
                            await editAchievement(currentAchievement, currentAchievement.ACHIEVEMENT_ID);

                    } else if (categoryData === 'cancel') {
                        // Действие отменено, обработка
                    }
                });
                break;
            case 'edit_title':
                removeEditListeners();
                bot.editMessageText('🏆Введите новое название достиженя:', {
                    chat_id: chatId,
                    message_id: messageId,
                    reply_markup: { inline_keyboard: [] }
                }).then(() => {
                    bot.on('message', editTitleListener);
                });
                break;
            case 'edit_description':
                removeEditListeners();
                bot.editMessageText('🏆Введите новое описание достиженя:', {
                    chat_id: chatId,
                    message_id: messageId,
                    reply_markup: { inline_keyboard: [] }
                }).then(() => {
                    bot.on('message', editDescriptionListener);
                });
                break;
            case 'edit_image':
                removeEditListeners();
                /*if (userStates[chatId].lastMessageId) {
                    bot.deleteMessage(chatId, userStates[chatId].lastMessageId).catch((err) => {
                        console.error('Failed to delete message:', err);
                    });
                }
            
                bot.sendMessage(chatId, 'Отправьте изображение для достижения').then((sentMsg) => {
                    userStates[chatId].lastMessageId = sentMsg.message_id;
            
                    bot.once('message', async (msg) => {
                        await handleImageMessage(bot, msg, userStates, currentAchievement);
                    });
                }).catch((err) => {
                    console.error('Failed to send message:', err);
                });
                */
                userStates[chatId].step = 'awaiting_edit_image';
                bot.sendMessage(chatId, '📎Пожалуйста, отправьте новые фотографии для достижения.');
                break;
            default:
                break;
        }
    }
};