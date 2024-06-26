import { Context, Telegraf } from 'telegraf';
import { createUser } from '../database';
import { bot } from '../bot';

export const event = {
    callback_data: 'create_teacher',
    handler: async (ctx: Context) => {

        await ctx.reply('Пожалуйста, введите ваше имя пользователя (username):');

        bot.on('message', (msg) => {
            const user_id = BigInt(ctx.from?.id || 0);
            const username = msg.text || '';
            createUser({ user_id, username, user_type: 'teacher' });
        });

        await ctx.reply('Пользователь успешно добавлен!');
    }
};
