import { Context, Telegraf} from 'telegraf';
import { InlineKeyboardButton } from 'telegraf/typings/core/types/typegram';

export const command = {
    name: 'ping',
    execute: (bot: Telegraf, ctx: Context) => {
        // Когда мы нажимаеv на кнопку оно оправляет сигнал в '.src/events/button_click.ts'
        const button: InlineKeyboardButton = { text: 'Button', callback_data: 'button_click' };
        ctx.reply('I love niggers',  {
            reply_markup: {
                inline_keyboard: [[button]]
            }
        });
    }
};