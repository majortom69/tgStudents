const { createUser } = require('../../database');

module.exports = {
    step: 'awaiting_name',
    execute: (bot, msg, userState) => {
        const chatId = msg.chat.id;
        userState.name = msg.text;
        bot.deleteMessage(chatId, userState.lastMessageId);

        if (userState.role === 'student') {
            userState.step = 'awaiting_group';
            bot.sendMessage(chatId, 'Пожалуйста введите вашу группу (например, 1488К или М249).');
        } else {
            // Save teacher data
            const teacher = {
                userId: chatId,
                role: userState.role,
                name: userState.name
            };
            console.log('Teacher registered:', teacher);
            createUser(teacher);
            bot.sendMessage(chatId, 'Вы успешно зарегистрированы как преподаватель.');
            // Clear the user state
            delete userStates[chatId];
        }
    }
};
