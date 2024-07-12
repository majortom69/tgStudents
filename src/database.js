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

async function checkUserExist(user_id) { // проверка на существование юзера
    try{
        const [rows] = await promisePool.query('SELECT * FROM USERS WHERE USER_ID = ?', [user_id]);
        return rows.length > 0;
    } catch(error) {
        console.log('какой то даун сломал код ', error);
    }
}

async function checkGroupExist(group_id) { // проверка на существование группы
    try {
        const [rows] = await promisePool.query('SELECT * FROM USERS WHERE STUDENT_GROUP = ?', [group_id]);
        return rows.length > 0;
    } catch (error) {
        console.log('какой-то даун сломал код ', error);
    }
}

async function createUser(user_data) { // создать юзера
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

async function updateUserName(user_id, new_name) { // изменить имя
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

async function updateUserRole(user_id, new_role) { // изменить роль (студент/препод)
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

async function updateStudentGroup(user_id, new_group) { // изменить студенческую группу
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
    const { userId, category, title, description, filePaths } = achievement;

    const normalizePath = (path) => path.replace('/uploads/uploads/', '/uploads/');
    
    try {
        const [result] = await promisePool.query(
            'INSERT INTO ACHIEVEMENTS (USER_ID, TITLE, DESCRIPTION, CATEGORY) VALUES (?, ?, ?, ?)',
            [userId, title, description, category]
        );

        

        const achievementId = result.insertId;

        if (Array.isArray(filePaths)) {
            for (let filePath of filePaths) {
                console.log(filePath);
                filePath = normalizePath(filePath);
                await promisePool.query(
                    'INSERT INTO ATTACHMENT_LINKS (ACHIEVEMENT_ID, LINK) VALUES (?, ?)',
                    [achievementId, filePath]
                );
                console.log(filePath);
            }
        } else if (filePaths) { // Если filePaths не пустой, но не массив
            const normalizedPath = normalizePath(filePaths);
            await promisePool.query(
                'INSERT INTO ATTACHMENT_LINKS (ACHIEVEMENT_ID, LINK) VALUES (?, ?)',
                [achievementId, normalizedPath]
            );
        }

        console.log('Ачивка добавлена успешно');
        return achievementId;

    } catch (error) {
        console.log('какой то даун сломал код ', error);
    }
}


async function deleteAchievement(achievement_id) { // удалить достижение 
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
async function removeAttachments(achievement_id) { // удалить вложения у достижения
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

    const normalizePath = (path) => path.replace('/uploads/uploads/', '/uploads/');

    try {
        await removeAttachments(achievement_id); // Дожидаемся успешного удаления вложений

        // После успешного удаления вставляем новые вложения
        for (let imagePath of ATTACHMENTS) {
            console.log(imagePath);
            imagePath = normalizePath(imagePath);
            await promisePool.query(
                'INSERT INTO ATTACHMENT_LINKS (ACHIEVEMENT_ID, LINK) VALUES (?, ?)',
                [achievement_id, imagePath]
            );
            console.log(imagePath);
        }
        console.log(`Фотографии для ${achievement_id} успешно обновлены.`);
    } catch (error) {
        console.error('Ошибка при добавлении вложений:', error);
    }
}


    async function editAchievement(achievement, achievement_id) { // отредактировать достижение
        const { USER_ID, CATEGORY, TITLE, DESCRIPTION, /*ATTACHMENTS*/ } = achievement;
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

async function getUserAchievements(user_id) { // получить массив достижений по id
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

async function isUserTeacher(user_id) { // юзур - учитель?
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

async function updateAchievementComment(achievement_id, comment, teacherName, currentDate) {
    try {
        const [result] = await promisePool.query(
            'UPDATE ACHIEVEMENTS SET COMMENT = ?, PROFFESOR_NAME = ?, ACHIEVEMENT_DATE = ? WHERE ACHIEVEMENT_ID = ?',
            [comment, teacherName, currentDate, achievement_id]
        );

        if (result.affectedRows > 0) {
            console.log('Комментарий к достижению успешно обновлен');
        } else {
            console.log('Достижение с указанным ID не найдено');
        }
    } catch (error) {
        console.log('Ошибка при обновлении комментария к достижению:', error);
    }
}


async function getGroupAchievements(group_id) { // получить массив достижений по id группы
    try {
        const [users] = await promisePool.query(
            'SELECT USER_ID FROM USERS WHERE STUDENT_GROUP = ?',
            [group_id]
        );

        const userIds = users.map(user => user.USER_ID);

        if (userIds.length === 0) {
            console.log('Группа с указанным ID не найдена');
            return [];
        }

        const [achievements] = await promisePool.query(
            'SELECT * FROM ACHIEVEMENTS WHERE USER_ID IN (?)',
            [userIds]
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

async function getAchievementById(achievement_id) { // получить достижение по id
    try {
        // Получаем достижение по ID
        const [achievements] = await promisePool.query(
            'SELECT * FROM ACHIEVEMENTS WHERE ACHIEVEMENT_ID = ?',
            [achievement_id]
        );

        if (achievements.length === 0) {
            console.log('Достижение с указанным ID не найдено');
            return null;
        }

        const achievement = achievements[0];

        // Получаем вложения для этого достижения
        const [attachments] = await promisePool.query(
            'SELECT LINK FROM ATTACHMENT_LINKS WHERE ACHIEVEMENT_ID = ?',
            [achievement_id]
        );

        achievement.ATTACHMENTS = attachments.map(a => a.LINK);

        return achievement;
    } catch (error) {
        console.log('какой-то даун сломал код ', error);
        return null;
    }
}

async function getUserDataById(user_id) {
    try {
        // Проверка существования пользователя
        const userExists = await checkUserExist(user_id);
        if (!userExists) {
            console.log('Пользователь с указанным ID не найден');
            return null;
        }

        // Получение данных пользователя
        const [userRows] = await promisePool.query('SELECT USERNAME, USER_TYPE, STUDENT_GROUP FROM USERS WHERE USER_ID = ?', [user_id]);
        const user = userRows[0];

        // Получение количества достижений пользователя
        const [achievementRows] = await promisePool.query('SELECT COUNT(*) AS achievement_count FROM ACHIEVEMENTS WHERE USER_ID = ?', [user_id]);
        const achievementCount = achievementRows[0].achievement_count;

        // Формирование результата
        const userData = {
            name: user.USERNAME,
            role: user.USER_TYPE,
            group: user.STUDENT_GROUP,
            achievements: achievementCount
        };

        console.log('User Data:', userData);
        return userData;
    } catch (error) {
        console.log('какой-то даун сломал код ', error);
    }
}

async function getAchievementsWithComments(user_id) {
    try {
        const [achievements] = await promisePool.query(
            'SELECT a.ACHIEVEMENT_ID, a.TITLE, a.COMMENT, a.PROFFESOR_NAME ' +
            'FROM ACHIEVEMENTS a ' +
            'WHERE a.USER_ID = ? ' +
            'AND a.COMMENT IS NOT NULL ' +
            'AND a.COMMENT != ""',
            [user_id]
        );

        console.log(`Достижения с комментариями пользователя ${user_id} успешно получены.`);
        return achievements;
    } catch (error) {
        console.log('какой-то даун сломал код ', error);
        return [];
    }
}

module.exports = {
    checkUserExist, createUser, updateUserName, createAchievement, deleteAchievement,
    editAchievement, getUserAchievements, addAttachments, getUsernameByUserId, getStudentGroupByUserId,
    getCategoryByAchievementId, isUserTeacher, updateUserRole, updateStudentGroup, updateAchievementComment, getGroupAchievements, checkGroupExist, getAchievementById, getUserDataById, getAchievementsWithComments
}

