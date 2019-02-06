DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS loggedInUsers;
DROP TABLE IF EXISTS messages;

CREATE TABLE users (
       firstName VARCHAR(50) NOT NULL,
       familyName VARCHAR(50) NOT NULL,
       gender VARCHAR(6) NOT NULL,
       city VARCHAR(50) NOT NULL,
       country VARCHAR(50) NOT NULL,
       email VARCHAR(50) PRIMARY KEY,
       password VARCHAR(50) NOT NULL);

CREATE TABLE loggedInUsers (
       token VARCHAR(36) PRIMARY KEY,
       email VARCHAR(50) NOT NULL,
       FOREIGN KEY (email) REFERENCES users(email));

CREATE TABLE messages (
       id INTEGER PRIMARY KEY AUTOINCREMENT,
       message TEXT NOT NULL,
       userEmail VARCHAR(50) NOT NULL,
       authorEmail VARCHAR(50) NOT NULL,
       FOREIGN KEY (userEmail) REFERENCES users(email),
       FOREIGN KEY (authorEmail) REFERENCES users(email));

INSERT INTO users(email, password, firstName, familyName, gender, city,
       country) VALUES ('test@web.de', 'password', 'john', 'doe', 'Male',
       'Linkoping', 'Sweden');

INSERT INTO messages(message, userEmail, authorEmail)
          VALUES ('test message', 'test@web.de', "test2@web.de");
INSERT INTO messages(message, userEmail, authorEmail)
          VALUES ('second test message', 'test@web.de', "test2@web.de");
INSERT INTO messages(message, userEmail, authorEmail)
          VALUES ('thirs test message', 'test@web.de', "test2@web.de");
