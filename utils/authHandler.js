let userController = require('../controllers/users')
let jwt = require('jsonwebtoken')
let { publicKey } = require('./jwtKeys')

module.exports = {
    CheckLogin: async function (req, res, next) {
        try {
            let token = req.headers.authorization;
            if (!token) {
                res.status(404).send({
                    message: "Bạn chưa đăng nhập."
                })
                return;
            }

            // Support "Bearer <token>" Authorization header format.
            if (token.toLowerCase().startsWith('bearer ')) {
                token = token.slice(7).trim();
            }

            let result = jwt.verify(token, publicKey, { algorithms: ['RS256'] })

            let user = await userController.GetAnUserById(result.id);
            if (!user) {
                res.status(404).send({
                    message: "Bạn chưa đăng nhập."
                })
                return;
            }
            req.user = user;
            next()
        } catch (error) {
            res.status(404).send({
                message: "Bạn chưa đăng nhập."
            })
        }
    }
}