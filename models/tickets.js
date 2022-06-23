const {Schema, model} = require('mongoose')


const ticketsSchema = new Schema({
    ticket: {
        type: String,
        required: true
    },
    courseId: {
        type: Schema.Types.ObjectId,
        ref: 'Course'
    }

})

module.exports = model('Ticket', ticketsSchema)