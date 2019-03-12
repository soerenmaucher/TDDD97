DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS loggedIn;
DROP TABLE IF EXISTS messages;
DROP TABLE IF EXISTS pictures;
DROP TABLE IF EXISTS videos;

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

CREATE TABLE pictures (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      picture TEXT NOT NULL,
      userEmail VARCHAR(50) NOT NULL,
      FOREIGN KEY (userEmail) REFERENCES users(email));

CREATE TABLE videos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      video TEXT NOT NULL,
      userEmail VARCHAR(50) NOT NULL,
      FOREIGN KEY (userEmail) REFERENCES users(email));

INSERT INTO users(email, password, firstName, familyName, gender, city, country)
VALUES ('soeren_maucher@web.de', '$2b$12$4/FYfl/j7f1H3YcnfW1youQ6IhAhAVbY2GQ3QaTSlsbuVOVqQWSxS', 'soeren', 'maucher', 'Male', 'linkoeping', 'sweden');
