const response = require('../utils/response')
const config = require('./../config')
const moment = require('moment')
const Axios = require('axios')
const Path = require('path')
const fs = require('fs')
const nodemailer = require('nodemailer')

const nodemailerSendGrid = require('nodemailer-sendgrid')
let isValid = (arrSubUrl) => {
    let error = false

    for (let item of arrSubUrl) {
        if (!item.slug || !item.params) {
            error = true
        }
    }
    return error
}
exports.sendEmail = async (req, res) => {
    let {
        secret_key,
        password,
        urlRoot,
        email,
        arrSubUrl,
        info_mail
    } = req.body
    let data = {
        time_start: null,
        time_end: null,
        url: urlRoot || null,
        receivers: null,
        attachments: []
    }
    if (!arrSubUrl || arrSubUrl && arrSubUrl.length == 0) {
        return response.badRequest(res, {
            message: 'arrSubUrl length min 1'
        })
    }
    let isCheckValid = isValid(arrSubUrl)
    if (isCheckValid) {
        return response.badRequest(res, {
            message: 'arrSubUrl miss slug || params'
        })
    }
    data.time_start = moment().format('YYYY-MM-DD HH:mm:ss')
    console.log("TIME START ===================================================================", data.time_start)

    if (!secret_key) {
        return response.badRequest(res, {
            message: 'Missing secret_key'
        })
    }

    if (!config['secret_key']) {
        return response.internalServerError(res, {
            message: 'Internal Server Error'
        })
    }

    if (secret_key && config['secret_key'] && secret_key != config['secret_key']) {
        return response.forbidden(res, {
            message: 'Incorrect secret_key'
        })
    }


    let token = await getToken(urlRoot, email, password)
    if (!token) {
        return response.internalServerError(res, {
            message: `Cannot get token urlRoot:${urlRoot}, email :${email}, password: ${password}`
        })
    }
    for (const subUrl of arrSubUrl) {
        try {
            let getItemFile = await getFile(urlRoot, subUrl.slug, token, subUrl.params, data.attachments)
            if (!getItemFile) {
                return response.internalServerError(res, {
                    message: `Cannot get token getFile : ${subUrl.slug}, params:${subUrl.params}`
                })
            }
        } catch (error) {
            return response.internalServerError(res, {
                message: `Cannot get token getFile : ${subUrl.slug}, params:${subUrl.params}`
            })
        }
    }

    try {
        await emailSend(info_mail, data.attachments)
    } catch (error) {
        console.log("Cannot send mail sendEmail", error)
        return response.internalServerError(res, {
            message: `Cannot send mail sendEmail`
        })
    }

    data.time_end = moment().format('YYYY-MM-DD HH:mm:ss')
    console.log("TIME END =====================================================================", data.time_end)
    return response.success(res, {
        data: data
    })
}

let getToken = async (url, email, password) => {
    let data = {
        email: email,
        password: password,
    }

    let urlLogin = `${url}/login`

    try {
        let responseData = await Axios.post(urlLogin, data, {
            headers: {
                'Content-Type': 'application/json',
            }
        });

        return responseData.data.token || "";
    } catch (err) {
        console.log('Err get data token : ', err);
        return ""
    }
}


let getFile = async (urlRoot, subUrl, token, params, attachments) => {
    let url = `${urlRoot}/${subUrl}?${params}`
    try {
        let responseData = await Axios.get(url, {
            headers: {
                Authorization: 'Bearer ' + token,
                'Content-Type': 'application/json',
            },
            responseType: "stream",
        });
        let filename = responseData.headers['content-disposition'].split('filename=')[1].split('.')[0];
        let extension = responseData.headers['content-disposition'].split('.')[1].split(';')[0];

        const path = Path.resolve(__dirname, '', `${filename}.${extension}`)
        const writer = fs.createWriteStream(path)
        attachments.push({
            path: path,
            name: filename
        })
        responseData.data.pipe(writer)
        return responseData || "";
    } catch (err) {
        console.log('subUrl', subUrl)
        console.log('Err get data dataExport : ', err);
        return ""
    }
}

let emailSend = async (info_mail, attachments) => {
    const transporter = nodemailer.createTransport(
        nodemailerSendGrid({
            apiKey: config['sendgrid_key']
        })
    );
    try {
        await transporter.sendMail({
            from: `${info_mail.email_name} ${info_mail.email_send}`,
            to: info_mail.receivers,
            subject: info_mail.title,
            text: info_mail.content,
            attachments: attachments
        })
    } catch (error) {
        console.log("🚀 ~ file: 20220312_cronjob_send_email.js ~ line 87 ~ sendEmail ~ error", error)
    }


    console.log("-------- Send Gmail --------");
    console.log("Time sent: %s", moment().format("YYYY-MM-DD HH:mm:ss"));
    console.log("Gmail receivers: %s", info_mail.receivers);
    console.log("----------------------------");
}