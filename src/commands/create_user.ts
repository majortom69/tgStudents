import { Context, Telegraf} from 'telegraf';
import { InlineKeyboardButton } from 'telegraf/typings/core/types/typegram';
import { callback } from 'telegraf/typings/button';

export const command = {
    name: 'register',
    execute: async (bot: Telegraf, ctx: Context) => {
        if (!ctx.from) {
            await ctx.reply('Unable to retrieve user information.');
            return;
        }

        const button: InlineKeyboardButton = { text: 'Студент', callback_data: 'create_student' };
        const button2: InlineKeyboardButton = { text: 'Преподаватель', callback_data: 'create_teacher' };

        ctx.reply('Выберите тип пользователя:', {
            reply_markup: {
                inline_keyboard: [
                    [button,button2]
                ]
            }
        });
    }
};