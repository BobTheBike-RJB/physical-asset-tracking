//Connect to Environment.env file (named "Environment.env"), accessed in JS through process.env
require('dotenv').config({ path: "./Environment.env" });

// Database creation/connection
// Create and/or connect to existing database

// Log the database name to make sure process.env can access correctly
console.log(`Database name is ${process.env.DB_NAME}`);

// //Use Sequelize for setting data models, database creation, and querying
// import { Sequelize, DataTypes } from 'sequelize';
const Sequelize = require('sequelize');
// Open the database, create connection
const sequelize = new Sequelize({
    // The `host` parameter is required for all databases other than SQLite
    host: 'localhost',
    dialect: 'sqlite',
    storage: './DATABASE.db'
});

// Assign variable db to sequelize
db = {};
db.sequelize = sequelize;
db.Sequelize = Sequelize;

db.sequelize.authenticate()
    .then(() => {
        console.log('Connection has been established successfully.');
    })
    .catch(err => {
        console.error('Unable to connect to the database:', err);
    });

// TODO: Move models to their own folder? What is best practice?

const User = db.sequelize.define('user', {
    email: Sequelize.STRING
},
    {
        indexes: [
            // Create a unique index on email
            {
                unique: true,
                fields: ['email']
            }
        ]
    });

const Note = db.sequelize.define('note', {
    note: Sequelize.STRING,
    deleted: Sequelize.DATE,
    userId: {
        type: Sequelize.INTEGER,
        references: {
            model: 'users', // 'users' refers to table name
            key: 'id', // 'id' refers to column name in users table
        }
    }
});

User.hasMany(Note)

const Codes = db.sequelize.define('code', {
    code: Sequelize.STRING,
    deleted: Sequelize.DATE,
    userId: {
        type: Sequelize.INTEGER,
        references: {
            model: 'users', // 'users' refers to table name
            key: 'id', // 'id' refers to column name in users table
        }
    }
});

User.hasMany(Codes)

module.exports = db;