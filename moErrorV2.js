const dotenv = require('dotenv').config()
const moment = require('moment')
const fsp = require('fs/promises')
const fs = require('fs')
const axios = require('axios')

const cron = require('node-cron');

const sql = require('mssql')
const sqlConfig = {
    user:process.env.DBUSER,
    password:process.env.PASS,
    server:process.env.S,
    database:process.env.DB,
    options:{
        encrypt: false,
        trustServerCertificate: true,
    }
    /*,
    pool: {
        max: 10,
        min: 0,
        idleTimeoutMillis: 30000
    }*/
}


const start = moment()

const createACCE = async () => {

    await sql.connect(sqlConfig)
    const data = await sql.query `select * from ACCE where DATE_D >= Convert(datetime, '2023-01-01' )`
    
    const jsonStr = JSON.stringify(data)
    fs.writeFileSync('sync/.acce', jsonStr)
    console.log('fileCreated')

    sql.close()

}

const createKAUGV = async () => {
    await sql.connect(sqlConfig)
    const data = await sql.query `select * from KAUGV`
    
    const jsonStr = JSON.stringify(data)
    fs.writeFileSync('sync/.kaugv', jsonStr)
    console.log('fileCreated')

    sql.close()
    
}

const createDMZ = async () => {
    await sql.connect(sqlConfig)
    const data = await sql.query `select * from DMZ where DATE_D >= Convert(datetime, '2023-01-01' )`
    
    const jsonStr = JSON.stringify(data)
    fs.writeFileSync('sync/.dmz', jsonStr)
    console.log('fileCreated')

    sql.close()
    
}

const createITSRCVAL = async () => {
    await sql.connect(sqlConfig)
    const data = await sql.query `select * from ITSRCVAL where idist = 60`
    
    const jsonStr = JSON.stringify(data)
    fs.writeFileSync('sync/.itsrcval', jsonStr)
    console.log('fileCreated')

    sql.close()
    
}

const createKEKV = async () => {
    await sql.connect(sqlConfig)
    const data = await sql.query `select * from ITSRCVAL where idist = 56`
    
    const jsonStr = JSON.stringify(data)
    fs.writeFileSync('sync/.kekv', jsonStr)
    console.log('fileCreated')

    sql.close()
    
}


