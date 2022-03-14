"use strict";

const dotenv = require("dotenv");

dotenv.config();
const env = process.env.NODE_ENV || "development";

//console.log(process)

const configs = {
    base: {
        env,
        rootUrl: process.env.ROOT_URL || "http://localhost:7070",
        name: process.env.APP_NAME || "sendemail",
        host: process.env.APP_HOST || "0.0.0.0",
        port: process.env.APP_PORT || 7070,
        secret: process.env.APP_SECRET || "secret",
        version: process.env.APP_VERSION || "1.0.0",
        utc: process.env.UTC || 7,
        language: process.env.LANGUAGE || "en",
        jwt_expiration: process.env.JWT_EXP || "1d",
        jwt_secret: process.env.JWT_SECRET || "secret",
        secret_key: process.env.SECRET_KEY || null,
        sendgrid_key: process.env.sendgrid_key || null,
    },
};

// const envConfig = require(`./${env}`)
// callback hell
let envConfig;


const config = Object.assign(configs.base, envConfig);

module.exports = config;