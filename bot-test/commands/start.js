const help = require('./help');

module.exports = {
    pattern: /\/start/,
    execute: async (bot, msg) => {
        const chatId = msg.chat.id;
        if (chatId == 712125845) {
            bot.sendMessage(chatId, 'Пампим Нефть');
            bot.sendPhoto(chatId, 'C:\\Users\\Sergey\\Desktop\\tgStudents\\bot-test\\uploads\\m1000x1000.png');
        }
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
