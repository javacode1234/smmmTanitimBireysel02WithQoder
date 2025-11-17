const mysql = require('mysql2');

// Create a connection to the database
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '1234',
  database: 'smmm_system',
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
  connection.query('CREATE DATABASE IF NOT EXISTS `smmm-system`', (error, results, fields) => {
    if (error) {
      console.error('❌ Failed to create database: ' + error.stack);
      return;
    }
    
    console.log('✅ Database created or already exists');
    
    // Now connect to the database
    connection.changeUser({database: 'smmm-system'}, (err) => {
      if (err) {
        console.error('❌ Failed to switch to database: ' + err.stack);
        return;
      }
      
      console.log('✅ Connected to smmm-system database');
      
      // Try a simple query
      connection.query('SELECT 1 + 1 AS solution', (error, results, fields) => {
    if (error) {
      console.error('❌ Query failed: ' + error.stack);
      return;
    }
    
    console.log('✅ Query result: ', results[0].solution);
    
    // Close the connection
    connection.end();
  });
});
    });
  });