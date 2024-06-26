// Сделать команду для приветсвия
// Она выводится автоматически, когда пользователь впервые запускает бота

import { Context, Telegraf} from 'telegraf';

export const command = {
    name: 'start',
    execute: (bot: Telegraf, ctx: Context) => {
        const welcomeMessage = `
        📚 Добро пожаловать в Бота ддля сбора и каталогизации информации о достижениях студентов! 📚

        Этот бот помогает вам собирать и оценивать достижения студентов.

        Доступные команды:
        /register - регистрация

        Если вам нужна помощь, введите /help.
        `;
        ctx.reply(welcomeMessage);
    }
};