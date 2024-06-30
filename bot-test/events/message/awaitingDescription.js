module.exports = {
    step: 'awaiting_description',
    execute: (bot, msg, userState) => {
        const chatId = msg.chat.id;
        userState.description = msg.text;
        userState.step = 'awaiting_image';
        bot.sendMessage(chatId, 'Please send an image for the achievement.');
    }
};
