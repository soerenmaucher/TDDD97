DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS loggedIn;
DROP TABLE IF EXISTS messages;

CREATE TABLE users (
       firstName VARCHAR(50) NOT NULL,
       familyName VARCHAR(50) NOT NULL,
       gender VARCHAR(6) NOT NULL,
       city VARCHAR(50) NOT NULL,
       country VARCHAR(50) NOT NULL,
       email VARCHAR(50) PRIMARY KEY,
       password VARCHAR(100) NOT NULL);

CREATE TABLE loggedIn (
       token VARCHAR(100) PRIMARY KEY,
       email VARCHAR(50) NOT NULL,
       FOREIGN KEY (email) REFERENCES users(email));

CREATE TABLE messages (
       id INTEGER PRIMARY KEY AUTOINCREMENT,
       message TEXT NOT NULL,
       userEmail VARCHAR(50) NOT NULL,
       authorEmail VARCHAR(50) NOT NULL,
       FOREIGN KEY (userEmail) REFERENCES users(email),
       FOREIGN KEY (authorEmail) REFERENCES users(email));

INSERT INTO messages(message, userEmail, authorEmail)
VALUES ('Hello Soeren from John', 'soeren_maucher@web.de', "test@test.com");

INSERT INTO messages(message, userEmail, authorEmail)
VALUES ('Hello John from Soeren', "test@test.com", 'soeren_maucher@web.de');

INSERT INTO messages(message, userEmail, authorEmail)
VALUES ('Hello myself', 'test@test.com', "test@test.com");
