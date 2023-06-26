const mongoose = require('mongoose')

const ContactSchema = new mongoose.Schema({
	phoneNumber: String,
	scores: Number,
})

const Contact = mongoose.model('Contact', ContactSchema)

module.exports = {
	Contact,
}
