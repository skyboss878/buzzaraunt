const mysql = require('mysql2/promise');

async function setup() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'your_db_user',     // change this
    password: 'your_db_pass'  // change this
  });

  try {
    // Create the database
    await connection.query('CREATE DATABASE IF NOT EXISTS buzzaraunt');
    await connection.query('USE buzzaraunt');

    // Create tables
    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS restaurants (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT,
        name VARCHAR(255),
        address TEXT,
        plan_type VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS menus (
        id INT AUTO_INCREMENT PRIMARY KEY,
        restaurant_id INT,
        category VARCHAR(50),
        item_name VARCHAR(255),
        price DECIMAL(10,2),
        description TEXT,
        image_url TEXT,
        FOREIGN KEY (restaurant_id) REFERENCES restaurants(id)
      )
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id INT AUTO_INCREMENT PRIMARY KEY,
        restaurant_id INT,
        customer_name VARCHAR(255),
        customer_phone VARCHAR(20),
        items TEXT,
        total DECIMAL(10,2),
        status VARCHAR(50) DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (restaurant_id) REFERENCES restaurants(id)
      )
    `);

    console.log("✅ Database and tables created successfully.");
  } catch (error) {
    console.error("❌ Error setting up database:", error);
  } finally {
    await connection.end();
  }
}

setup();
