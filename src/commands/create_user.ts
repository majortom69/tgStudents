import { Context, Telegraf} from 'telegraf';
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