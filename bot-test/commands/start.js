const help = require('./help');

module.exports = {
    pattern: /\/start/,
    execute: async (bot, msg) => {
        const chatId = msg.chat.id;

        // Выполнение команды /help и получение её ответа
        let helpMessage = '';
        const mockBot = {
            sendMessage: (id, text) => {
                if (id === chatId) {
                    helpMessage = text;
                }
            }
        };

        help.execute(mockBot, { chat: { id: chatId } });

        bot.sendMessage(chatId,
        `📚 Добро пожаловать в Бота для сбора и каталогизации информации о достижениях студентов! 📚

        Этот бот помогает вам собирать и оценивать достижения студентов.
            
        ${helpMessage}
            
        Если вам нужна помощь, введите /help.`
        );
    }
};
