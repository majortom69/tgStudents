module.exports = {
    step: 'awaiting_title',
    execute: (bot, msg, userState) => {
        const chatId = msg.chat.id;
        userState.title = msg.text; 
        bot.deleteMessage(chatId, userState.lastMessageId);
        userState.step = 'awaiting_description';
        bot.sendMessage(chatId, '🏆Пожалуйста, отправьте описание достижения.🏆');
    }
};
