const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const { pipeline } = require('stream');
const { token } = require('../../bot'); // Import the token from bot.js

const pipelineAsync = promisify(pipeline);

module.exports = {
    step: 'awaiting_image',
    execute: (bot, msg, userState) => {
        const chatId = msg.chat.id;
        const uploadsDir = './uploads';

        if (msg.photo) {
            const fileId = msg.photo[msg.photo.length - 1].file_id;

            bot.getFile(fileId).then(file => {
                const filePath = file.file_path;
                const url = `https://api.telegram.org/file/bot${token}/${filePath}`;

                fetch(url)
                    .then(async res => {
                        const dest = fs.createWriteStream(path.join(uploadsDir, path.basename(filePath)));
                        try {
                            await pipelineAsync(res.body, dest);
                            const achievement = {
                                category: userState.category,
                                title: userState.title,
                                description: userState.description,
                                imagePath: path.join(uploadsDir, path.basename(filePath))
                            };
                            // Save the achievement data as needed
                            // For example, you can log it or save it to a database
                            console.log('Achievement:', achievement);

                            bot.sendMessage(chatId, 'Achievement has been uploaded successfully.');
                            // Clear the user state
                            delete userStates[chatId];
                        } catch (err) {
                            console.error(err);
                            bot.sendMessage(chatId, 'Failed to save the image.');
                        }
                    })
                    .catch(err => {
                        console.error(err);
                        bot.sendMessage(chatId, 'Failed to download the image.');
                    });
            });
        } else {
            bot.sendMessage(chatId, 'Please send a valid image.');
        }
    }
};
