import { Context, Telegraf} from 'telegraf';
import { createUser } from '../database';
import { callback } from 'telegraf/typings/button';

export const command = {
    name: 'register',
    execute: async (bot: Telegraf, ctx: Context) => {
        if (!ctx.from) {
            await ctx.reply('Unable to retrieve user information.');
            return;
        }

        ctx.reply('Выберите тип пользователя:', {
            reply_markup: {
                inline_keyboard: [
                    [{ text: 'Студент', callback_data: 'create_student' }, { text: 'Преподаватель', callback_data: 'create_teacher' }]
                ]
            }
        });
    }
};