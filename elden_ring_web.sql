drop database if exists elden_ring_web;
create database elden_ring_web;
use elden_ring_web;

CREATE TABLE users (
    id_user INT AUTO_INCREMENT PRIMARY KEY,

    name VARCHAR(100) NOT NULL,
    surnames VARCHAR(150) NULL,
    birth_date DATE NOT NULL,

    email VARCHAR(150) NOT NULL UNIQUE,
    username VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,

    avatar VARCHAR(255) DEFAULT 'default.png',
    role ENUM('user','admin') DEFAULT 'user',

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP

) ENGINE=InnoDB
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;