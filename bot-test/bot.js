const TelegramBot = require('node-telegram-bot-api');
const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const { clearInterval } = require('timers');

// Replace with your actual Telegram Bot Token
const token = '6651061258:AAEV-0YJUk5zmweYJnaz9fSMWdoBDUQPvS4';
const bot = new TelegramBot(token, { polling: true });

// Export the token
module.exports.token = token;

// Create uploads folder if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir);
}

const pipelineAsync = promisify(require('stream').pipeline);

// State management to track user upload requests
global.userStates = {};

// Load commands
const commandFiles = fs.readdirSync(path.join(__dirname, 'commands')).filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    bot.onText(command.pattern, (msg) => command.execute(bot, msg));
}
console.log('✅ Commands has been loaded successfully');

// // Load events
const eventFiles = fs.readdirSync(path.join(__dirname, 'events')).filter(file => file.endsWith('.js'));
for (const file of eventFiles) {
    const event = require(`./events/${file}`);
    bot.on(event.type, (data) => event.execute(bot, data));
}
console.log('✅ Events has been loaded successfully');

console.log('Bot has been started 🤫🧏🏻‍♂️');