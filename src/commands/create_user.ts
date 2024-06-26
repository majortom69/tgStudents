import { Context, Telegraf, Markup } from 'telegraf';
import { InlineKeyboardButton } from 'telegraf/typings/core/types/typegram';
import { createUser } from '../database';

export const command = {
    name: 'register',
    execute: async (bot: Telegraf, ctx: Context) => {
        if (!ctx.from) {
            await ctx.reply('Unable to retrieve user information.');
            return;
        }

        const user_id = BigInt(ctx.from.id);
        const username = ctx.from.username || 'unknown';

       

        await createUser({ user_id, username, user_type: 'student' });
    }
};