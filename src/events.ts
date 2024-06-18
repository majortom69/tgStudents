

import { Telegraf, Context } from 'telegraf';
import { CallbackQuery } from 'telegraf/typings/core/types/typegram';
import {loadFiles} from './utils/fileLoader'

export async function loadEventHandlers(bot: Telegraf) {
    const eventFiles = loadFiles('events');

    for (const file of eventFiles) {
        const eventHandler = await import(file);
        if (eventHandler.event) {
            bot.on('callback_query', (ctx: Context) => {
                const callbackQuery = ctx.callbackQuery as CallbackQuery.DataQuery;
                if (callbackQuery.data === eventHandler.event.callback_data) {
                    eventHandler.event.handler(ctx);
                }
            });
        }
    }

    console.log('✅ Event Handlers Loaded');
}