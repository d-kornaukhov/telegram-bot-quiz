const TelegramBot = require('node-telegram-bot-api')
const TOKEN = '5600917968:AAHT6bsKHrqweVU_Ufqq4z0HgaJ5i26K2XQ'

const bot = new TelegramBot(TOKEN, { polling: true })

var questions = [
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
			[
				{
					text: 'Ответ 1',
					callback_data: '0_1',
				},
			],
			[
				{
					text: 'Ответ 2',
					callback_data: '0_2',
				},
			],
			[
				{
					text: 'Ответ 3',
					callback_data: '0_3',
				},
			],
		],
		right_answer: 3,
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
			4️⃣  Меркурий\n
		`,
		buttons: [
			[{ text: 'Ответ 1', callback_data: '1_1' }],
			[{ text: 'Ответ 2', callback_data: '1_2' }],
			[{ text: 'Ответ 3', callback_data: '1_3' }],
			[{ text: 'Ответ 4', callback_data: '1_4' }],
		],
		right_answer: 2,
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
			4️⃣  Рига\n
		`,
		buttons: [
			[{ text: 'Ответ 1', callback_data: '2_1' }],
			[{ text: 'Ответ 2', callback_data: '2_2' }],
			[{ text: 'ответ 3', callback_data: '2_3' }],
			[{ text: 'Ответ 4', callback_data: '2_4' }],
		],
		right_answer: 3,
		id: 3,
	},
]

let currentIndex = 0
let correctAnswers = 0

const initialeStateTest = () => {
	currentIndex = 0
	correctAnswers = 0
}

const getNextQuestion = () => {
	const nextQuestion = questions[currentIndex]
	currentIndex = currentIndex % questions.length
	return nextQuestion
}

const newQuestion = async msg => {
	const question = getNextQuestion()
	if (!question) {
		const percentage = (correctAnswers / questions.length) * 100
		const resultMessage = `Тест завершен! Вы набрали ${percentage}% правильных ответов. Введите команду /test или нажмите кнопку ниже, чтобы перепройти тест`

		await bot.sendMessage(msg.chat.id, resultMessage)
		initialeStateTest()
		return
	}

	const text = question.text
	const options = {
		reply_markup: {
			inline_keyboard: question.buttons,
		},
		parse_mode: 'HTML',
	}
	const chat = msg.hasOwnProperty('chat') ? msg.chat.id : msg.from.id

	await bot.sendMessage(chat, text, options)
}

bot.on('callback_query', async query => {
	const selectedOption = query.data.split('_')[1]
	const currentQuestion = questions[currentIndex]

	if (parseInt(selectedOption) === currentQuestion.right_answer) {
		correctAnswers++
	}
	currentIndex++

	await newQuestion(query.message)
})

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
	const startButton = [{ text: '/test' }]
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

	initialeStateTest()
})

bot.onText(/\/test/, async msg => {
	initialeStateTest()
	await newQuestion(msg)
})
