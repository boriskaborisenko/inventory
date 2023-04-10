const moment = require('moment')
const fs = require('fs')

const start = moment('1970-01-01').format('YYYY-MM-DD')

let day = start
let i = 0
const arr = []


do{
    day = moment(day).add(1,'days').format('YYYY-MM-DD')
    i++
    console.log(day)
    arr.push(moment(day).format('DDMMYYYY'))
    
}
while(i < 365 * 61 )
console.log(arr)
fs.writeFileSync('dates.txt', arr.join('\n'))

