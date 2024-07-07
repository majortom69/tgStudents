const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const { pipeline } = require('stream');
const { token } = require('../../bot'); // Import the token from bot.js
const { addAttachments, getUserAchievements } = require('../../database');

const pipelineAsync = promisify(pipeline);
const uploadsDir = './uploads'; // Директория для сохранения файлов

module.exports = {
    step: 'awaiting_edit_file',
    execute: async (bot, msg, userStates) => {
        const chatId = msg.chat.id;
        const page = userStates.page;
        const achievements = await getUserAchievements(chatId);
        let currentAchievement = achievements[page - 1];

        const processFile = async (fileId, chatId, mediaGroupId, fileType) => {
            bot.getFile(fileId).then(file => {
                const filePath = file.file_path;
                const url = `https://api.telegram.org/file/bot${token}/${filePath}`;

                fetch(url)
                    .then(async res => {
                        const uniqueFilename = `${Date.now()}-${path.basename(filePath)}`;
                        const dest = fs.createWriteStream(path.join(uploadsDir, uniqueFilename));
                        try {
                            await pipelineAsync(res.body, dest);
                            const savedFilePath = path.join(uploadsDir, uniqueFilename);

                            // Добавляем путь к файлу в состояние пользователя
                            userStates[chatId].attachments.push({ path: savedFilePath, type: fileType });

                            // Отправляем сообщение о добавлении файла
                            if (!userStates[chatId].messageSent) {
                                bot.sendMessage(chatId, `Файл добавлен. Отправьте следующий файл или ⚠️введите /done для завершения⚠️.`);
                                userStates[chatId].messageSent = true;
                            }
                        } catch (err) {
                            console.error(err);
                            bot.sendMessage(chatId, `⚠️Не удалось сохранить файл (${fileType}).⚠️`);
                        }
                    })
                    .catch(err => {
                        console.error(err);
                        bot.sendMessage(chatId, `⚠️Не удалось скачать файл (${fileType}).⚠️`);
                    });
            });
        };

        // Обработка загрузки изображений
        if ((msg.media_group_id || msg.photo) && msg.photo) {
            if (!userStates[chatId]) {
                userStates[chatId] = { attachments: [], messageSent: false };
            }

            const fileId = msg.photo[msg.photo.length - 1].file_id;
            await processFile(fileId, chatId, msg.media_group_id, 'image');
        }

        // Обработка загрузки документов (PDF и DOC)
        else if (msg.document) {
            if (!userStates[chatId]) {
                userStates[chatId] = { attachments: [], messageSent: false };
            }

            const fileId = msg.document.file_id;
            const fileType = msg.document.mime_type.split('/')[1]; // Получаем тип файла (pdf, doc, etc.)
            await processFile(fileId, chatId, msg.media_group_id, fileType);
        }

        // Обработка команды /done для завершения загрузки файлов
        else if (msg.text === '/done') {
            if (userStates[chatId] && userStates[chatId].attachments.length > 0) {
                // Обработка добавленных файлов
                currentAchievement.ATTACHMENTS = userStates[chatId].attachments.map(att => att.path);
                addAttachments(currentAchievement, currentAchievement.ACHIEVEMENT_ID);

                // Отправка сообщения об успешном завершении
                bot.sendMessage(chatId, '🎉Файлы успешно добавлены!🎉');

                // Очистка состояния пользователя
                delete userStates[chatId];
            } else {
                // Отправка сообщения об ошибке, если файлы не были добавлены
                bot.sendMessage(chatId, '⚠️Нет добавленных файлов!⚠️');
            }
        }
    }
};
