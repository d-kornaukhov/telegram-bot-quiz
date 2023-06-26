const express = require('express')
const mongoose = require('mongoose')
const bot = require('./bot')
require('dotenv').config()

const PORT = process.env.PORT || 3000
const TOKEN = process.env.TOKEN
const MONGODB = process.env.MONGODB

const app = express()

const start = async () => {
	try {
		await mongoose.connect(MONGODB, {
			useNewUrlParser: true,
		})
		app.listen(PORT, () => {
			bot.startBot(TOKEN)
		})
	} catch (e) {
		console.log(e)
	}
}

start()
