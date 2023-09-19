//Authentication and authorization functions
//Consolidate all of these processes into this file

// This includes many things:
// - Format and configuring tokens
// - Authorizing tokens (decrypting and checking expiration times)
// - Responding to different Authorization Statuses
// - Processing the whole flow for accessing "secured/authentication-required" pages

// 2023-07-22:  There are some known issues with this implementation and the flow could be made more efficient in the future.
//              As a development exercise, though, this was very rewarding and I am happy I built it myself the first time (technically second time if we cound Chute).

const token_template = (email, expiration_time) => `{"${email}":${expiration_time}}`

//Issue tokens here

/**
 * 
 * @param {string} password The plaintext password/secret to be used for encrypting the token
 * @param {string} email The user's email address 
 * @param {int} expiration_minutes Number of minutes until token's expiration
 * @returns An encrypted, URL-encoded token for authenticating and authorizing user requests
 */
function issue_token(password, email, expiration_minutes=60){

    expiration_time = Date.now() + 60000*expiration_minutes;
    // Fill template here
    clear_string_token = token_template(email, expiration_time);
    // Importing and use cryptography functions from module
    var c = require('./crypto-functions.js'); 
    var URL_encoded_encrypted_token = c.encrypt_function(password, clear_string_token);
    return URL_encoded_encrypted_token

}

function authorize(password, encrypted_token) {
    
    // console.log("Length of URL-encoded, encrypted token: " + encrypted_token.length);

    var c = require('./crypto-functions.js');
    
    try{
        clear_string_token = c.decrypt_function(password, encrypted_token);
    }
    catch(error){
        console.log("ERROR: Could not decrypt token.")
        return "Decrypt error"
    }

    var JSON_token = JSON.parse(clear_string_token);
    var expiration_time = JSON_token[Object.keys(JSON_token)[0]];

    try {
        authorization_status = (Date.now() <= expiration_time);
    }
    catch (error) {
        console.log("ERROR: Token expiration time could not be compared to current time.")
        return "Token format error"
    }

    full_token = {"email":Object.keys(JSON_token)[0],
                "expiration_time":expiration_time,
                "auth_status":authorization_status}

    console.log(full_token);
    return full_token;
}

function auth_behavior(password, encrypted_token) {

    //Set check to pre-empt computation for decryption: just checking if the passed token is shorter than 90 characters
    if (encrypted_token < 90) {       
        return {"server-message":"Token is shorter than the pre-decryption token check.",
                "client-message":"Bad token.",
                "authorized":false};
    }

    var full_token = authorize(password, encrypted_token);
    auth_status = full_token["auth_status"];

    //Conditional responses for token
    if (auth_status == true) {
        return {"server-message":"Valid token",
                "client-message":"",
                "authorized":auth_status,
                "full-token":full_token};
    }
    else if (auth_status == false) {
        return {"server-message":"Token is expired",
                "client-message":"Token is expired, this should begin a flow to re-send the token to the email.",
                "authorized":auth_status,
                "full-token":full_token};
    }
    else if (auth_status === undefined) {
        return {"server-message":"Token is not correctly structured, or failed to decrypt.",
                "client-message":"Bad token",
                "authorized":false,
                "full-token":full_token};
    }
    else {
        return {"server-message":"No behavior setup for this token-related issue.",
                "client-message":"Bad token",
                "authorized":false,
                "full-token":full_token};
    }

}

module.exports = {token_template, issue_token, authorize, auth_behavior};