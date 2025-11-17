const mysql = require('mysql2');

// Create a connection to the database
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '1234',
  port: 3306
});

// Connect to the database
connection.connect((err) => {
  if (err) {
    console.error('❌ Database connection failed: ' + err.stack);
    return;
  }
  
  console.log('✅ Connected to database as id ' + connection.threadId);
  
  // Create database if it doesn't exist
  connection.query('CREATE DATABASE IF NOT EXISTS `smmm_system`', (error, results, fields) => {
    if (error) {
      console.error('❌ Failed to create database: ' + error.stack);
      return;
    }
    
    console.log('✅ Database created or already exists');
    
    // Now connect to the database
    connection.changeUser({database: 'smmm_system'}, (err) => {
      if (err) {
        console.error('❌ Failed to switch to database: ' + err.stack);
        return;
      }
      
      console.log('✅ Connected to smmm_system database');
      
      // Create a simple test table to verify the connection
      const createTableQuery = `
        CREATE TABLE IF NOT EXISTS customers (
          id VARCHAR(191) NOT NULL,
          companyName VARCHAR(191) NOT NULL,
          PRIMARY KEY (id)
        ) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
      `;
      
      connection.query(createTableQuery, (error, results, fields) => {
        if (error) {
          console.error('❌ Failed to create table: ' + error.stack);
          return;
        }
        
        console.log('✅ Test table created or already exists');
        
        // Close the connection
        connection.end();
        console.log('✅ Database initialization completed');
      });
    });
  });
});