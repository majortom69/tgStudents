const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const { pipeline } = require('stream');
const fetch = require('node-fetch');
const { token } = require('../../bot'); // Import the token from bot.js
const { createAchievement } = require('../../database');
const { addAchievementToSheet } = require('../../googleSheets');

const pipelineAsync = promisify(pipeline);

module.exports = {
    step: 'awaiting_file',
    execute: async (bot, msg, userState) => {
        const chatId = msg.chat.id;
        const uploadsDir = './uploads';

        const processFile = async (fileId, chatId) => {
            bot.getFile(fileId).then(file => {
                const filePath = file.file_path;
                const url = `https://api.telegram.org/file/bot${token}/${filePath}`;

                fetch(url)
                    .then(async res => {
                        const uniqueFilename = `${Date.now()}-${path.basename(filePath)}`;
                        const dest = fs.createWriteStream(path.join(uploadsDir, uniqueFilename));
                        try {
                            await pipelineAsync(res.body, dest);
                            userState[chatId].files.push(path.join(uploadsDir, uniqueFilename));
                            if (!userState[chatId].messageSent) {
                                bot.sendMessage(chatId, 'Файл добавлен. Отправьте следующий файл или ⚠️введите /done для завершения⚠️.');
                                userState[chatId].messageSent = true;
                            }
                        } catch (err) {
                            console.error(err);
                            bot.sendMessage(chatId, '⚠️Не удалось сохранить файл.⚠️');
                        }
                    })
                    .catch(err => {
                        console.error(err);
                        bot.sendMessage(chatId, '⚠️Не удалось скачать файл.⚠️');
                    });
            });
        };

        if (msg.document) {
            if (!userState[chatId]) {
                userState[chatId] = { files: [], messageSent: false };
            }

            const fileId = msg.document.file_id;
            await processFile(fileId, chatId);

        } else if (msg.text === '/done') {
            if (userState[chatId] && userState[chatId].files.length > 0) {
                const achievement = {
                    userId: chatId,
                    category: userState.category,
                    title: userState.title,
                    description: userState.description,
                    filePaths: userState[chatId].files
                };

                console.log('Achievement:', achievement);

                bot.sendMessage(chatId, '🎉Достижение успешно добавлено!🎉');

                const achievementID = await createAchievement(achievement); // добавляем достижение в бд и получаем ID этого достижения
               

                // https://docs.google.com/spreadsheets/d/1v99UhoHBlIXGfiZxe1i4_6o1TflZvIdc8ddIuD7Fc6A/edit?usp=sharing
                await addAchievementToSheet(achievement, achievementID);

                // Очистка состояния пользователя
                delete userState[chatId];
            } else {
                bot.sendMessage(chatId, '⚠️Нет добавленных файлов.⚠️');
            }
        }
    }

//     const processFile = async (fileId, chatId) => {
//         bot.getFile(fileId).then(file => {
//             const filePath = file.file_path;
//             const url = `https://api.telegram.org/file/bot${token}/${filePath}`;

//             fetch(url)
//                 .then(async res => {
//                     const uniqueFilename = `${Date.now()}-${path.basename(filePath)}`;
//                     const dest = fs.createWriteStream(path.join(uploadsDir, uniqueFilename));
//                     try {
//                         await pipelineAsync(res.body, dest);
//                         userState[chatId].files.push(path.join(uploadsDir, uniqueFilename));
//                         if (!userState[chatId].messageSent) {
//                             bot.sendMessage(chatId, 'Файл добавлен. Отправьте следующий файл или ⚠️введите /done для завершения⚠️.');
//                             userState[chatId].messageSent = true;
//                         }
//                     } catch (err) {
//                         console.error(err);
//                         bot.sendMessage(chatId, '⚠️Не удалось сохранить файл.⚠️');
//                     }
//                 })
//                 .catch(err => {
//                     console.error(err);
//                     bot.sendMessage(chatId, '⚠️Не удалось скачать файл.⚠️');
//                 });
//         });
//     };

//     if (!userState[chatId]) {
//         userState[chatId] = { files: [], messageSent: false };
//     }

//     if (msg.document) {
//         const fileId = msg.document.file_id;
//         await processFile(fileId, chatId);

//     } else if (msg.photo) {
//         const fileId = msg.photo[msg.photo.length - 1].file_id; // Get the highest resolution photo
//         await processFile(fileId, chatId);

//     } else if (msg.text === '/done') {
//         if (userState[chatId] && userState[chatId].files.length > 0) {
//             const achievement = {
//                 userId: chatId,
//                 category: userState.category,
//                 title: userState.title,
//                 description: userState.description,
//                 filePaths: userState[chatId].files
//             };

//             console.log('Achievement:', achievement);

//             bot.sendMessage(chatId, '🎉Достижение успешно добавлено!🎉');

//             const achievementID = await createAchievement(achievement); // добавляем достижение в бд и получаем ID этого достижения

//             // https://docs.google.com/spreadsheets/d/1v99UhoHBlIXGfiZxe1i4_6o1TflZvIdc8ddIuD7Fc6A/edit?usp=sharing
//             await addAchievementToSheet(achievement, achievementID);

//             // Очистка состояния пользователя
//             delete userState[chatId];
//         } else {
//             bot.sendMessage(chatId, '⚠️Нет добавленных файлов.⚠️');
//         }
//     }
// }
};



