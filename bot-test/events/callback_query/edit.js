const { getUserAchievements, editAchievement } = require('../../database');

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

        // Uncomment the following line once input handling is defined
        // await editAchievement(currentAchievement, currentAchievement.ACHIEVEMENT_ID);

        if (data === 'edit') {
            const options = {
                reply_markup: {
                    inline_keyboard: [
                        [{ text: 'Изменить категорию достижения', callback_data: 'edit_category' }],
                        [{ text: 'Изменить название достижения', callback_data: 'edit_title' }],
                        [{ text: 'Изменить описание достижения', callback_data: 'edit_description' }],
                        [{ text: 'Изменить вложение', callback_data: 'edit_image' }],
                        [{ text: 'Отмена', callback_data: 'cancel' }]
                    ]
                }
            };

            bot.editMessageText('Ваш выбор:', {
                chat_id: chatId,
                message_id: messageId,
                reply_markup: options.reply_markup
            }).then(() => {
                userStates[chatId].lastMessageId = messageId;
            });
        }

        switch (data) {
            case 'edit_category':
                bot.sendMessage(chatId, 'Введите новую категорию достижения:').then((sentMsg) => {
                    bot.on('message', async (newMsg) => {
                        if (newMsg.text) {
                            currentAchievement.CATEGORY = newMsg.text;
                            await editAchievement(currentAchievement, currentAchievement.ACHIEVEMENT_ID);

                            bot.editMessageText('Категория достижения успешно изменена!', {
                                chat_id: chatId,
                                message_id: sentMsg.message_id
                            }).catch((error) => {
                                console.error('Error updating message:', error);
                            });
                        } else {
                            console.log('Error: No message text provided for editing category.');
                        }
                    });
                });
                break;
            case 'edit_title':
                // Handle editing of title
                break;
            case 'edit_description':
                // Handle editing of description
                break;
            case 'edit_image':
                // Handle editing of image
                break;
            default:
                break;
        }
    }
};
