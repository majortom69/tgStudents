const help = require('./help');

module.exports = {
    pattern: /\/start/,
    execute: async (bot, msg) => {
        const chatId = msg.chat.id;
        delete userStates[chatId];
        // Выполнение команды /help и получение её ответа
        let helpMessage = '';
        const mockBot = {
            sendMessage: (id, text) => {
                if (id === chatId) {
                    helpMessage = text;
                }
            }
        };

        const opts = {
            reply_markup: {
              keyboard: [
                ['🎫', '❓'],
                ['📌', '🆘'],
                ['📁']
              ],
              resize_keyboard: true,
              one_time_keyboard: true
            }
        };

        help.execute(mockBot, { chat: { id: chatId } });

        bot.sendMessage(chatId,
        `📚 Добро пожаловать в Бота для сбора и каталогизации информации о достижениях студентов! 📚

        Этот бот помогает вам собирать и оценивать достижения студентов.
            
        ${helpMessage}
            
        🆘Если вам нужна помощь, введите /help.🆘`
        , opts);
    }
};
