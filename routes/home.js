const {Router} = require('express')
const router = Router()
const Course = require('../models/course.js')

function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};

router.get('/', (req, res) => {
    res.status(200)
    res.render('index', {
        title: ' Главная',
        isHome: true
    })

})





module.exports = router