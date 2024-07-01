const commands = [  '/register - Регистрация пользователя', 
                    '/upload - Загрузка достижения', 
                    '/update - Редактирование имени пользователя'
];

module.exports = {
    pattern: /\/help/,
    execute: (bot, msg) => {
        const chatId = msg.chat.id;
        const availableCommands = commands.filter(cmd => cmd !== '/help');
        const response = `Доступные команды:\n${availableCommands.join('\n')}`;
        bot.sendMessage(chatId, response);
    }
};
