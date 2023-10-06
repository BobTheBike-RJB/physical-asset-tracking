// Starting point for Node.js Template App

//Connect to Environment.env file (named "Environment.env"), accessed in JS through process.env
require('dotenv').config({ path: "./Environment.env" });

// Create database and these tables, if they do not already exist

// Database creation/connection
// Create and/or connect to existing database
const sqlite3 = require('sqlite3').verbose();
// Open the database
const db = new sqlite3.Database(`./${process.env.DB_NAME}`);

// Log the database name to make sure process.env can access correctly
console.log(`Database name is ${process.env.DB_NAME}`);

// //Use Sequelize for setting data models, database creation, and querying
// import { Sequelize, DataTypes } from 'sequelize';
const Sequelize = require('sequelize');
const sequelize = new Sequelize({
    // The `host` parameter is required for all databases other than SQLite
    host: 'localhost',
    dialect: 'sqlite',
    storage: './DATABASE.db'
});

sequelize.authenticate()
    .then(() => {
        console.log('Connection has been established successfully.');
    })
    .catch(err => {
        console.error('Unable to connect to the database:', err);
    });

// const sequelize = new Sequelize('sqlite::memory:');
const Change = sequelize.define('changelog', {
    type: Sequelize.STRING
});
const User = sequelize.define('user', {
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
const Note = sequelize.define('note', {
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
exports.Note = Note;

User.hasMany(Note)

sequelize.sync()

/**
* Retrieves a user based on email
*/
function getUserByEmail(user_email) {
    return User.findOne({
        where: { email: user_email }
    }).then(response => {
        console.log(response.dataValues);//the object with the data I need
        return response.dataValues;
    });
};


// TODO: Use Passport JS for authentication and authorization, magic-link strategy


//Express app setup
const express = require('express');
const app = express();
exports.app = app;
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');
const favicon = require('serve-favicon');

const port = 3000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

app.listen(port, () => {
    console.log(`App is listening on port ${port}`);
});

//Emailing functions
const nm = require('nodemailer');

// // Settings for Ethereal.Email
// const transporter = nm.createTransport({
//     auth:{
//         pass: process.env.TEST_EMAIL_PASS,
//         user: process.env.TEST_EMAIL_USER
//     },
//     secure: false,
//     host: 'smtp.ethereal.email',
//     port: 587
// });

// Settings for Zoho Mail
const transporter = nm.createTransport({
    auth: {
        pass: process.env.EMAIL_PASS,
        user: process.env.EMAIL_USER
    },
    secure: true,
    host: 'smtppro.zoho.com',
    port: 465 || 587
});

// My Modules
// Authentication and authorization functions
const auth = require('./auth-functions.js');
const session_cookie_max_age = 15; //in minutes
exports.session_cookie_max_age = session_cookie_max_age;

//2023-07-29: Trying pug for templating
app.set('view engine', 'pug');

//Endpoints
const path = require('path');
const { SequelizeMethod } = require('sequelize');

//Favicon
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));

// Web page endpoints
// Root endpoint, Home page
app.get("/home", (req, res, next) => {
    res.sendFile(path.join(__dirname, 'public', 'Home.html'));
});


app.get("/main.js", (req, res, next) => {
    res.sendFile(path.join(__dirname, 'public', 'main.js'));
});

// Other commonly-used endpoints to redirect to /home
app.get(["/", "/index"], (req, res, next) => {
    res.redirect("/home");
});
//Get: Login page
app.get("/login", (req, res, next) => {
    res.sendFile(path.join(__dirname, 'public', 'Login.html'));
});
//Get: Dashboard page
app.get("/dashboard", async (req, res, next) => {

    //Starts the "authorization" workflow
    secure_page = true;
    if (req.cookies.session) {

        let encrypted_token = req.cookies.session;

        //Run authorization process
        var authorization = auth.auth_behavior(process.env.KEY, encrypted_token);
        auth_status = authorization["authorized"];

        //Conditional responses for token
        if (auth_status == true) {
            // If authorized, take to page and issue new session token for cookie
            console.log(authorization);

            //issue new session token cookie
            URL_encoded_encrypted_token = auth.issue_token(process.env.KEY, authorization["full-token"]["email"]);
            // Set cookie
            let options = {
                maxAge: session_cookie_max_age * 60 * 1000, // would expire after 15 minutes
                httpOnly: true // The cookie only accessible by the web server
            }
            res.cookie('session', URL_encoded_encrypted_token, options) // options is optional

            // TODO: Change over to use Sequelize
            // //Get data already stored for this user
            // let sql = (email) => `select * FROM notes where userid = (select id from users where email='${email}')`;
            // db.all(sql(authorization["full-token"]["email"]), (error, rows) => {
            //     console.log(rows);
            //     user_notes = { ...rows }

            //     //take to page
            //     // res.sendFile(path.join(__dirname,'/Dashboard.html'));
            //     res.render(path.join(__dirname, 'Pug_Dashboard.pug'), { pageTitle: 'Dashboard', appName: 'Web App Template', items: user_notes })
            // });
 
            // Seuelize method of doing above SQL
            //Get data already stored for this user
            let user = await getUserByEmail(authorization["full-token"]["email"]);
            let user_notes = await Note.findAll({where:{userId:user.id, deleted:null}})
            res.render(path.join(__dirname, 'Pug_Dashboard.pug'), { pageTitle: 'Dashboard', appName: 'Web App Template', items: user_notes })

        }
        else {
            console.log(authorization["server-message"]);
            res.redirect('/login');
        }
    }
    //No "session" cookie provided
    else {
        console.log("No session cookie provided for accessing secure page.");
        res.redirect('/login');
    }
    //Ends the "authorization" workflow
});
//Get: Authentication process launch page for emailed magic links
app.get("/auth", (req, res, next) => {

    //Starts the "authentication" workflow
    if (req.query.token) {

        var encrypted_token = req.query.token;

        //Run authorization process
        var authorization = auth.auth_behavior(process.env.KEY, encrypted_token);
        auth_status = authorization["authorized"];

        //Conditional responses for token
        if (auth_status == true) {
            // If authorized, take to page and issue new session token for cookie
            console.log(authorization);

            //Process for storing user, registering visit & token, and passing tokens for authentication during the session
            // - This should invalidate the token sent via email; and future requests passing the same token should display a message explaining why: 
            // they used a link that was already used to log-in via email.
            // If logged-in on this agent, then no worries.
            // If not logged-in, then send back to the login page.
            // - Do not reveal email address, only check token 

            // This will require storing live sessions in a database.
            // If they are logged-in, show live sessions (should only allow 1 at a time).

            // Sequalize version of user check and/or creation (depends on "unique" property of email in user records)
            User.create({ email: authorization["full-token"]["email"] })
                .then(function (User) {
                    console.log({
                        "Message": "Created record.",
                        "Record": User
                    })
                })
                .catch(function (err) {
                    if (err.name == 'SequelizeUniqueConstraintError') {
                        console.log("User record already exists")
                    }
                    else {
                        console.log(err)
                    }
                });

            //issue new session token cookie
            URL_encoded_encrypted_token = auth.issue_token(process.env.KEY, authorization["full-token"]["email"]);
            // Set cookie
            let options = {
                maxAge: session_cookie_max_age * 60 * 1000,
                httpOnly: true // The cookie only accessible by the web server
            }
            res.cookie('session', URL_encoded_encrypted_token, options) // options is optional

            //take to page
            res.redirect('/dashboard');
        }
        //Authentication differs from authorization here: authentication will try to send a new link to the original email in this case
        else if (auth_status == false && authorization["server-message"].includes("Token is expired")) {
            console.log(authorization["server-message"]);
            res.json({ "message": authorization["client-message"] });

        }
        else {
            console.log(authorization["server-message"]);
            res.redirect('/login');

        }
    }
    else {
        console.log("No token query parameter provided for authentication.");
        res.redirect('/login');
    }
    //Ends the "authentication" workflow
});

// API and service endpoints
//Post: Login authentication
// TODO: Replace this with a Passport JS strategy
app.post("/login", (req, res, next) => {

    var params = req.body;
    console.log("Login process started");

    // Check user against database
    if (params['login-type'] == "password") {

        //Only use for development, offline testing
        admin_creds = { email: "test@gmail.com", password: "BCDE" }
        if (params['email'] == admin_creds["email"] && params['password'] == admin_creds["password"]) {
            // res.json({message:`Email and password are valid. Username: ${admin_creds["email"]}, Password:${admin_creds["password"]}`})

            URL_encoded_encrypted_token = auth.issue_token(process.env.KEY, params['email']);

            //Write URI dynamically
            // Use the protocol and host as-is for now, but change to a whitelist later
            var proto = (req.headers['x-forwarded-proto'] === undefined) ? 'http' : req.headers['x-forwarded-proto'];
            var host = (req.headers['host'] === undefined) ? `localhost:${port.toString()}` : req.headers['host'];
            var login_url = proto + "://" + host + "/auth?token=" + URL_encoded_encrypted_token
            res.redirect(login_url);
        }
    }

    // Issue an email with single-use login token
    else if (params['login-type'] == "email") {

        URL_encoded_encrypted_token = auth.issue_token(process.env.KEY, params['email']);

        //Write URI dynamically
        // Use the protocol and host as-is for now, but change to a whitelist later
        var proto = (req.headers['x-forwarded-proto'] === undefined) ? 'http' : req.headers['x-forwarded-proto'];
        var host = (req.headers['host'] === undefined) ? `localhost:${port.toString()}` : req.headers['host'];
        var login_url = proto + "://" + host + "/auth?token=" + URL_encoded_encrypted_token

        var template = `<p>
                            This email contains a link to authenticate and login.<br>
                            URL: <a href='${login_url}'>${login_url}</a>
                            </p>`;

        let mail_options = {
            from: process.env.EMAIL_USER,
            html: template,
            subject: 'Magic Link Login | Web App Template',
            to: params['email']
        };

        transporter.sendMail(mail_options, (error, info) => {
            if (error) {
                console.log("Cannot send email")
                console.log(error)
                console.log(info.rejected)
                res.json({ message: "Uh oh, we couldn't send the authentication email." })
            }
            else {
                console.log("Email sent!")
                console.log(info)
                res.sendFile(path.join(__dirname, 'public', 'Success.html'));
            }
        });
    }
    else {
        res.json({ message: "Uh oh, no login method was specified." })
    }
});

//Get: all items
app.get("/items", (req, res, next) => {

    // //Logic to pull all items from the database

    res.json({ "message": "This will return all database records, not yet configured." })
});

// Post: add an item to the database
app.post("/api/item", async (req, res, next) => {

    //Starts the "authorization" workflow
    secure_page = true;
    if (req.cookies.session) {

        let encrypted_token = req.cookies.session;

        //Run authorization process
        var authorization = auth.auth_behavior(process.env.KEY, encrypted_token);
        auth_status = authorization["authorized"];

        //Conditional responses for token
        if (auth_status == true) {
            // If authorized, take to page and issue new session token for cookie
            console.log(authorization);

            //issue new session token cookie
            URL_encoded_encrypted_token = auth.issue_token(process.env.KEY, authorization["full-token"]["email"]);
            // Set cookie
            let options = {
                maxAge: session_cookie_max_age * 60 * 1000, // would expire after 15 minutes
                httpOnly: true // The cookie only accessible by the web server
            }
            res.cookie('session', URL_encoded_encrypted_token, options) // options is optional

            //Add new item to database, assigned to this user
            const getUserByEmail = user_email => {
                return User.findOne({
                    where: { email: user_email }
                }).then(response => {
                    console.log(response.dataValues);//the object with the data I need
                    return response.dataValues;
                });
            };

            user = await getUserByEmail(authorization["full-token"]["email"])

            let newNote = Note.create({ note: req.body['text'], userId: user["id"] })
                .then(function (SequelizeResponse) {
                    console.log(SequelizeResponse)
                })
                .catch(function (err) {
                    if (err.name == 'SequelizeUniqueConstraintError') {
                        console.log("Unique record already exists")
                    }
                    else {
                        console.log(err)
                    }
                });

            //take to page
            res.redirect('/dashboard');
        }
        else {
            console.log(authorization["server-message"]);
            res.redirect('/login');
        }
    }
    //No "session" cookie provided
    else {
        console.log("No session cookie provided for accessing secure page.");
        res.redirect('/login');
    }
    //Ends the "authorization" workflow

});

// TODO: Mark a 'status' column in the notes table of the db as "deleted"
// Delete: Mark database item as "deleted"
app.delete("/api/item/:id", (req, res, next) => {
    
    Note.update({deleted: Date()},{where:{ id: req.params.id }})
        .then( console.log("Marked item as deleted") )
    
    res.json({ "message": "This will mark the item/note as deleted, work-in-progress." })
});

app.use("/api", (req, res, next) => {
    res.json({ "message": "This will return API responses, not yet configured." })
});

// 404: Default response for any vague requests
app.all('*', (req, res) => {
    res.status(404).send('<h1>404! Page not found</h1>');
});

// Insert here other API endpoints