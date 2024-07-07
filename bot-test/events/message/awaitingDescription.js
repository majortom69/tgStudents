module.exports = {
    step: 'awaiting_description',
    execute: (bot, msg, userState) => {
        const chatId = msg.chat.id;
        userState.description = msg.text;
        userState.step = 'awaiting_file';
        bot.sendMessage(chatId, '🖼Пожалуйста, пришлите фотографию/файл для достижения.🖼');
    }
};
