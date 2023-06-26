const TelegramBot = require('node-telegram-bot-api')
const { Contact } = require('./db')

const startBot = token => {
	const bot = new TelegramBot(token, { polling: true })
	const { questions } = require('./data')

	let currentIndex = 0
	let correctAnswers = 0
	let testInProgress = false
	let scores = 0
	let scoreUp = 5
	let scoreDown = 3

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
			let resultMessage = `Тест завершен! Вы набрали ${scores} баллов. Введите команду /test или нажмите кнопку ниже, чтобы перепройти тест`

			const shareContactButton = [
				{ text: 'Поделиться контактом', request_contact: true },
			]

			const retryButtonText = 'Перепройти тест'
			const options = {
				reply_markup: {
					keyboard: [[{ text: retryButtonText }], shareContactButton],
					resize_keyboard: true,
				},
			}

			await bot.sendMessage(msg.chat.id, resultMessage, options)

			return
		}

		const text = question.text
		const questionButtons = {
			reply_markup: {
				keyboard: question.buttons,
				resize_keyboard: true,
			},
			parse_mode: 'HTML',
		}
		const chat = msg.hasOwnProperty('chat') ? msg.chat.id : msg.from.id

		await bot.sendMessage(chat, text, questionButtons)
	}

	bot.onText(/^$/, async msg => {
		const infoMessage =
			'Добро пожаловать в наш бот! Нажмите кнопку "Начать тест", чтобы начать тестирование.'
		const startButton = [{ text: '/test' }]
		const options = {
			reply_markup: {
				keyboard: [startButton],
				resize_keyboard: true,
			},
		}

		await bot.sendMessage(msg.chat.id, infoMessage, options)
	})

	bot.onText(/\/start/, async msg => {
		await bot.sendMessage(msg.chat.id, 'Введите команду /test, чтобы начать')
	})

	bot.onText(/\/test/, async msg => {
		await bot.sendMessage(msg.chat.id, 'Начинаем тест')
		initializeTest()
		await newQuestion(msg)
	})

	bot.on('message', async msg => {
		if (!testInProgress) return

		const selectedOption = msg.text
		const currentQuestion = questions[currentIndex - 1]

		if (currentQuestion && selectedOption === currentQuestion.right_answer) {
			correctAnswers++
			scores += scoreUp
		} else {
			scores -= scoreDown
		}
		if (scores < 0) scores = 0

		await newQuestion(msg)
	})

	bot.on('contact', async msg => {
		const { phone_number: phoneNumber } = msg.contact

		const newContact = new Contact({ phoneNumber, scores })
		await newContact.save()

		bot.sendMessage(msg.chat.id, `Ваши данные сохранены`)
	})

	bot.onText(/Перепройти тест/, async msg => {
		initializeTest()
		await newQuestion(msg)
	})
}

module.exports = {
	startBot,
}
