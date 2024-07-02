const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const { pipeline } = require('stream');
const { token } = require('../../bot'); // Import the token from bot.js
const { createAchievement } = require('../../database');

const pipelineAsync = promisify(pipeline);

module.exports = {
    step: 'awaiting_image',
    execute: async (bot, msg, userState) => {
        const chatId = msg.chat.id;
        const uploadsDir = './uploads';

        const processImage = async (fileId, chatId, mediaGroupId) => {
            bot.getFile(fileId).then(file => {
                const filePath = file.file_path;
                const url = `https://api.telegram.org/file/bot${token}/${filePath}`;

                fetch(url)
                    .then(async res => {
                        const dest = fs.createWriteStream(path.join(uploadsDir, path.basename(filePath)));
                        try {
                            await pipelineAsync(res.body, dest);
                            userState[chatId].images.push(path.join(uploadsDir, path.basename(filePath)));
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
                const achievement = {
                    userId: chatId,
                    category: userState.category,
                    title: userState.title,
                    description: userState.description,
                    imagePaths: userState[chatId].images
                };

                console.log('Achievement:', achievement);

                bot.sendMessage(chatId, 'Достижение успешно добавлено.');
                createAchievement(achievement);

                // Очистка состояния пользователя
                delete userState[chatId];
            } else {
                bot.sendMessage(chatId, 'Нет добавленных изображений.');
            }
        } else {
            bot.sendMessage(chatId, 'Пожалуйста, отправьте изображения или введите /done для завершения.');
        }
    }
};
