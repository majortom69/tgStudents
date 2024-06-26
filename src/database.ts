import mysql from 'mysql2'
import dotenv from 'dotenv';
dotenv.config();

const pool = mysql.createPool({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    database: process.env.MYSQL_DATABASE,
    password: process.env.MYSQL_PASSWORD
    // port: process.env.MYSQL_PORT ? parseInt(process.env.MYSQL_PORT, 10) : undefined
});

interface User {
    user_id: bigint;
    username: string;
    user_type: 'student' | 'teacher' | 'admin';
}

const promisePool = pool.promise();

async function checkUserExists(user_id: bigint): Promise<boolean> {
    try {
        const [rows] = await promisePool.query('SELECT * FROM USERS WHERE USER_ID = ?', [user_id]);
        return (rows as any[]).length > 0;
    } catch (error) {
        console.error('еррорка при проверки на существоание пользователя:', error);
        throw error;
    }
}

export async function createUser(user: User): Promise<void> { 
    console.log('funcion callled');
    const { user_id, username, user_type } = user;
    try {
        const userExists = await checkUserExists(user_id);
        if (userExists) {
            console.log('пользователь с данным id уже существует');
            return;
        }
        await promisePool.query( 'INSERT INTO USERS (USER_ID, USERNAME, USER_TYPE) VALUES (?, ?, ?)',
            [user_id, username, user_type]
        );

        console.log('пользователь создан успешно');
    } catch (error) {
        console.error('еррорка при создании пользователя:', error);
        throw error;
    }
} 