const readAll = async (from, to) => {
    
    const readACCE = await fsp.readFile('sync/.acce', { encoding: 'utf8' })
    const readKAUGV = await fsp.readFile('sync/.kaugv', { encoding: 'utf8' })
    const readITSRCVAL = await fsp.readFile('sync/.itsrcval', { encoding: 'utf8' })
    const readDMZ = await fsp.readFile('sync/.dmz', { encoding: 'utf8' })
    const readKEKV = await fsp.readFile('sync/.kekv', { encoding: 'utf8' })
    
    const DATA = {
        ACCE: JSON.parse(readACCE).recordset,
        KAUGV: JSON.parse(readKAUGV).recordset,
        ITSRCVAL: JSON.parse(readITSRCVAL).recordset,
        DMZ: JSON.parse(readDMZ).recordset,
        KEKV: JSON.parse(readKEKV).recordset,
    }

    console.log(DATA.ACCE.length+' -> ACCE rows | ', DATA.KAUGV.length+' -> KAUGV rows | ', DATA.ITSRCVAL.length+' -> ITSRCVAL rows | ', DATA.DMZ.length+' -> DMZ rows', DATA.KEKV.length+' -> KEKV rows')

    const ACCE = []

    DATA.ACCE.map(a=>{
        
            if(moment(moment(a.DDM).format('YYYY-MM-DD')).isSameOrAfter(from) && moment(moment(a.DDM).format('YYYY-MM-DD')).isSameOrBefore(to)){
               ACCE.push({
                   GUIDDMZ: a.GUIDDMZ,
                   SUMMA: a.SUMMA, 
                   FIO_D: a.FIO_D,
                   DDM: moment(a.DDM).format('DD.MM.YYYY'),
                   DB: a.DB,
                   CR: a.CR,
                   UNIQGUID: a.UNIQGUID,
                   GKAUDB: a.GKAUDB,
                   GKAUCR: a.GKAUCR
               })
           }
           
    
    })

    
    ACCE.map(a => {
        const findKAUGV_CR = DATA.KAUGV.filter(x => x.GKAUGUID === a.GKAUCR)
        const findKAUGV_DB = DATA.KAUGV.filter(x => x.GKAUGUID === a.GKAUDB)
        const crs = []
        const dbs = []
        findKAUGV_CR.map( c =>{
            crs.push(c.GKAUVALUE)
        })
        findKAUGV_DB.map( d =>{
            dbs.push(d.GKAUVALUE)
        })
        a.GKAU_CR_VALUES = crs
        a.GKAU_DB_VALUES = dbs
       
    })

    

    ACCE.map(a => {
        if(a.GKAUDB != '00000000-0000-0000-0000-000000000000' && a.GKAUCR != '00000000-0000-0000-0000-000000000000'){
            a.GKAU_CR_VALUES.map(ax => {
                const IT_CR = DATA.ITSRCVAL.filter(x => x.UNIQGUID === ax)
                if(IT_CR.length > 0){
                    a.CODE_CR = IT_CR[0].CODE
                    //console.log(IT_CR)
                }
            })
    
            a.GKAU_DB_VALUES.map(ax => {
                const IT_DB = DATA.ITSRCVAL.filter(x => x.UNIQGUID === ax)
                if(IT_DB.length > 0){
                    a.CODE_DB = IT_DB[0].CODE
                   // console.log(IT_DB)
                }
            })
            const isOk = (a.CODE_CR === a.CODE_DB) ? true : false
            a.isOk = isOk
        }
    })

    
    ////////////////////////////////////////////////////

    ACCE.map(a => {
        
        if(a.GKAUDB != '00000000-0000-0000-0000-000000000000' && a.GKAUCR != '00000000-0000-0000-0000-000000000000'){
            a.GKAU_CR_VALUES.map(ax => {
                const KEKV_CR = DATA.KEKV.filter(x => x.UNIQGUID === ax)
                if(KEKV_CR.length > 0){
                    a.KEKV_CR = KEKV_CR[0].CODE.trim()
                    //console.log(IT_CR)
                }
            })
    
            a.GKAU_DB_VALUES.map(ax => {
                const KEKV_DB = DATA.KEKV.filter(x => x.UNIQGUID === ax)
                if(KEKV_DB.length > 0){
                    a.KEKV_DB = KEKV_DB[0].CODE.trim()
                   // console.log(IT_DB)
                }
            })
            const isOkKEKV = (a.KEKV_CR === a.KEKV_DB) ? true : false
            
            a.isOkKEKV = isOkKEKV
            if(a.KEKV_DB == '0000' || a.KEKV_CR == '0000'){
                a.isOkKEKV = true
            }
        }
    })
    
    
   
    
    
    
    
    
    const acceFilter = ACCE.filter(x => x.isOk == false)
    
    const acceFilterKEKV = ACCE.filter(x => x.isOkKEKV == false)

    

    //console.log(acceFilterKEKV.length,'KEKV ERRORS')

    const myFinalArray = [...new Set([...acceFilter ,...acceFilterKEKV])]

    //console.log(acceFilter.length, acceFilterKEKV.length, myFinalArray.length)
    
    
    
    
    
    
    let out = ''
    let many = false
    let message = `Помилок в проводках немає. ${moment(from).format('DD.MM.YYYY')} – ${moment(to).format('DD.MM.YYYY')}`
    
    if(myFinalArray.length > 0){
        myFinalArray.map(a => {
            const id = DATA.DMZ.filter(x => x.UNIQGUID === a.GUIDDMZ)
            a.UNDOC = id[0].UNDOC
            a.NDM = id[0].NDM
        })

        
      
        myFinalArray.map((a, i) => {
            const str = `Док #: ${a.UNDOC}\nДок: ${a.NDM}\nДата: ${a.DDM}\nСума: ${a.SUMMA}\nДт: ${a.DB}\nКт: ${a.CR}\nFIO_D: ${a.FIO_D}\n______________________\n\n`
            if(i < 10){
                out += str
            }else{
                many = true
            }

         
                
        })

        if(many){
            out += `Проводок з помилками: ${myFinalArray.length}. ${moment(from).format('DD.MM.YYYY')} – ${moment(to).format('DD.MM.YYYY')}`
          } else{
            out += `Проводок з помилками: ${myFinalArray.length}. ${moment(from).format('DD.MM.YYYY')} – ${moment(to).format('DD.MM.YYYY')}`
          } 

     message = out
        
        
       
        
    }
        axios.get('https://api.telegram.org/bot'+process.env.TELEGA+'/sendMessage', {
                    params: {
                      chat_id: process.env.CHAT_ID,
                      text: message
                    }
                  })  
     
    
    
    console.log(myFinalArray.length," — nums of errors. From "+moment(from).format('DD.MM.YYYY')+" to "+moment(to).format('DD.MM.YYYY'))
    const diff = moment(start).diff(moment())
    console.log('Total time: '+diff*(-1)/1000+'s')
    
    
 
}

const runAll = async (from, to) => {
    
    await createACCE()
    console.log('create ACCE data')
    
    await createKAUGV()
    console.log('create KAUGV data')
    
    await createDMZ()
    console.log('create DMZ data')
    
    await createITSRCVAL()
    console.log('create ITSRCVAL data')

    await createKEKV()
    console.log('create KEKV')

    readAll(from, to)
}
////////////////////////

//runAll('2023-01-01', moment().format('YYYY-MM-DD'))
cron.schedule('20 18 * * *', () => {
    if(moment().format('dddd') !== 'Sunday'){
        runAll('2023-01-01', moment().format('YYYY-MM-DD'))
      }
  });

