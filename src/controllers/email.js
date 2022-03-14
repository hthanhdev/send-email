const response = require('../utils/response')
const config = require('./../config')
exports.sendEmail = async (req, res) => {
    let {
        secret_key,
        password
    } = req.body

    if (!password) {
        return response.badRequest(res, {
            message: 'Missing password'
        })
    }

    if (!config['PASSWORD']) {
        return response.internalServerError(res, {
            message: 'Internal Server Error'
        })
    }

    if (password && config['PASSWORD'] && password != config['PASSWORD']) {
        return response.forbidden(res, {
            message: 'Incorrect password'
        })
    }

    return response.success(res, {
        data: 'Ok'
    })
}