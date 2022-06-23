const {Schema, model} = require('mongoose')

const course = new Schema({
    title: {
        type: String,
        required: true
    },
    company: {
        type: String,
        required: true
    },
    price: {
        type: Number
    },
    about: {
        type: String,
        required: true
    },
    city: {
        type: String,
        required: true
    },
    offer: {
        type: String,
        required: true
    },
    requestF: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    telegram: String,
    site: String,
    img: String,
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    }
})

course.method('toClient', function(){
    const course = this.toObject()

    course.id = course._id
    delete course._id

    return course
})


module.exports = model('Course', course)