const{body} = require('express-validator/check')
const User = require('../models/user')

exports.registerValidators =[
    body('email')
        .isEmail()
        .custom(async (value, {req}) => {
            try{
                const user = await User.findOne({email: value})
                if(user){
                    return Promise.reject('Такой email уже занят')
                }
            }catch (e) {
                console.log(e)
            }
        }).normalizeEmail(),
    body('password', 'Пароль должен содержать от 6 до 20 символов и буквы')
        .isLength({min: 6, max: 20})
        .isAlphanumeric()
        .trim(),
    body('confirm').custom((value, {req}) => {
        if(value !== req.body.password){
            throw new Error('Пароли должны совпадать')
        }
        return true
    }).trim(),
    body('name', '2 символа, не меньше').isLength({min: 2})
]

exports.loginValidators =[

]

exports.courseValidators = [
    body('img', 'Url написан неправильно').isURL(),
    body('about', 'Описание от 50 до 5000 символов').isLength({min: 50, max: 5000})
]