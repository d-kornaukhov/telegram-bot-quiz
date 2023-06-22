const TelegramBot = require("node-telegram-bot-api")
const TOKEN = "5600917968:AAHT6bsKHrqweVU_Ufqq4z0HgaJ5i26K2XQ"
// import { config } from 'dotenv'
// import express from 'express'

const bot = new TelegramBot(TOKEN, { polling: true })

let currentIndex = 0
let correctAnswers = 0
let testInProgress = false
let scores = 0

const initializeTest = () => {
	currentIndex = 0
	correctAnswers = 0
	scores = 0
	testInProgress = true
}

const getNextQuestion = () => {
	const nextQuestion = questions[currentIndex]
	currentIndex++
	return nextQuestion
}

const newQuestion = async msg => {
	if (!testInProgress) return

	const question = getNextQuestion()
	if (!question) {
		testInProgress = false
		let resultMessage
		resultMessage = `Тест завершен! вы набрали ${scores} баллов. Введите команду /test или нажмите кнопку ниже, чтобы перепройти тест`

		const startButton = [{ text: "/test" }]
		const shareContactButton = [
			{ text: "Поделится контактом", request_contact: true },
		]
		const options = {
			reply_markup: {
				keyboard: [startButton, shareContactButton],
				resize_keyboard: true,
				one_time_keyboard: true,
			},
		}
		await bot.sendMessage(msg.chat.id, resultMessage, options)

		return
	}

	const text = question.text
	const options = {
		reply_markup: {
			keyboard: question.buttons,
			resize_keyboard: true,
		},
		parse_mode: "HTML",
	}
	const chat = msg.hasOwnProperty("chat") ? msg.chat.id : msg.from.id

	await bot.sendMessage(chat, text, options)
}

bot.onText(/^$/, async msg => {
	const infoMessage =
		'Добро пожаловать в наш бот! Нажмите кнопку "Начать тест", чтобы начать тестирование.'
	const startButton = [{ text: "/test" }]
	const options = {
		reply_markup: {
			keyboard: [startButton],
			resize_keyboard: true,
		},
	}

	await bot.sendMessage(msg.chat.id, infoMessage, options)
})

bot.onText(/\/start/, async msg => {
	const startButton = [{ text: "/test" }]
	const options = {
		reply_markup: {
			keyboard: [startButton],
			resize_keyboard: true,
		},
	}

	await bot.sendMessage(
		msg.chat.id,
		'Нажмите кнопку "Начать тест", чтобы начать тест.',
		options
	)
})

bot.onText(/\/test/, async msg => {
	initializeTest()
	await newQuestion(msg)
})

bot.on("message", async msg => {
	if (!testInProgress) return

	const selectedOption = msg.text
	const currentQuestion = questions[currentIndex - 1]

	if (currentQuestion && selectedOption === currentQuestion.right_answer) {
		correctAnswers++
		scores += 5
	} else {
		scores -= 3
	}
	if (scores < 0) scores = 0

	await newQuestion(msg)
})

const questions = [
	{
		text: `
<b>Вопрос 1</b>\n
<b>2 + 2</b>\n
<b>Варианты ответов</b>\n
1️⃣  2\n
2️⃣  22\n
3️⃣  4
        `,
		buttons: [
			[{ text: "Ответ 1" }],
			[{ text: "Ответ 2" }],
			[{ text: "Ответ 3" }],
		],
		right_answer: "Ответ 3",
		id: 1,
	},
	{
		text: `
<b>Вопрос 2</b>\n
<b>Название нашей планеты</b>\n
<b>Варианты ответов</b>\n
1️⃣  Юпитер\n
2️⃣  Земля\n
3️⃣  Меркурий\n
4️⃣  Венера
        `,
		buttons: [
			[{ text: "Ответ 1" }],
			[{ text: "Ответ 2" }],
			[{ text: "Ответ 3" }],
			[{ text: "Ответ 4" }],
		],
		right_answer: "Ответ 2",
		id: 2,
	},
	{
		text: `
<b>Вопрос 3</b>\n
<b>Столица Японии</b>\n
<b>Варианты ответов</b>\n
1️⃣  Ереван\n
2️⃣  Тайбэй\n
3️⃣  Токио\n
4️⃣  Рига
        `,
		buttons: [
			[{ text: "Ответ 1" }],
			[{ text: "Ответ 2" }],
			[{ text: "Ответ 3" }],
			[{ text: "Ответ 4" }],
		],
		right_answer: "Ответ 3",
		id: 3,
	},
]
