let { body, validationResult } = require('express-validator')
module.exports = {
    validatedResult: function (req, res, next) {
        let result = validationResult(req);
        if (result.errors.length > 0) {
            res.status(404).send(result.errors.map(
                function (e) {
                    return {
                        [e.path]: e.msg
                    }
                }
            ))
            return;
        }
        next()
    },
    CreateAnUserValidator: [
        body('email').notEmpty().withMessage("Email không được để trống").bail().isEmail().withMessage("Email sai định dạng"),
        body('username').notEmpty().withMessage("Username không được để trống").bail().isAlphanumeric().withMessage("Username không được chứa ký tự đặc biệt"),
        body('password').notEmpty().withMessage("Password không được để trống").bail().isStrongPassword({
            minLength: 8,
            minLowercase: 1,
            minNumbers: 1,
            minSymbols: 1,
            minUppercase: 1
        }).withMessage("Password phải có ít nhất 8 ký tự trong đó có ít nhất: 1 ký tự hoa, 1 ký tự thường, 1 ký tự đặc biệt và 1 ký tự số"),
        body('role').notEmpty().withMessage("Role không được để trống").bail().isMongoId().withMessage("Role phải là ID"),
        body('avatarUrl').optional().isArray().withMessage("Hình ảnh không hợp lệ"),
        body('avatarUrl.*').optional().isURL().withMessage("URL không hợp lệ")
    ],
    ModifyAnUserValidator: [
        body('email').optional().isEmail().withMessage("Email sai định dạng"),
        body('username').isEmpty().withMessage("Username không được cập nhật"),
        body('_id').isEmpty().withMessage("_ID không được cập nhật"),
        body('password').notEmpty().withMessage("Password không được để trống").bail().isStrongPassword({
            minLength: 8,
            minLowercase: 1,
            minNumbers: 1,
            minSymbols: 1,
            minUppercase: 1
        }).withMessage("Password phải có ít nhất 8 ký tự trong đó có ít nhất: 1 ký tự hoa, 1 ký tự thường, 1 ký tự đặc biệt và 1 ký tự số"),
        body('role').optional().isMongoId().withMessage("Role phải là ID"),
        body('avatarUrl').optional().isArray().withMessage("Hình ảnh không hợp lệ"),
        body('avatarUrl.*').optional().isURL().withMessage("URL không hợp lệ")
    ],
    ChangePasswordValidator: [
        body('oldPassword').notEmpty().withMessage("oldPassword không được để trống"),
        body('newPassword').notEmpty().withMessage("newPassword không được để trống").bail().isStrongPassword({
            minLength: 8,
            minLowercase: 1,
            minNumbers: 1,
            minSymbols: 1,
            minUppercase: 1
        }).withMessage("newPassword phải có ít nhất 8 ký tự trong đó có ít nhất: 1 ký tự hoa, 1 ký tự thường, 1 ký tự đặc biệt và 1 ký tự số")
    ]
}