import { Context } from 'telegraf';
import { createUser } from '../database';
import { bot } from '../bot';

export const event = {
    callback_data: 'create_student',
    handler: async (ctx: Context) => {
        await ctx.reply('Пожалуйста, введите ваше имя пользователя (username):');

        const msg = await new Promise<string>((resolve) => {
            bot.on('text', (msg) => resolve(msg.text || ''));
        });

        const user_id = BigInt(ctx.from?.id || 0);
        const username = msg.trim();

        await createUser({ user_id, username, user_type: 'student' });

        ctx.reply('Пользователь успешно добавлен!');
    }
};
