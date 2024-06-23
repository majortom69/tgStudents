-- mysql -h 147.45.77.19 -u root -p

CREATE TABLE USERS (
    USER_ID BIGINT PRIMARY KEY,
    USERNAME VARCHAR(255) NOT NULL,
    USER_TYPE ENUM ('student', 'teacher', 'admin') NOT NULL,
    registration_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE ACHIEVEMENTS(
    ACHIEVEMENT_ID INT AUTO_INCREMENT PRIMARY KEY,
    USER_ID BIGINT NOT NULL,
    TITLE VARCHAR(255),
    DESCRIPTION TEXT,
    ACHIEVEMENT_DATE DATE,
    CATEGORY ENUM('scientific', 'sports', 'cultural', 'other') NOT NULL,
    FOREIGN KEY (USER_ID) REFERENCES USERS(USER_ID)
);

CREATE TABLE ATTACHMENT_LINKS(
    ATTACHMENT_ID INT AUTO_INCREMENT PRIMARY KEY,
    ACHIEVEMENT_ID INT NOT NULL,
    LINK VARCHAR(255) NOT NULL,
    FOREIGN KEY (ACHIEVEMENT_ID) REFERENCES ACHIEVEMENTS(ACHIEVEMENT_ID)
);