const mysql = require('mysql2');
const dotenv= require('dotenv')

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

module.exports ={
    checkUserExist, createUser, updateUserName, createAchievement
}
