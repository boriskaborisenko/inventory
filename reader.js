const fs = require('fs')



    fs.readFile('sync/data', 'utf8', (err, data) => {
        const result = JSON.parse(data)
        console.log(result)
    })
