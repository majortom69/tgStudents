import { Context, Telegraf,  Markup  } from 'telegraf';

export const command = {
    name: 'help',
    execute: async (bot: Telegraf, ctx: Context) => {
        const commands = await bot.telegram.getMyCommands();
        const helpMessage = commands
            .map(command => `/${command.command} - ${command.description}`)
            .join('\n');
        ctx.reply(helpMessage || 'No commands available.');
    },
};
