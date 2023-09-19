//database functions for creating SQLite DB and handling CRUD operations

//new database connection
// either connects to existing database in this location, or creates a new database

function db_connect(path_to_database) {

    // Database creation/connection
    // Create and/or connect to existing database
    const sqlite3 = require('sqlite3').verbose();
    // Open the database
    let db = new sqlite3.Database(path_to_database);
    return db

}


module.exports = {db_connect}
