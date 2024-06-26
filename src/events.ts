import { Telegraf, Context } from 'telegraf';
import { loadFiles } from './utils/fileLoader';

export async function loadEventHandlers(bot: Telegraf) {
    const eventFiles = loadFiles('events');

    for (const file of eventFiles) {
        const eventHandler = await import(file);
        if (eventHandler.event) {
            bot.action(eventHandler.event.callback_data, (ctx: Context) => {
                eventHandler.event.handler(ctx);
            });
        }
    }

    console.log('✅ Event Handlers Loaded');
}
