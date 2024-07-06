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

async function updateUserRole(user_id, new_role) {
    try {
        const [result] = await promisePool.query('UPDATE USERS SET USER_TYPE = ? WHERE USER_ID = ?', [new_role, user_id]);
        if (result.affectedRows > 0) {
            console.log('Роль пользователя успешно обновлена');
        } else {
            console.log('Пользователь с указанным ID не найден');
        }
    } catch (error) {
        console.log('какой-то даун сломал код ', error);
    }
}

async function updateStudentGroup(user_id, new_group) {
    try {
        const [user] = await promisePool.query('SELECT USER_TYPE FROM USERS WHERE USER_ID = ?', [user_id]);
        if (user.length > 0 && user[0].USER_TYPE === 'student') {
            const [result] = await promisePool.query('UPDATE USERS SET STUDENT_GROUP = ? WHERE USER_ID = ?', [new_group, user_id]);
            if (result.affectedRows > 0) {
                console.log('Студенческая группа успешно обновлена');
            } else {
                console.log('Пользователь с указанным ID не найден');
            }
        } else {
            console.log('Пользователь не является студентом или не найден');
        }
    } catch (error) {
        console.log('какой-то даун сломал код ', error);
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
        return achievementId;

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



async function getUsernameByUserId(userId) {
    try {
        const [rows] = await promisePool.query('SELECT USERNAME FROM USERS WHERE USER_ID = ?', [userId]);
        if (rows.length > 0) {
            const username = rows[0].USERNAME;
            console.log('Username:', username);
            return username;
        } else {
            console.log('User with the specified ID not found');
            return null;
        }
    } catch (error) {
        console.log('какой-то даун сломал код ', error);
    }
}

async function getStudentGroupByUserId(userId) {
    try {
        const [rows] = await promisePool.query('SELECT STUDENT_GROUP FROM USERS WHERE USER_ID = ?', [userId]);
        if (rows.length > 0) {
            const studentGroup = rows[0].STUDENT_GROUP;
           
            return studentGroup;
        } else {
            console.log('нет юзера с таким ID');
            return null;
        }
    } catch (error) {
        console.log('какой-то даун сломал код ', error);
    }
}

async function getCategoryByAchievementId(achievement_id) {
    try {
        const [rows] = await promisePool.query('SELECT CATEGORY FROM ACHIEVEMENTS WHERE ACHIEVEMENT_ID = ?', [achievement_id]);
        if (rows.length > 0) {
            const category = rows[0].CATEGORY;
          
            return category;
        } else {
            console.log('ачивка с id  не найдена');
            return null;
        }
    } catch (error) {
        cconsole.log('какой-то даун сломал код ', error);
    }
}

async function isUserTeacher(user_id) {
    try {
        const [rows] = await promisePool.query('SELECT USER_TYPE FROM USERS WHERE USER_ID = ?', [user_id]);
        if (rows.length > 0) {
            return rows[0].USER_TYPE === 'teacher';
        } else {
            console.log('Пользователь с указанным ID не найден');
            return false;
        }
    } catch (error) {
        console.log('какой-то даун сломал код ', error);
        return false;
    }
}

module.exports = {
    checkUserExist, createUser, updateUserName, createAchievement, deleteAchievement,
    editAchievement, getUserAchievements, addAttachments, getUsernameByUserId,getStudentGroupByUserId,
    getCategoryByAchievementId, isUserTeacher, updateUserRole, updateStudentGroup
}

