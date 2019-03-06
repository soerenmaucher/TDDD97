DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS loggedIn;
DROP TABLE IF EXISTS messages;
DROP TABLE IF EXISTS pictures;

CREATE TABLE users (
       firstName VARCHAR(50) NOT NULL,
       familyName VARCHAR(50) NOT NULL,
       gender VARCHAR(6) NOT NULL,
       city VARCHAR(50) NOT NULL,
       country VARCHAR(50) NOT NULL,
       email VARCHAR(50) PRIMARY KEY,
       password VARCHAR(50) NOT NULL);

CREATE TABLE loggedIn (
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

CREATE TABLE pictures (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      picture TEXT NOT NULL,
      userEmail VARCHAR(50) NOT NULL,
      authorEmail VARCHAR(50) NOT NULL,
      FOREIGN KEY (userEmail) REFERENCES users(email),
      FOREIGN KEY (authorEmail) REFERENCES users(email));

INSERT INTO users(email, password, firstName, familyName, gender, city, country)
VALUES ('test@test.com', 'password', 'john', 'doe', 'Male','USA', 'New York');

INSERT INTO users(email, password, firstName, familyName, gender, city, country)
VALUES ('soeren_maucher@web.de', 'password', 'soeren', 'maucher', 'Male', 'Linkoeping', 'Sweden');

INSERT INTO messages(message, userEmail, authorEmail)
VALUES ('Hello Soeren from John', 'soeren_maucher@web.de', "test@test.com");

INSERT INTO messages(message, userEmail, authorEmail)
VALUES ('Hello John from Soeren', "test@test.com", 'soeren_maucher@web.de');

INSERT INTO messages(message, userEmail, authorEmail)
VALUES ('Hello myself', 'test@test.com', "test@test.com");
