const { getHelpMessage } = require('./help');

module.exports = {
    pattern: /\/start/,
    execute: (bot, msg) => {
        const chatId = msg.chat.id;
        bot.sendMessage(chatId,
        `📚 Добро пожаловать в Бота для сбора и каталогизации информации о достижениях студентов! 📚

        Этот бот помогает вам собирать и оценивать достижения студентов.
            
        ${getHelpMessage()}
            
        Если вам нужна помощь, введите /help.`
        );
    }
};
