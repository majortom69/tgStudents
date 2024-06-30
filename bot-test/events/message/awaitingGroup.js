const { createUser } = require('../../database');

module.exports = {
    step: 'awaiting_group',
    execute: (bot, msg, userState) => {
        const chatId = msg.chat.id;
        userState.group = msg.text;

        // Save student data
        const student = {
            userId: chatId,
            role: userState.role,
            name: userState.name,
            group: userState.group
        };
        console.log('Student registered:', student);
        createUser(student);
        bot.sendMessage(chatId, 'Вы успешно зарегистрированы как студент.');
        // Clear the user state
        delete userStates[chatId];
    }
};
