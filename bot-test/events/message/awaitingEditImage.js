const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const { pipeline } = require('stream');
const { token } = require('../../bot'); // Import the token from bot.js
const { addAttachments, getUserAchievements } = require('../../database');


const pipelineAsync = promisify(pipeline);

module.exports = {
    step: 'awaiting_edit_image',
    execute: async (bot, msg, userStates) => {
        const chatId = msg.chat.id;
        const uploadsDir = './uploads';
        const page = userStates.page;
        const achievements = await getUserAchievements(chatId);
        let currentAchievement = achievements[page - 1];
        console.log(currentAchievement);

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
                            userStates[chatId].images.push(path.join(uploadsDir, uniqueFilename));
                            if (!userStates[chatId].messageSent) {
                                bot.sendMessage(chatId, 'Изображение добавлено. Отправьте следующее изображение или ⚠️введите /done для завершения⚠️.');
                                userStates[chatId].messageSent = true;
                            }
                        } catch (err) {
                            console.error(err);
                            bot.sendMessage(chatId, '⚠️Не удалось сохранить изображение.⚠️');
                        }
                    })
                    .catch(err => {
                        console.error(err);
                        bot.sendMessage(chatId, '⚠️Не удалось скачать изображение.⚠️');
                    });
            });
        };

        if ((msg.media_group_id || msg.photo) && msg.photo) {
            if (!userStates[chatId]) {
                userStates[chatId] = { images: [], messageSent: false };
            }

            const fileId = msg.photo[msg.photo.length - 1].file_id;
            await processImage(fileId, chatId, msg.media_group_id);

        } else if (msg.text === '/done') {
            if (userStates[chatId] && userStates[chatId].images.length > 0) {

                currentAchievement.ATTACHMENTS = userStates[chatId].images;

                console.log('Achievement:', );

                bot.sendMessage(chatId, '🎉Фотографии успешно обновлены!🎉');
                console.log(currentAchievement, currentAchievement.ACHIEVEMENT_ID);
                addAttachments(currentAchievement, currentAchievement.ACHIEVEMENT_ID);

                // Очистка состояния пользователя
                delete userStates[chatId];
            } else {
                bot.sendMessage(chatId, '⚠️Нет добавленных изображений!⚠️');
            }
        }
    }
};
