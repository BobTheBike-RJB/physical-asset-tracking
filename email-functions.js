// Email functions

//Connect to Environment.env file (named "Environment.env"), accessed in JS through process.env
require('dotenv').config({ path: "./Environment.env" });

//Emailing functions
const nm = require('nodemailer');

// // Settings for Ethereal.Email (TEST)
// const transporter = nm.createTransport({
//     auth:{
//         pass: process.env.TEST_EMAIL_PASS,
//         user: process.env.TEST_EMAIL_USER
//     },
//     secure: false,
//     host: 'smtp.ethereal.email',
//     port: 587
// });

// Settings for Zoho Mail (PROD)
const transporter = nm.createTransport({
    auth: {
        pass: process.env.EMAIL_PASS,
        user: process.env.EMAIL_USER
    },
    secure: true,
    host: 'smtppro.zoho.com',
    port: 465 || 587
});


// /**
// * Sends an email using the specified options object
// * @param {options} object - Options needed to successfully send an email (to,from,subject,html)
//  * 
// */
// function sendEmail(options) {

//     transporter.sendMail(options, (error, info) => {
//         if (error) {
//             console.log("Cannot send email")
//             console.log(error)
//             console.log(info.rejected)
//             return error
//         }
//         else {
//             console.log("Email sent!")
//             console.log(info)
//             return info
//         }
//     });
// }


module.exports = transporter;