const mysql = require('mysql2');
const dotenv= require('dotenv');
const path = require('path');
const fs = require('fs').promises;

dotenv.config();

const pool = mysql.createPool({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    database: process.env.MYSQL_DATABASE,
    password: process.env.MYSQL_PASSWORD
    // port: process.env.MYSQL_PORT ? parseInt(process.env.MYSQL_PORT, 10) : undefined
});

const promisePool = pool.promise();

async function checkUserExist(user_id) {
    try{
        const [rows] = await promisePool.query('SELECT * FROM USERS WHERE USER_ID = ?', [user_id]);
        return rows.length > 0;
    } catch(error) {
        console.log('какой то даун сломал код ', error);
    }
}

async function createUser(user_data) {
    try {
        const {userId, role, name, group} = user_data;
        await promisePool.query( 'INSERT INTO USERS (USER_ID, USERNAME, USER_TYPE,  STUDENT_GROUP) VALUES (?, ?, ?, ?)',
            [userId, name, role , group]
        );
        console.log('пользователь создан успешно');
    } catch(error) {
        console.log('какой то даун сломал код ', error);
    }
}

async function updateUserName(user_id, new_name) {
    try {
        const [result] = await promisePool.query('UPDATE USERS SET USERNAME = ? WHERE USER_ID = ?', [new_name, user_id]);
        if (result.affectedRows > 0) {
            console.log('Имя пользователя успешно обновлено');
        } else {
            console.log('Пользователь с указанным ID не найден');
        }
    } catch(error) {
        console.log('какой то даун сломал код ', error);
    }
}

async function createAchievement(achievement) {
    const { userId, category, title, description, imagePaths } = achievement;

    try {
        const [result] = await promisePool.query( 'INSERT INTO ACHIEVEMENTS (USER_ID, TITLE, DESCRIPTION,  CATEGORY) VALUES (?, ?, ?, ?)',
            [userId, title, description, category]
        );

        const achievementId = result.insertId;
        // await promisePool.query(
        //     'INSERT INTO ATTACHMENT_LINKS (ACHIEVEMENT_ID, LINK) VALUES (?, ?)',
        //     [achievementId, imagePaths]
        // );


        // возможность добавлять несколько файлов для ачивки
        for(const imagePath of imagePaths) {
            await promisePool.query(
                'INSERT INTO ATTACHMENT_LINKS (ACHIEVEMENT_ID, LINK) VALUES (?, ?)',
                [achievementId, imagePath]
            );
        }

        console.log('Ачивка добавлена успешно');
    } catch(error) {
        console.log('какой то даун сломал код ', error);
    }
}

async function deleteAchievement(achievement_id) {
    try {
        const [rows] = await promisePool.query(
            'SELECT LINK FROM ATTACHMENT_LINKS WHERE ACHIEVEMENT_ID = ?',
            [achievement_id]
        );
        const folderPath = path.join(__dirname, 'uploads');

        for (const row of rows) {
            const link = row.LINK.replace('uploads\\', ''); 
            const filePath = path.join(folderPath, link);
            
            await fs.unlink(filePath);
            console.log(`Файл удален: ${filePath}`);
        }

        await promisePool.query(
            'DELETE FROM ATTACHMENT_LINKS WHERE ACHIEVEMENT_ID = ?',
            [achievement_id]
        );

        await promisePool.query(
            'DELETE FROM ACHIEVEMENTS WHERE ACHIEVEMENT_ID = ?',
            [achievement_id]
        );

    } catch(error) {
        console.log('какой то даун сломал код ', error);
    }
}


