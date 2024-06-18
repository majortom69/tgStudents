import { Context } from 'telegraf';

export const event = {
    callback_data: 'button_click',
    handler: (ctx: Context) => {
        ctx.answerCbQuery('You clicked the button!');
        ctx.reply('button clicked, fuck you');
    }
};