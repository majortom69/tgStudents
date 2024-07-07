const commands = [  '/register - Регистрация пользователя', 
                    '/upload - Загрузка достижения', 
                    '/update - Редактирование параметров пользователя',
                    '/myachiv - Просмотр, редактирование и удаление достижений',
                    '/search - Поиск (команда для преподавателей)'
];

module.exports = {
    pattern: /\/help/,
    execute: (bot, msg) => {
        const chatId = msg.chat.id;
        delete userStates[chatId];
        const availableCommands = commands.filter(cmd => cmd !== '/help');
        const response = `Доступные команды:\n${availableCommands.join('\n')}`;
        bot.sendMessage(chatId, response);
    }
};
