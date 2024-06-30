const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const { pipeline } = require('stream');
const { createUser, updateUserName } = require('../database');
const { token } = require('../bot');  // Import the token from bot.js

const pipelineAsync = promisify(pipeline);

module.exports = {
    type: 'message',
    execute: (bot, msg) => {
        const chatId = msg.chat.id;
        const userState = userStates[chatId];
        const uploadsDir = './uploads';

        if (!userState) return;

        switch (userState.step) {
            case 'awaiting_title':
                userState.title = msg.text; 
                bot.deleteMessage(chatId, userState.lastMessageId);
                userState.step = 'awaiting_description';
                bot.sendMessage(chatId, 'Please send the description of the achievement.');
                break;

            case 'awaiting_description':
                userState.description = msg.text;
                userState.step = 'awaiting_image';
                bot.sendMessage(chatId, 'Please send an image for the achievement.');
                break;

            case 'awaiting_image':
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
                break;

            case 'awaiting_name':
                userState.name = msg.text;
                bot.deleteMessage(chatId, userState.lastMessageId);
                if (userState.role === 'student') {
                    userState.step = 'awaiting_group';
                    bot.sendMessage(chatId, 'Пожалуйста введите вашу группу (например, 1488К или М249).');
                } else {
                    // Save teacher data
                    const teacher = {
                        userId: chatId,
                        role: userState.role,
                        name: userState.name
                    };
                    console.log('Teacher registered:', teacher);
                    createUser(teacher);
                    bot.sendMessage(chatId, 'Вы успешно зарегистрированы как преподаватель.');
                    // Clear the user state
                    delete userStates[chatId];
                }
                break;

            case 'awaiting_group':
                userState.group = msg.text;
                // Save student data
                const student = {
                    userId: chatId,
                    role: userState.role,
                    name: userState.name,
                    group: userState.group
                };
                console.log('Student registered:', student);
                createUser(student);
                bot.sendMessage(chatId, 'Вы успешно зарегистрированы как студент.');
                // Clear the user state
                delete userStates[chatId];
                break;

            case 'change_name':
                userState.name = msg.text;
                updateUserName(chatId, userState.name);
                break;

            case 'awaiting_password':
                const password = msg.text;
                if (password === '123') {
                    bot.deleteMessage(chatId, userState.lastMessageId);
                    userState.step = 'awaiting_name';
                    bot.sendMessage(chatId, 'Пароль подтверждён.\nПожалуйста введите полное имя преподавателя:');
                } else {
                    bot.sendMessage(chatId, 'Неверный пароль. Пожалуйста, попробуйте снова.');
                }
                break;
            default:
                bot.sendMessage(chatId, 'Unexpected state. Please start again with /register.');
                delete userStates[chatId];
        } 
    }
};
