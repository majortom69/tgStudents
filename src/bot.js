const TelegramBot = require('node-telegram-bot-api');
const fs = require('fs');
const path = require('path');
const { promisify } = require('util');

const helpModule = require('./commands/help');
const { getUserDataById, isUserTeacher, getAchievementsWithComments } = require('./database');

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

bot.onText(/🎫/, async (msg) => {
    const userData = await getUserDataById(msg.chat.id);
    if (userData) {
        let userMessage;
        const isTeacher = await isUserTeacher(msg.chat.id);

        if (!isTeacher) {
            userMessage = `
Имя: ${userData.name}
Роль: ${userData.role}
Группа: ${userData.group}
Количество достижений: ${userData.achievements}
            `;
        } else {
            userMessage = `
Имя: ${userData.name}
Роль: ${userData.role}
            `;
        }

        bot.sendMessage(msg.chat.id, userMessage.trim());
    } else {
        bot.sendMessage(msg.chat.id, 'Пользователь с указанным ID не найден');
    }
});


bot.onText(/🆘/, (msg) => {
    const mess = 
    `🛠️Контакты администраторов🛠️:

     _Букаев Сергей_ *(@Bomb1945)*
     Номер телефона (мегафон):
     +7 (921) 359-3951

     _Кузницов Владислав_ *(@vladk32)*
     Номер телефона ():
    +7 (984) 158-0911`;
    bot.sendMessage(msg.chat.id, mess, { parse_mode: 'Markdown' });
    const animationPath = `https://media1.tenor.com/m/Qht8I_MeSaAAAAAd/serious-sam-serious.gif`;
    bot.sendAnimation(msg.chat.id, animationPath).catch(err => {
        console.error('Failed to send animation:', err);
    });
});

bot.onText(/📁/, async (msg) => {
    const userId = msg.chat.id;
    const comments = await getAchievementsWithComments(userId);
    console.log(comments);
    if (comments.length === 0) {
        bot.sendMessage(userId, 'У вас нет комментариев.');
        return;
    }

    // Преобразуем комментарии в строку
    let messageText = 'Комментарии под вашими достижениями:\n\n';
    comments.forEach(comment => {
        messageText += `ID Достижения: ${comment.ACHIEVEMENT_ID}\n`;
        messageText += `Название достижения: _${comment.TITLE}_\n\n`
        messageText += `ФИО преподавателя: _${comment.PROFFESOR_NAME}_\n`;
        messageText += `Комментарий: ${comment.COMMENT}\n`;
        messageText += `------------------------------------------------------\n\n`;
    });

    bot.sendMessage(userId, messageText, { parse_mode: 'Markdown' });
});

bot.onText(/❓/, (msg) => {
    helpModule.execute(bot, msg);
});