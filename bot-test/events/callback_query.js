

const fs = require('fs');
const path = require('path');

module.exports = {
    type: 'callback_query',
    execute: (bot, callbackQuery) => {
        const handlersDir = path.join(__dirname, 'callback_query');
        const handlerFiles = fs.readdirSync(handlersDir).filter(file => file.endsWith('.js'));

        for (const file of handlerFiles) {
            const handler = require(`./callback_query/${file}`);
            if (Array.isArray(handler.callbackData)) {
                if (handler.callbackData.includes(callbackQuery.data)) {
                    handler.execute(bot, callbackQuery);
                    return;
                }
            } else if (handler.callbackData === callbackQuery.data) {
                handler.execute(bot, callbackQuery);
                return;
            }
        }

        console.error('No handler found for callback data:', callbackQuery.data);
    }
};




// module.exports = {
//     type: 'callback_query',
//     execute: (bot, callbackQuery) => {
//         const chatId = callbackQuery.message.chat.id;
//         const messageId = callbackQuery.message.message_id;
//         const data = callbackQuery.data;

//         // Handle callback query logic here
//         if (data === 'cancel') {
//             delete userStates[chatId];
//             bot.editMessageText('Действие отменено', {
//                 chat_id: chatId,
//                 message_id: messageId,
//                 reply_markup: { inline_keyboard: [] }
//             }).catch(error => {
//                 console.error('Ошибка при редактировании сообщения:', error);
//             });
//             return;
//         }

//         if (data === 'scientific' || data === 'sport' || data === 'cultural' || data === 'other') {
//             userStates[chatId] = { step: 'awaiting_title', category: data };
//             const options = {
//                 reply_markup: {
//                     inline_keyboard: [
//                         [{ text: 'Назад', callback_data: 'back_title' }]
//                     ]
//                 }
//             };
//             bot.editMessageText('Пожалуйста введите название достижения:', {
//                 chat_id: chatId,
//                 message_id: messageId,
//                 reply_markup: options.reply_markup
//             }).then(() => {
//                 userStates[chatId].lastMessageId = messageId;
//             });
//         } else if (data === 'back_title') {
//             userStates[chatId] = {};
//             const options = {
//                 reply_markup: {
//                     inline_keyboard: [
//                         [{ text: '🧬Научное🧬', callback_data: 'scientific' }],
//                         [{ text: '🏆Спортивное🏆', callback_data: 'sport' }],
//                         [{ text: '🎭Культурная🎭', callback_data: 'cultural' }],
//                         [{ text: '❓Другое❓', callback_data: 'other' }],
//                         [{ text: 'Отмена', callback_data: 'cancel' }]
//                     ]
//                 }
//             };
//             bot.editMessageText('Выберите категорию достижения:', {
//                 chat_id: chatId,
//                 message_id: messageId,
//                 reply_markup: options.reply_markup
//             });
//         }

//         if (data === 'student') {
//             userStates[chatId] = { step: 'awaiting_name', role: data };
//             const options = {
//                 reply_markup: {
//                     inline_keyboard: [
//                         [{ text: 'Назад', callback_data: 'back' }]
//                     ]
//                 }
//             };
//             bot.editMessageText('Пожалуйста введите полное имя студента:', {
//                 chat_id: chatId,
//                 message_id: messageId,
//                 reply_markup: options.reply_markup
//             }).then(() => {
//                 userStates[chatId].lastMessageId = messageId;
//             });
//         } else if (data === 'teacher') {
//             userStates[chatId] = { step: 'awaiting_password', role: data };
//             const options = {
//                 reply_markup: {
//                     inline_keyboard: [
//                         [{ text: 'Назад', callback_data: 'back' }]
//                     ]
//                 }
//             };
//             bot.editMessageText('Пожалуйста введите пароль для преподавателя:', {
//                 chat_id: chatId,
//                 message_id: messageId,
//                 reply_markup: options.reply_markup
//             }).then(() => {
//                 userStates[chatId].lastMessageId = messageId;
//             });
//         } else if (data === 'back') {
//             userStates[chatId] = {};
//             const options = {
//                 reply_markup: {
//                     inline_keyboard: [
//                         [{ text: 'Студент', callback_data: 'student' }],
//                         [{ text: 'Преподаватель', callback_data: 'teacher' }]
//                     ]
//                 }
//             };
//             bot.editMessageText('Пожалуйста выберите роль:', {
//                 chat_id: chatId,
//                 message_id: messageId,
//                 reply_markup: options.reply_markup
//             });
//         }
//     }
// };
