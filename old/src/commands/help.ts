import { Context, Telegraf } from 'telegraf';

export const command = {
    name: 'help',
    execute: async (bot: Telegraf, ctx: Context) => {
        const commands = await bot.telegram.getMyCommands();
        const helpMessage = commands
            .filter(command => command.command !== 'help')
            .map(command => `/${command.command} - ${command.description}`)
            .join('\n');
        ctx.reply(helpMessage || 'No commands available.');
    },
};