// ======================================================================================= //
//                       УДАЛЕНИЕ ВСЕХ ФОТОК, СВЗЯЗАННОЙ С АЧИВКОЙ 
//======================================================================================= //
async function removeAttachments(achievement_id) {
    try {
        const [rows] = await promisePool.query(
            'SELECT LINK FROM ATTACHMENT_LINKS WHERE ACHIEVEMENT_ID = ?',
            [achievement_id]
        );
        const folderPath = path.join(__dirname, 'uploads');

        for (const row of rows) {
            const link = row.LINK.replace('uploads/', '');  
            const filePath = path.join(folderPath, link);
            
            await fs.unlink(filePath);
            console.log(`Deleted file: ${filePath}`);
        }
         
        await promisePool.query(
            'DELETE FROM ATTACHMENT_LINKS WHERE ACHIEVEMENT_ID = ?',
            [achievement_id]
        );

        console.log(`Удалены прикрепленные файлы для ачивки с id=${achievement_id}.`);
    } catch (error) {
        console.log('какой то даун сломал код ', error);
    }
}
async function editAchievement(achievement, achievement_id) {
    const { userId, category, title, description, imagePaths } = achievement;
    try {
        await removeAttachments(achievement_id);


        for(const imagePath of imagePaths) {
            await promisePool.query(
                'INSERT INTO ATTACHMENT_LINKS (ACHIEVEMENT_ID, LINK) VALUES (?, ?)',
                [achievement_id, imagePath]
            );
        }

        await promisePool.query(
            'UPDATE ACHIEVEMENTS SET USER_ID = ?, CATEGORY = ?, TITLE = ?, DESCRIPTION = ? WHERE ACHIEVEMENT_ID = ?',
            [userId, category, title, description, achievement_id]
        );

        console.log(`Ачивка ${achievement_id} обновлена успешно.`);
    } catch(error) {
        console.log('какой то даун сломал код ', error);
    }
}

async function getUserAchievements(user_id) {
    try {
        const [achievements] = await promisePool.query(
            'SELECT * FROM ACHIEVEMENTS WHERE USER_ID = ?',
            [user_id]
        );

        for (let achievement of achievements) {
            const [attachments] = await promisePool.query(
                'SELECT LINK FROM ATTACHMENT_LINKS WHERE ACHIEVEMENT_ID = ?',
                [achievement.ACHIEVEMENT_ID]
            );

            achievement.ATTACHMENTS = attachments.map(a => a.LINK);
        }

        return achievements;
    } catch (error) {
        console.log('какой-то даун сломал код ', error);
    }
}











function formatAchievementMessage(achievement) {
    let message = `Title: ${achievement.TITLE}\n`;
    message += `Description: ${achievement.DESCRIPTION}\n`;
    message += `Date: ${achievement.ACHIEVEMENT_DATE}\n`;
    message += `Category: ${achievement.CATEGORY}\n`;
    message += `Attached files: ${achievement.ATTACHMENTS.length}\n`;

    return message;
}

// Function to send achievement page
async function sendAchievementPage(chatId, userId, page, messageId = null) {
    const achievements = await getUserAchievements(userId);
    const pageSize = 1; // Number of achievements per page
    const totalPages = Math.ceil(achievements.length / pageSize);

    // Ensure the page is within bounds
    if (page < 1) page = 1;
    if (page > totalPages) page = totalPages;

    const startIndex = (page - 1) * pageSize;
    const endIndex = Math.min(startIndex + pageSize, achievements.length);
    const currentAchievements = achievements.slice(startIndex, endIndex);

    let message = `Your Achievements (Page ${page}/${totalPages}):\n\n`;
    for (let achievement of currentAchievements) {
        message += formatAchievementMessage(achievement);
        message += '\n';
    }

    const inlineKeyboard = {
        inline_keyboard: [
            [
                { text: '⬅️ Prev', callback_data: `prev_${page}` },
                { text: '📎 Send Attachment', callback_data: `send_attachment_${page}` },
                { text: '➡️ Next', callback_data: `next_${page}` }
            ],
            [
                { text: '📝 Edit', callback_data: `edit_${page}` },
                { text: '🗑 Delete', callback_data: `delete_${page}` }
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




module.exports = {
    checkUserExist, createUser, updateUserName, createAchievement, deleteAchievement,
    editAchievement, getUserAchievements, sendAchievementPage
}

