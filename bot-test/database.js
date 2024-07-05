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
        console.log('folderPath', folderPath);


        for (const row of rows) {
            const link = row.LINK.replace('uploads\\', '');  
            console.log('link', link);
            const filePath = path.join(folderPath, link);
            console.log('filepath', filePath);
            
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

async function addAttachments(achievement, achievement_id) {
    const { ATTACHMENTS } = achievement;
    try {
        removeAttachments(achievement_id);

        for(const imagePath of ATTACHMENTS) {
            await promisePool.query(
                'INSERT INTO ATTACHMENT_LINKS (ACHIEVEMENT_ID, LINK) VALUES (?, ?)',
                [achievement_id, imagePath]
            );
        }
        console.log(`Фотографии ${achievement_id} обновлены успешно.`);
    } catch(error) {
        console.log('какой то даун сломал код ', error);
    }
}
    async function editAchievement(achievement, achievement_id) {
        const { USER_ID, CATEGORY, TITLE, DESCRIPTION, ATTACHMENTS } = achievement;
        try {
            /*
            removeAttachments(achievement_id);

            for(const imagePath of ATTACHMENTS) {
                await promisePool.query(
                    'INSERT INTO ATTACHMENT_LINKS (ACHIEVEMENT_ID, LINK) VALUES (?, ?)',
                    [achievement_id, imagePath]
                );
            }
                */

            await promisePool.query(
                'UPDATE ACHIEVEMENTS SET USER_ID = ?, CATEGORY = ?, TITLE = ?, DESCRIPTION = ? WHERE ACHIEVEMENT_ID = ?',
                [USER_ID, CATEGORY, TITLE, DESCRIPTION, achievement_id]
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

module.exports = {
    checkUserExist, createUser, updateUserName, createAchievement, deleteAchievement,
    editAchievement, getUserAchievements, addAttachments
}

