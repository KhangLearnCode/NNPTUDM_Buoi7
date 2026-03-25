let express = require('express');
let router = express.Router()
let userController = require('../controllers/users')
let bcrypt = require('bcrypt');
const { CheckLogin } = require('../utils/authHandler');
const { validatedResult, ChangePasswordValidator } = require('../utils/validator');
const { privateKey } = require('../utils/jwtKeys');
let jwt = require('jsonwebtoken')

router.post('/register', async function (req, res, next) {
    try {
        let { username, password, email } = req.body;
        let newUser = await userController.CreateAnUser(username, password, email,
            "69b10eeb3c777ca002239580"
        )
        res.send(newUser)
    } catch (error) {
        res.status(404).send({
            message: error.message
        })
    }
})

router.post('/login', async function (req, res, next) {
    try {
        let { username, password } = req.body;
        let user = await userController.GetAnUserByUsername(username);
        if (!user) {
            res.status(404).send({
                message: "Thông tin đăng nhập không đúng."
            })
            return;
        }
        if (user.lockTime > Date.now()) {
            res.status(404).send({
                message: "Bạn đang bị cấm đăng nhập."
            })
            return;
        }
        if (bcrypt.compareSync(password, user.password)) {
            user.loginCount = 0;
            await user.save()
            let token = jwt.sign({
                id: user._id
            }, privateKey, {
                algorithm: 'RS256',
                expiresIn: '1d'
            })
            res.send(token)
        } else {
            user.loginCount++;
            if (user.loginCount == 3) {
                user.loginCount = 0;
                user.lockTime = Date.now() + 3600 * 1000;
            }
            await user.save()
            res.status(404).send({
                message: "Thông tin đăng nhập không đúng."
            })
        }
    } catch (error) {
        res.status(404).send({
            message: error.message
        })
    }
})
router.get('/me', CheckLogin, function (req, res, next) {
    res.send(req.user)
})

router.post('/changepassword', CheckLogin, ChangePasswordValidator, validatedResult, async function (req, res, next) {
    try {
        let { oldPassword, newPassword } = req.body;
        let user = req.user;

        if (!bcrypt.compareSync(oldPassword, user.password)) {
            res.status(400).send({
                message: "oldPassword không chính xác."
            })
            return;
        }

        if (oldPassword === newPassword) {
            res.status(400).send({
                message: "newPassword phải khác oldPassword."
            })
            return;
        }

        user.password = newPassword;
        await user.save();

        res.send({
            message: "Đổi mật khẩu thành công."
        })
    } catch (error) {
        res.status(404).send({
            message: error.message
        })
    }
})

module.exports = router