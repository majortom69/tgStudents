const commands = [  '/start - Приветствие и добавление reply кнопок',
                    '/register - Регистрация пользователя', 
                    '/upload - Загрузка достижения', 
                    '/update - Редактирование параметров пользователя',
                    '/myachiv - Просмотр, редактирование и удаление собственных достижений',
                    '/search - Поиск (команда для преподавателей)',
                    '🎫 - Просмотр информации о себе',
                    '❓ - Просмотр всех команд',
                    '📌 - Пингануть сервер',
                    '🆘 - Обратная связь с админестрацией',
                    '📁 - Просмотр комментариев от преподавателей'
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
