const { getUserAchievements, editAchievement } = require('../../database');
const { sendUploadButtons, handleImageMessage } = require('../../utilit');

module.exports = {
    callbackData: 'edit',
    execute: async (bot, callbackQuery) => {
        const chatId = callbackQuery.message.chat.id;
        const messageId = callbackQuery.message.message_id;
        const data = callbackQuery.data;

        // Check and initialize user state
        if (!userStates[chatId]) {
            userStates[chatId] = {};
        }

        // Check and initialize page in user state
        if (!userStates[chatId].page) {
            userStates[chatId].page = 1;
        }

        let currentPage = userStates[chatId].page;

        // Fetch achievements for the user
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

            // Edit the message to show options
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

            // Delete previous message with buttons
            if (userStates[chatId].lastMessageId) {
                bot.deleteMessage(chatId, userStates[chatId].lastMessageId).catch((err) => {
                    console.error('Failed to delete message:', err);
                });
            }
        }

        // Function to remove listeners
        const removeEditListeners = () => {
            bot.removeListener('message', editTitleListener);
            bot.removeListener('message', editDescriptionListener);
            bot.removeListener('message', handleImageResponse);
            bot.removeListener('callback_query', handleImageResponse);
        };

        // Listener for editing title
        const editTitleListener = async (newMsg) => {
            if (newMsg.text) {
                currentAchievement.TITLE = newMsg.text;
                await editAchievement(currentAchievement, currentAchievement.ACHIEVEMENT_ID);
                bot.sendMessage(chatId, '🎉Название успешно обновлено!🎉');
                removeEditListeners();
            } else {
                console.log('Error: No message text provided for editing title.');
            }
        };

        // Listener for editing description
        const editDescriptionListener = async (newMsg) => {
            if (newMsg.text) {
                currentAchievement.DESCRIPTION = newMsg.text;
                await editAchievement(currentAchievement, currentAchievement.ACHIEVEMENT_ID);
                bot.sendMessage(chatId, '🎉Описание обновлено успешно!🎉');
                removeEditListeners();
            } else {
                console.log('Error: No message text provided for editing description.');
            }
        };

        // Listener for handling image response
        const handleImageResponse = async (msg) => {
            if (msg.text === 'Отмена' || (msg.callback_query && msg.callback_query.data === 'cancel_image')) {
                bot.sendMessage(chatId, 'Действие отменено.');
                userStates[chatId].step = null;
                removeEditListeners();
                return;
            }

            // Check if user is awaiting edit image
            if (userStates[chatId] && userStates[chatId].step === 'awaiting_edit_image') {
                await handleImageMessage(bot, msg, userStates, chatId, currentAchievement);
                bot.sendMessage(chatId, '🎉Фотографии обновлены успешно!🎉');
                removeEditListeners();
            }
        };

        // Switch statement to handle different edit actions
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
                        // Handle cancellation
                    }
                });
                break;
            case 'edit_title':
                removeEditListeners();
                bot.editMessageText('🏆Введите новое название достижения:', {
                    chat_id: chatId,
                    message_id: messageId,
                    reply_markup: { inline_keyboard: [] }
                }).then(() => {
                    bot.on('message', editTitleListener);
                });
                break;
            case 'edit_description':
                removeEditListeners();
                bot.editMessageText('🏆Введите новое описание достижения:', {
                    chat_id: chatId,
                    message_id: messageId,
                    reply_markup: { inline_keyboard: [] }
                }).then(() => {
                    bot.on('message', editDescriptionListener);
                });
                break;
            case 'edit_image':
                removeEditListeners();
                userStates[chatId].step = 'awaiting_edit_file';
                bot.sendMessage(chatId, '📎Пожалуйста, отправьте новые вложения для достижения.');
                break;
            default:
                break;
        }
    }
};
