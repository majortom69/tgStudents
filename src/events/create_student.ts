import { Context, Telegraf } from 'telegraf';
import { createUser } from '../database';
import { bot } from '../bot';

export const event = {
    callback_data: 'create_student',
    handler: async (ctx: Context) => {

        await ctx.reply('Пожалуйста, введите ваше имя пользователя (username):');

        bot.on('message', async(msg) => {
            const user_id = BigInt(ctx.from?.id || 0);
            const username = msg.text || '';
            await createUser({ user_id, username, user_type: 'student' });
        });

        ctx.reply('Пользователь успешно добавлен!');
    }
};
