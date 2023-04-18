require('dotenv').config({path: '../.env'})

const model = require('./model')
const { DateTime } = require('luxon')

model.from('Bill')
     .whereValue('guest_count', '=', 10)
     .select(['id', 'date', 'guest_count', 'enter_time', 'exit_time', 'dish_count', 'total_money'])
     .orderby(['total_money'])
     .query()
     .then(console.log)

model.execTableFunc('ThongKeDoanhThu', 2023)
     .then(console.log)

model.from('Bill')
     .insert({date: DateTime.now(), guest_count: 10, enter_time: '10:00'})