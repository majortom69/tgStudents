import { Telegraf } from 'telegraf';
import { loadCommands } from './commands';
import { loadEventHandlers } from './events';

const bot = new Telegraf('6651061258:AAEV-0YJUk5zmweYJnaz9fSMWdoBDUQPvS4');

async function startBot() {
    await loadCommands(bot);
   

    await loadEventHandlers(bot);


    bot.launch().then(() => {
        console.log('Bot started');
    });
}

startBot();

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));