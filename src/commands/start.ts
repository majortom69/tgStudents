// Сделать команду для приветсвия
// Она выводится автоматически, когда пользователь впервые запускает бота

import { Context, Telegraf,  Markup  } from 'telegraf';
import { InlineKeyboardButton } from 'telegraf/typings/core/types/typegram';

export const command = {
    name: 'start',
    execute: (bot: Telegraf, ctx: Context) => {
        ctx.reply('I hate niggers');
    }
};