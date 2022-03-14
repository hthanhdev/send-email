"use strict";

const email = require('./../controllers/email');

module.exports = (router) => {
    router.route("/send-email").post(email.sendEmail)

    return router;
};