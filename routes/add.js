const {Router} = require('express')
const {validationResult} = require('express-validator')
const {courseValidators} = require('../utils/validators')
const Course = require('../models/course')
const auth = require('../middleware/auth')
const router = Router()

router.get('/', auth, (req, res) => {
    res.render('add', {
        title: ' Добавить',
        isAdd: true
    })
})
router.post('/', auth, courseValidators, async (req, res) => {
    const errors = validationResult(req)

    if(!errors.isEmpty()){
        return res.status(422).render('add', {
            title: 'Добавить',
            isAdd: true,
            error: errors.array()[0].msg,
            data: {
                title: req.body.title,
                company: req.body.company,
                img: req.body.img,
                userId: req.user,
                city: req.body.city,
                about: req.body.about,
                offer: req.body.offer,
                requestF: req.body.requestF,
                phone: req.body.phone,
                telegram: req.body.telegram,
                site: req.body.site
            }
        })
    }


    const course = new Course({
        title: req.body.title,
        company: req.body.company,
        img: req.body.img,
        userId: req.user,
        city: req.body.city,
        about: req.body.about,
        offer: req.body.offer,
        requestF: req.body.requestF,
        phone: req.body.phone,
        telegram: req.body.telegram,
        site: req.body.site
    })

    try{
        await course.save()

        res.redirect('/courses')
    }catch (e) {
        console.log(e)
    }

})
module.exports = router
