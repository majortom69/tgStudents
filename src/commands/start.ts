// Сделать команду для приветсвия
// Она выводится автоматически, когда пользователь впервые запускает бота

import { Context, Telegraf, Markup} from 'telegraf';

export const command = {
    name: 'start',
    execute: (bot: Telegraf, ctx: Context) => {
        const welcomeMessage = `
        📚 Добро пожаловать в Бота для сбора и каталогизации информации о достижениях студентов! 📚

        Этот бот помогает вам собирать и оценивать достижения студентов.

        Доступные команды:
        /register - регистрация

        Если вам нужна помощь, введите /help.
        `;
        
        const keyboard = Markup.keyboard([
            [Markup.button.text('🔔')]
        ]).resize(); // Добавляем resize, чтобы клавиатура автоматически подстраивалась под экран

        // Отправляем сообщение вместе с клавиатурой
        ctx.reply(welcomeMessage, keyboard);
    }
};