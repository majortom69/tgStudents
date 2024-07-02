const { deleteAchievement } = require('../../database');
const { getIndex } = require('./ach_movement');

module.exports = {
    callbackData: 'delete_ach',
    execute: (bot, callbackQuery) => {
        const chatId = callbackQuery.message.chat.id;
        const messageId = callbackQuery.message.message_id;

        const index = getIndex(chatId) + 1;

        // Попробуйте удалить достижение и обработать возможные ошибки
        try {
            deleteAchievement(index);
            bot.editMessageText(`Достижение ${index} успешно удалено`, {
                chat_id: chatId,
                message_id: messageId,
                reply_markup: { inline_keyboard: [] }
            }).catch(error => {
                console.error('Ошибка при редактировании сообщения:', error);
            });
        } catch (error) {
            console.error('Ошибка при удалении достижения:', error);
            bot.sendMessage(chatId, 'Произошла ошибка при удалении достижения.');
        }
    }
}
