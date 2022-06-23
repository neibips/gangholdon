const {Router} = require('express')
const router = Router()
const Course = require('../models/course.js')
const Ticket = require('../models/tickets.js')

router.get('/', async (req, res) => {
    const tickets = await Ticket
        .find()
        .lean()
        .populate('courseId', 'title phone')
        .select('ticket')
    res.render('market', {
        title: 'Торговая площадка',
        isMarket: true,
        tickets
    })
})

module.exports = router