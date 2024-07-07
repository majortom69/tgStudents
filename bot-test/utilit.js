const { getUserAchievements, addAttachments, isUserTeacher, getGroupAchievements, getAchievementById, getUsernameByUserId, getStudentGroupByUserId } = require('./database');
const fs = require('fs');
const path = require('path');
const { token } = require('./bot');
const { promisify } = require('util');
const { pipeline } = require('stream');

const pipelineAsync = promisify(pipeline);

async function formatAchievementMessage(achievement) {
    const name = await getUsernameByUserId(achievement.USER_ID);
    const group = await getStudentGroupByUserId(achievement.USER_ID);
    let message = `${name}\n`;
    message += `Группа: ${group}\n\n`;
    message += `Название: ${achievement.TITLE}\n`;
    message += `Описание: ${achievement.DESCRIPTION}\n`;
    //message += `Date: ${achievement.ACHIEVEMENT_DATE}\n`;
    message += `Категория: ${achievement.CATEGORY}\n`;
    message += `Комментарий от преподавателя: ${achievement.COMMENT}\n`;
    message += `Вложенные файлы: ${achievement.ATTACHMENTS.length}\n`;

    return message;
}

async function handleImageMessage(bot, msg, userState, currentAchievement) {
    const chatId = msg.chat.id;
    const uploadsDir = './uploads';

    const processImage = async (fileId, chatId, mediaGroupId) => {
        bot.getFile(fileId).then(file => {
            const filePath = file.file_path;
            const url = `https://api.telegram.org/file/bot${token}/${filePath}`;

            fetch(url)
                .then(async res => {
                    const uniqueFilename = `${Date.now()}-${path.basename(filePath)}`;
                    const dest = fs.createWriteStream(path.join(uploadsDir, uniqueFilename));
                    try {
                        await pipelineAsync(res.body, dest);
                        userState[chatId].images.push(path.join(uploadsDir, uniqueFilename));
                        if (!userState[chatId].messageSent) {
                            bot.sendMessage(chatId, 'Изображение добавлено. Отправьте следующее изображение или введите /done для завершения.');
                            userState[chatId].messageSent = true;
                        }
                    } catch (err) {
                        console.error(err);
                        bot.sendMessage(chatId, 'Не удалось сохранить изображение.');
                    }
                })
                .catch(err => {
                    console.error(err);
                    bot.sendMessage(chatId, 'Не удалось скачать изображение.');
                });
        });
    };

    
    if ((msg.media_group_id || msg.photo) && msg.photo) {
        if (!userState[chatId]) {
            userState[chatId] = { images: [], messageSent: false };
        }
        const fileId = msg.photo[msg.photo.length - 1].file_id;
        await processImage(fileId, chatId, msg.media_group_id);
    } else if (msg.text === '/done') {
        if (userState[chatId] && userState[chatId].images.length > 0) {

            currentAchievement.imagePaths = userState[chatId].images
            console.log('Achievement:', achievement);

            bot.sendMessage(chatId, 'Достижение успешно добавлено');
            addAttachments(currentAchievement, currentAchievement.ACHIEVEMENT_ID);

            // Очистка состояния пользователя
            delete userState[chatId];
        } else {
            bot.sendMessage(chatId, 'Нет добавленных изображений.');
        }
    }
}


function sendUploadButtons(bot, chatId) {
    const options = {
        reply_markup: {
            inline_keyboard: [
                [{ text: '🧬Научное🧬', callback_data: 'scientific' }],
                [{ text: '🏆Спортивное🏆', callback_data: 'sports' }],
                [{ text: '🎭Культурная🎭', callback_data: 'cultural' }],
                [{ text: '❓Другое❓', callback_data: 'other' }],
                [{ text: 'Отмена', callback_data: 'cancel' }]
            ]
        }
    };
    bot.sendMessage(chatId, 'Выберите категорию достижения:', options);
}

async function sendAchievementPage(bot, chatId, userId, page, messageId = null) {
    const achievements = await getUserAchievements(userId);
    const isTeacher = await isUserTeacher(chatId);
    await sendPage(bot, chatId, achievements, page, messageId, isTeacher, false);
}

async function sendAchievementPageByGroupId(bot, chatId, groupId, page, messageId = null) {
    const achievements = await getGroupAchievements(groupId);
    const isTeacher = await isUserTeacher(chatId);
    await sendPage(bot, chatId, achievements, page, messageId, isTeacher, false);
}

async function sendAchievementPageByAchId(bot, chatId, achId, page, messageId = null) {
    const achievements = await getAchievementById(achId);
    const isTeacher = await isUserTeacher(chatId);
    await sendPage(bot, chatId, achievements, page, messageId, isTeacher, true);
}

async function sendPage(bot, chatId, achievements, page, messageId, isTeacher, achId) {
    const pageSize = 1; // Number of achievements per page

    if (!Array.isArray(achievements)) {
        achievements = [achievements];
    }

    const totalPages = Math.ceil(achievements.length / pageSize);

    // Ensure the page is within bounds
    if (page < 1) page = 1;
    if (page > totalPages) page = totalPages;

    const startIndex = (page - 1) * pageSize;
    const endIndex = Math.min(startIndex + pageSize, achievements.length);
    const currentAchievements = achievements.slice(startIndex, endIndex);

    let message = `Достижения (Страница ${page}/${totalPages}):\n\n`;
    for (let achievement of currentAchievements) {
        message += await formatAchievementMessage(achievement);
        message += '\n';
    }

    const inlineKeyboard = {
        inline_keyboard: [
            [
                ...(achId ? [] : [{ text: '⬅️ Предыдущие', callback_data: 'prev' }]),
                { text: '📎 Отправить вложения', callback_data: 'send_attachment' },
                ...(achId ? [] : [{ text: '➡️ Следующие', callback_data: 'next' }])
            ],
            [
                { text: isTeacher ? '📝 Прокомментировать' : '📝 Отредактировать', callback_data: isTeacher ? 'comment' : 'edit' },
                { text: '🗑 Удалить', callback_data: 'delete' }
            ]
        ]
    };
    

    if (messageId) {
        bot.editMessageText(message, {
            chat_id: chatId,
            message_id: messageId,
            reply_markup: inlineKeyboard
        }).catch((error) => {
            if (error.response && error.response.body && error.response.body.error_code === 400 && error.response.body.description.includes('message is not modified')) {
                console.log('Message not modified, skipping update.');
            } else {
                console.error('Failed to edit message:', error);
            }
        });
    } else {
        bot.sendMessage(chatId, message, { reply_markup: inlineKeyboard });
    }
}

module.exports = { formatAchievementMessage, sendAchievementPage, sendAchievementPageByGroupId, sendAchievementPageByAchId, sendUploadButtons, handleImageMessage };
