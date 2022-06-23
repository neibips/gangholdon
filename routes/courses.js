const {Router} = require('express')
const {validationResult} = require('express-validator')
const {courseValidators} = require('../utils/validators')
const Course = require('../models/course.js')
const Ticket = require('../models/tickets.js')
const auth = require('../middleware/auth')
const router = Router()


function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
}
function isOwner(course, req){
    return course.userId.toString() === req.user._id.toString()
}

router.get('/', async (req, res) => {
    if(req.query.search) {
        const regex = new RegExp(escapeRegex(req.query.search), 'gi');
        console.log(regex)
        Course.find({'title': regex}, function (err, course) {
            if (err) {
                console.log(err)
            } else {
                res.render('courses', {
                    title: 'Результат поиска',
                    courses: course,
                    userId: req.user ? req.user._id.toString() : null,

                })

            }
        }).lean()
    }
    else{
        const courses = await Course.find()
        .lean()
        .populate('userId', 'name company')
        .select('title price company img city about offer request phone site moderated')



        res.render('courses', {
            title: 'Карточки компаний',
            isCourses: true,
            userId: req.user ? req.user._id.toString() : null,
            courses,
        })}

})

router.get('/:id/edit', auth, async (req, res) => {
    if (!req.query.allow) {
        return res.redirect('/')
    }
    try{
        const course = await Course.findById(req.params.id).lean()

        if(!isOwner(course, req)){
            res.redirect('/')
        }

        res.render('course-edit', {
            title: `Редактировать ${course.title}`,
            course
        })
    }catch (e) {
        console.log(e)
    }

})

router.post('/edit', auth, async (req, res) => {
    const {id} = req.body
    delete req.body.id
    try{
        const course = await Course.findById(id)
        if(!isOwner(course, req)){
            return res.redirect('/courses')
        }
        Object.assign(course, req.body)
        await course.save()
        await Course.findByIdAndUpdate(id, req.body)
        res.redirect('/courses')
    }catch (e) {
        console.log(e)
    }
})

router.post('/remove', auth, async (req, res) => {
    const {id} = req.body
    delete req.body.id

    try{
        await Course.deleteOne({_id: id,
        userId: req.user._id})
        res.redirect('/courses')
    }catch(e){
        console.log(e)
    }

})

router.post('/ticket', async (req, res) => {
    const course = await Course.findById(req.body.id).lean()
    const ticket = new Ticket({
        ticket: req.body.ticket,
        courseId: await Course.findOne(req.params.id)
    })
    try{
        ticket.save()
        res.redirect('/market')
    }catch (e) {
        console.log(e)
    }
})

router.get('/:id', async (req, res) => {
    console.log(req.params.id)
    const course = await Course.findById(req.params.id).lean()

    res.render('course', {
        title: `Курс ${course.title}`,
        course
    })
})

module.exports = router
