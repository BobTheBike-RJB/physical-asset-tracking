//crypto functions for handling tokens
//Taken largely from: https://dev.to/halan/4-ways-of-symmetric-cryptography-and-javascript-how-to-aes-with-javascript-3o1b

//Encrypt
function encrypt_function(password, cleartext, bytes = 16) {

    const crypto = require('crypto');

    salt = crypto.randomBytes(bytes);
    iv = crypto.randomBytes(bytes);
    key = crypto.pbkdf2Sync(password, salt, 100000, 256 / 8, 'sha256');

    cipher = crypto.createCipheriv('aes-256-cbc', key, iv);

    cipher.write(cleartext);
    cipher.end();

    encrypted = cipher.read();
    cyphertext = Buffer.concat([salt, iv, encrypted]).toString('base64');

    cyphertext = encodeURIComponent(cyphertext)

    return cyphertext;
}

//Decrypt 
function decrypt_function(password, cyphertext) {

    const crypto = require('crypto');
    URL_decoded = decodeURIComponent(cyphertext);

    encrypted = Buffer.from(URL_decoded, 'base64');
    const salt_len = iv_len = 16;

    salt = encrypted.slice(0, salt_len);
    iv = encrypted.slice(0 + salt_len, salt_len + iv_len);
    key = crypto.pbkdf2Sync(password, salt, 100000, 256 / 8, 'sha256');

    decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);

    // decipher.setAutoPadding(false);

    decipher.write(encrypted.slice(salt_len + iv_len));
    decipher.end();

    decrypted = decipher.read();
    cleartext = decrypted.toString();

    return cleartext;
}


//Include token structure, configuration here in the future

function authorize(password, encrypted_token) {
    
    // console.log("Length of URL-encoded, encrypted token: " + encrypted_token.length);
    
    try{
        clear_string_token = decrypt_function(password, encrypted_token);
    }
    catch(error){
        console.log("ERROR: Could not decrypt token.")
        return "Decrypt error"
    }

    JSON_token = JSON.parse(clear_string_token);
    expiration_time = JSON_token[Object.keys(JSON_token)[0]];

    try {
        authorization_status = (Date.now() <= expiration_time);
    }
    catch (error) {
        console.log("ERROR: Token expiration time could not be compared to current time.")
        return "Token format error"
    }

    full_token = {"email":Object.keys(JSON_token)[0],
                "expiration_time":expiration_time,
                "authorized":authorization_status}

    console.log(full_token);
    return full_token;
}

module.exports = {encrypt_function, decrypt_function, authorize};