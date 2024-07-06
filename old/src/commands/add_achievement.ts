import { Context, Telegraf} from 'telegraf';
import { InlineKeyboardButton } from 'telegraf/typings/core/types/typegram';

export const command = {
    name: 'add_achievement',
    execute: (bot: Telegraf, ctx: Context) => {
        ctx.reply('')
    }
};