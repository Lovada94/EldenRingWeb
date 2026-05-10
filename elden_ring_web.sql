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
    avatar VARCHAR(255) DEFAULT 'default_avatar.jpg',
    role ENUM('user','admin') DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP

) ENGINE=InnoDB
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

CREATE TABLE favorites (
    id_favorite INT AUTO_INCREMENT PRIMARY KEY,
    id_user INT NOT NULL,
    api_id VARCHAR(50) NOT NULL,
    category VARCHAR(50) NOT NULL,
    name VARCHAR(150) NOT NULL,
    image VARCHAR(255) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_user) REFERENCES users(id_user) ON DELETE CASCADE,
    UNIQUE KEY unique_favorite (id_user, api_id, category)
) ENGINE=InnoDB
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;
ALTER TABLE favorites
ADD COLUMN quest_status ENUM('pending', 'in_progress', 'completed')
DEFAULT 'pending' NULL;
ALTER TABLE favorites ADD COLUMN subcategory VARCHAR(100) NULL;

CREATE TABLE team (
    id_team INT AUTO_INCREMENT PRIMARY KEY,
    id_user INT NOT NULL UNIQUE,

    -- Armas mano derecha (max 3)
    weapon_r1 VARCHAR(50) NULL,
    weapon_r2 VARCHAR(50) NULL,
    weapon_r3 VARCHAR(50) NULL,

    -- Armas mano izquierda (max 3)
    weapon_l1 VARCHAR(50) NULL,
    weapon_l2 VARCHAR(50) NULL,
    weapon_l3 VARCHAR(50) NULL,

    -- Flechas (max 2)
    arrow1 VARCHAR(50) NULL,
    arrow2 VARCHAR(50) NULL,

    -- Saetas (max 2)
    bolt1 VARCHAR(50) NULL,
    bolt2 VARCHAR(50) NULL,

    -- Armadura (1 por slot)
    armor_head  VARCHAR(50) NULL,
    armor_chest VARCHAR(50) NULL,
    armor_hands VARCHAR(50) NULL,
    armor_legs  VARCHAR(50) NULL,

    -- Talismanes (max 4)
    talisman1 VARCHAR(50) NULL,
    talisman2 VARCHAR(50) NULL,
    talisman3 VARCHAR(50) NULL,
    talisman4 VARCHAR(50) NULL,

    -- Objetos rápidos (max 10)
    item1  VARCHAR(50) NULL,
    item2  VARCHAR(50) NULL,
    item3  VARCHAR(50) NULL,
    item4  VARCHAR(50) NULL,
    item5  VARCHAR(50) NULL,
    item6  VARCHAR(50) NULL,
    item7  VARCHAR(50) NULL,
    item8  VARCHAR(50) NULL,
    item9  VARCHAR(50) NULL,
    item10 VARCHAR(50) NULL,

    FOREIGN KEY (id_user) REFERENCES users(id_user) ON DELETE CASCADE
) ENGINE=InnoDB
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

CREATE TABLE posts (
    id_post INT AUTO_INCREMENT PRIMARY KEY,
    id_user INT NOT NULL,
    id_team INT NULL,
    title VARCHAR(255) NOT NULL,
    content TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (id_user) REFERENCES users(id_user) ON DELETE CASCADE,
    FOREIGN KEY (id_team) REFERENCES team(id_team) ON DELETE SET NULL
) ENGINE=InnoDB CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE comments (
    id_comment INT AUTO_INCREMENT PRIMARY KEY,
    id_post INT NOT NULL,
    id_user INT NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_post) REFERENCES posts(id_post) ON DELETE CASCADE,
    FOREIGN KEY (id_user) REFERENCES users(id_user) ON DELETE CASCADE
) ENGINE=InnoDB CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;