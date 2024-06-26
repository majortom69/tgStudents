// Сделать команду для приветсвия
// Она выводится автоматически, когда пользователь впервые запускает бота

import { Context, Telegraf,  Markup  } from 'telegraf';
import { InlineKeyboardButton } from 'telegraf/typings/core/types/typegram';

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