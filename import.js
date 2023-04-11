//6izziokYgD+cSJWdv+QqhQ4nkYQgxL06ntaIKT7YgyxiHlNHwuJQGGDp5ZY+UCTpZDTlGuXJzBgiIFChzTHn0ww0+PMqUqL+g3paqd7zeT8+DOZnznmbOqSnQ5lWvN4mqIG5hYo1yEMDPveDk7e8hbiyERuYYIGnIvJAoPOpWQy/5Fp29FnTiSIIwAWfrugxosfsFABM9lLAi9Bed3rHz4SwhMLkQ/hkFUycQIu/Cn5stlPyWstvEEDud5RWPZPaUEnXdDu43TbycA3H8+L4qJahjlAKegtJc+grZ54Hc2HlJUUyAfsRtQzJy7Yk+5T9YAbc5rPbJPXEZlw4cToFI8oJBZQfeLSt+p+jL1Aqz1NPBKaJmDphXjY0CWiTQegr9gnxE/2ip+lTr3x724B3WMVy3BaPFoxygTJv51ZJOdzS/AePdADcZJobrcD0+UObzm/bYZckdhOfyT5khh+DXKwuKUnweUaAu2PWJCzeTCAYe72eqvhJPBkVeGxahQti
const dotenv = require('dotenv').config()

const CryptoJS = require("crypto-js")
const fs = require('fs')
const axios = require('axios')
const moment = require('moment')

const path = require('path')
const sql = require('mssql')
const sqlConfig = {
    user:process.env.DBUSER,
    password:process.env.PASS,
    server:process.env.S,
    database:process.env.DB,
    options:{
        trustServerCertificate: true,
    }
}

const importData =  async () => {
    
    await sql.connect(sqlConfig)
    const db = await sql.query `select * from osk order by DATE_D DESC`
    sql.close()
    const jsonStr = JSON.stringify(db)
    fs.writeFileSync('sync/data', jsonStr)

    
   
}

const importKDK =  async () => {
    
    await sql.connect(sqlConfig)
    const db = await sql.query `select * from kdk`
    sql.close()
    const jsonStr = JSON.stringify(db)
    fs.writeFileSync('sync/dataKDK', jsonStr)

    
   
}

const imports = async () => {
    const start = moment()
    console.log('start import')
   await importKDK()

    await importData()
    const diff = moment(start).diff(moment())
    console.log('Import end in: '+diff*(-1)+'ms')
}

imports()



