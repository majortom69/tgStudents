const { updateUserName } = require('../../database');

module.exports = {
    step: 'change_name',
    execute: (bot, msg, userState) => {
        const chatId = msg.chat.id;
        userState.name = msg.text;
        updateUserName(chatId, userState.name);
    }
};
