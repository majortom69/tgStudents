import { Telegraf } from 'telegraf';
import { loadCommands } from './commands';
import { loadEventHandlers } from './events';
import dotenv from 'dotenv';
dotenv.config();

const bot = new Telegraf(process.env.BOT_TOKEN as string);

async function startBot() {
    await loadCommands(bot);
   

    await loadEventHandlers(bot);

    bot.hears('🔔', (ctx) => ctx.reply('You clicked 🔔!'));

    bot.launch().then(() => {
        console.log('Bot started');
    });
}

startBot();

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));