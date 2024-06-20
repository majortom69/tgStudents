// динамичкская загрузка комманд

import { Telegraf } from 'telegraf';
import {loadFiles} from './utils/fileLoader'
import path from 'path'

export async function loadCommands(bot: Telegraf) {
    const commandFiles = loadFiles('commands');

    for (const file of commandFiles) {
        const command = await import(file);
        if (command.command) {
            bot.command(command.command.name, (ctx) => command.command.execute(bot, ctx));
        }
    }

    console.log('✅ Command handlers loaded');
}