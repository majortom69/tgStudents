module.exports = {
    step: 'awaiting_password',
    execute: (bot, msg, userState) => {
        const chatId = msg.chat.id;
        const password = msg.text;

        if (password === '123') {
            bot.deleteMessage(chatId, userState.lastMessageId);
            userState.step = 'awaiting_name';
            bot.sendMessage(chatId, 'Пароль подтверждён.\nПожалуйста введите полное имя преподавателя:');
        } else {
            bot.sendMessage(chatId, 'Неверный пароль. Пожалуйста, попробуйте снова.');
        }
    }
};
