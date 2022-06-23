const {Router} = require('express')
const {validationResult} = require('express-validator')
const crypto = require('crypto')
const router = Router()
const bcrypt = require('bcryptjs')
const User = require('../models/user')
const {registerValidators} = require('../utils/validators')
const keys = require('../keys/index')
const nodemailer = require('nodemailer')
const regEmail = require('../emails/registration')
const sendgrid = require('nodemailer-sendgrid-transport')
const resetEmail = require('../emails/reset')

const transporter = nodemailer.createTransport(sendgrid({
    auth: {api_key: keys.SENDGRID_API_KEY}
}))


router.get('/login', (req, res) => {
    res.render('auth/login', {
        title: 'Авторизация',
        isLogin: true,
        loginError: req.flash('loginError')

    })
})
router.get('/signin', (req, res) => {
    res.render('auth/signup', {
        title: 'Авторизация',
        isSignin: true,
        signinError: req.flash('signinError'),

    })
})


router.get('/logout', (req, res) => {
    req.session.destroy(() => {
        res.redirect('/auth/login')
    })
})

router.post('/login', async(req, res) => {
    try{
        const {email, password} = req.body

        const candidate = await User.findOne({ email })

        if(candidate){
            const areSame = await bcrypt.compare(password, candidate.password)

            if(areSame){

                req.session.user = candidate
                req.session.isAuthenticated = true
                req.session.save(err => {
                    if(err) {
                        throw err
                    }
                    res.redirect('/')
                })
            }else{
                req.flash('loginError', 'Такого пользователя мы не нашли')
                res.redirect('/auth/login')
            }
        }else{
            req.flash('loginError', 'Такого пользователя мы не нашли')
            res.redirect('/auth/login')
        }
    }catch (e) {
        console.log(e)
    }


})

router.post('/signin',registerValidators, async (req, res) => {
    try{
        const {email, password, repeat, name} = req.body


        const errors = validationResult(req)
        if(!errors.isEmpty()){
            req.flash('signinError', errors.array()[0].msg)
            return res.status(422).redirect('/auth/signin')
        }

        req.flash('signinError', 'Пользователь с таким email уже существует')
        const hashPassword = await bcrypt.hash(password, 10)
        const user = new User({
                email, name, password: hashPassword, cart: {items: []}
        })
        await user.save()
        res.redirect('/auth/login')
        await transporter.sendMail(regEmail(email, name))

    }catch (e) {
        console.log(e)
    }

})

router.get('/reset', (req, res)=>{
    res.render('auth/reset',{
        title: 'Забыли пароль',
        error: req.flash('error')
    })
})

router.post('/reset', (req, res) => {
    try {
        crypto.randomBytes(32, async (err, buffer) => {
            if (err) {
                req.flash('error', 'Что-то пошло не так, повторите попытку позже')
                return res.redirect('/auth/reset')
            }

            const token = buffer.toString('hex')
            const candidate = await User.findOne({email: req.body.email})


            if (candidate) {
                candidate.resetToken = token
                candidate.resetTokenExp = Date.now() + 60 * 60 * 1000
                await candidate.save()
                await transporter.sendMail(resetEmail(candidate.email, token, candidate.name))
                res.redirect('/auth/login')
            } else {
                req.flash('error', 'Такого email нет')
                res.redirect('/auth/reset')
            }
        })
    } catch (e) {
        console.log(e)
    }
})

router.get('/password/:token', async (req, res)=>{
    if(!req.params.token){
        return res.redirect('/auth/login')
    }

    try {
        const user = await User.findOne({
            resetToken: req.params.token,
            resetTokenExp: {$gt: Date.now()}
        })
        if(!user){
            res.redirect('/auth/login')
        }else{
            res.render('auth/password',{
                title: 'Восстановление пароля',
                error: req.flash('error'),
                userId: user._id.toString(),
                token: req.params.token

            })
        }
    }catch (e) {
        console.log(e)
    }

})

router.post('/password', async (req, res) => {
    try{
        const user = await User.findOne({
            _id: req.body.userId,
            resetToken: req.body.token,
            resetTokenExp: {$gt: Date.now()}
        })

        if(user){
            user.password = await bcrypt.hash(req.body.password, 10)
            user.resetToken = undefined
            user.resetTokenExp = undefined
            await user.save()
            res.redirect('/auth/login')

        }else{
            req.flash('loginError', 'Token life is over')
            user.resetToken = undefined
            user.resetTokenExp = undefined
            res.redirect('/auth/login')
        }
    }catch (e) {
        console.log(e)
    }
})

module.exports = router