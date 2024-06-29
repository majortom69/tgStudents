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
        return rows.length() > 0;
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

module.exports ={
    checkUserExist, createUser
}
