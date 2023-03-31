//6izziokYgD+cSJWdv+QqhQ4nkYQgxL06ntaIKT7YgyxiHlNHwuJQGGDp5ZY+UCTpZDTlGuXJzBgiIFChzTHn0ww0+PMqUqL+g3paqd7zeT8+DOZnznmbOqSnQ5lWvN4mqIG5hYo1yEMDPveDk7e8hbiyERuYYIGnIvJAoPOpWQy/5Fp29FnTiSIIwAWfrugxosfsFABM9lLAi9Bed3rHz4SwhMLkQ/hkFUycQIu/Cn5stlPyWstvEEDud5RWPZPaUEnXdDu43TbycA3H8+L4qJahjlAKegtJc+grZ54Hc2HlJUUyAfsRtQzJy7Yk+5T9YAbc5rPbJPXEZlw4cToFI8oJBZQfeLSt+p+jL1Aqz1NPBKaJmDphXjY0CWiTQegr9gnxE/2ip+lTr3x724B3WMVy3BaPFoxygTJv51ZJOdzS/AePdADcZJobrcD0+UObzm/bYZckdhOfyT5khh+DXKwuKUnweUaAu2PWJCzeTCAYe72eqvhJPBkVeGxahQti
const dotenv = require('dotenv').config()
const { Server } = require("socket.io");
const http = require('http');
const QRCode = require("qrcode-svg");
const barcode = require('barcode-2-svg');
const CryptoJS = require("crypto-js")
const fs = require('fs')
const axios = require('axios')
const moment = require('moment')
const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
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








const harpData = (data) => {
    return {
    method: 'post',
    url: process.env.HARPERURL,
    headers: { 
      'Content-Type': 'application/json', 
      'Authorization': process.env.HARPERTOKEN
    },
    data : data
  }
}


const makeQR = (url,output) => {
    const qrcode = new QRCode({
        content: url,
        padding: 4,
        width: 256,
        height: 256,
        color: "#000000",
        background: "#ffffff",
        ecl: "M"
      });
      fs.writeFileSync('views/qr/'+output+'.svg', qrcode.svg());
}

const makeBarcode = (nums, output) => {
    const code128 = barcode(nums, "code128", {width:80, barWidth:1, barHeight:25, toFile:true, path: 'views/barcodes/'+output, output:'svg'})
}



/* 
const ciphertext = CryptoJS.AES.encrypt('101480013', process.env.AESSECRET).toString();
const bytes  = CryptoJS.AES.decrypt(ciphertext, process.env.AESSECRET);
const originalText = bytes.toString(CryptoJS.enc.Utf8);
 */


///SERVER
const app = express();
const port = process.env.PORT;
app.use(cors());
app.use('/views', express.static(path.join(__dirname, '/views')))
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const server = http.createServer(app);
const io = new Server(server);
/////socket.io

/* io.on('connection', (socket) => {
    const id = '3712837129837'
    console.log('a user connected', socket.id)
    socket.emit('hello',socket.id)

    socket.on('toServ', (data) => {
        console.log(data)
    })

    socket.on('magic', (data) => {
        console.log(data)
        io.emit('outMagic', data)
    })
  }); */

/////socke end
const isAuth = (req, res, next) => {
    const auth = req.headers.authentication;
    if (auth === process.env.USERPASS) {
      next();
    } else {
      res.sendFile(path.join(__dirname, 'views/auth.html'));
    }
}

app.post('/auth', (req, res) => {
    console.log(req.body.pass)
    if(req.body.pass == process.env.USERPASS && req.body.user == process.env.USERNAME){
        res.json({auth:true, pass:process.env.USERPASS})
    }else(
        res.json({auth:false, pass: false})
    )
})


app.get('/', (req,res) => {
    console.log(req.headers.host)
    console.log('/'+moment().format('DD.MM.YYYY HH:mm:ss'))
    res.sendFile(path.join(__dirname, 'views/all.html'));
})




///// mobile inventory logic start ////////



app.get('/code/:inv',  async (req, res) => {
   res.sendFile(path.join(__dirname, 'views/code.html'));
})


app.get('/getcodedata/:inv',  async (req, res) => {


    const testUrl = req.params.inv.split(process.env.IVA)[1]
    console.log(testUrl,'testing url')

    let x = 0

    if(testUrl === undefined){
        const aes = req.params.inv
        const addSlash = aes.replace(/xAzX/g,"/")
        const bytes  = CryptoJS.AES.decrypt(addSlash, process.env.AESSECRET);
        
        try {
            x = bytes.toString(CryptoJS.enc.Utf8) 
        }catch{
            console.log('return error')
            return res.json({
                error:true
            }) 
        }
    }

    if(testUrl){
        x = testUrl.split(process.env.IVB)[0]
        const buff = Buffer.from(x, 'base64')
        x = buff.toString('utf-8')
    }

    

    
    
    const id = Number(x)
    console.log(id,'REAL INV')
    await sql.connect(sqlConfig)
    //const all = await sql.query `select * from osk o join kdk k on o.n_kdk = k.n_kdk where o.invnumber = ${id}`
    const all = await sql.query `select * from osk o where o.invnumber = ${id}`


    if(all.rowsAffected[0] == 0){
        console.log('return error')
        return res.json({
            error:true
        })
    }
 
    await sql.connect(sqlConfig)
    const FIO = await sql.query `select * from kdk where n_kdk = ${all.recordset[0].N_KDK}`

    const fullName = (FIO.rowsAffected[0] == 0) ? 'No name' : FIO.recordset[0].FIO_OTV

    
    
    const selected = {
        fio: fullName,
        comm: all.recordset[0].NOS
    }
    //selected.comm = selected.comm.join(' ')


    const searchInHarp = JSON.stringify({
        "operation": "search_by_hash",
        "schema": process.env.HARPSCHEMA,
        "table": process.env.HARPTABLE,
        "hash_values": [
            id
        ],
        "get_attributes": [
            "last"
        ]
    });

    axios(harpData(searchInHarp))
    .then( (response) =>  {
    console.log(JSON.stringify(response.data));
        
        const lastDate = (response.data[0] !== undefined) ? moment(response.data[0].last).format('DD.MM.YYYY HH:mm:ss') : false

        res.json({
            id:id,
            data:selected,
            harp: lastDate
        })
    })
    


    
})

app.get('/mark/:inv', async (req, res) => {
    const data = JSON.stringify({
        "operation": "upsert",
        "schema": process.env.HARPSCHEMA,
        "table": process.env.HARPTABLE,
        "records": [
            {
                "inv": req.params.inv,
                "last":moment().format()
            }
        ]
    });


    axios(harpData(data))
    .then( (response) =>  {
    console.log(JSON.stringify(response.data));
        res.json({data:true})
    })
   

})

/////////////// mobile invettory logic end //////////////



////// stickers strat ////////////
/* app.get('/sticker',  (req,res) => {
    res.sendFile(path.join(__dirname, 'views/sticker.html'));
}) */

app.get('/stickerdata/:imgs', isAuth, async (req, res) => {
    await sql.connect(sqlConfig)
   //const  all = await sql.query `select * from osk where invnumber not like '%1116%'`
   const  all = await sql.query `select * from osk`
    console.log(all.recordset.length)

    const withoutWeapons = []
    
    all.recordset.map((x=>{
        if (
            !x.NOS.toLowerCase().includes('5,45') && 
            !x.NOS.toLowerCase().includes('7,62') &&
            !x.NOS.toLowerCase().includes('пістолет пм')
            ){
            withoutWeapons.push(x)
        }
    }))
    
    const lowdata = []
    //all.recordset.map((a, index) => {
    withoutWeapons.map((a, index) => {
        const id = a.INVNUMBER.trim()
        const preUrl = CryptoJS.AES.encrypt(id, process.env.AESSECRET).toString()
        const killSlash = preUrl.replace(/\//g,"xAzX")

        const url = process.env.BASEURL+'/code/'+killSlash
        console.log(id, a.NOS, url)

        if(req.params.imgs == 'with'){
             makeQR(url,id)
             makeBarcode(id,id)
        }

       
       lowdata.push({
            inv:Number(id), 
            name: a.NOS, 
            url:url,
            qr: id+'.svg',
            bar:id+'.svg'
        })
        


    })
   
    res.json({data:lowdata})
})
////////sticker end ///////////////

/* app.get('/makestickers', (req, res) => {
    res.sendFile(path.join(__dirname, 'views/makestickers.html'));
}) */

app.post('/dataset', isAuth, async (req, res) => {
    
    //const queryIds = `select * from osk o join kdk k on o.n_kdk = k.n_kdk where o.invnumber in (${req.body.join(', ')})`
    const queryIds = `select * from osk o where o.invnumber in (${req.body.join(', ')})`
    await sql.connect(sqlConfig)
    const all = await sql.query(queryIds)
    
    const lowdata = []
    all.recordset.map((a) => {

        const id = a.INVNUMBER.trim()
        const preUrl = CryptoJS.AES.encrypt(id, process.env.AESSECRET).toString()
        const killSlash = preUrl.replace(/\//g,"xAzX")

        const url = process.env.BASEURL+'/code/'+killSlash
        console.log(id, a.NOS, url)

        makeQR(url,id)
        makeBarcode(id,id)
        

       
       lowdata.push({
            inv:Number(id), 
            name: a.NOS, 
            url:url,
            qr: id+'.svg',
            bar:id+'.svg'
        })
        


    })


    res.json({data:lowdata})
})

/* app.get('/compare', (req, res) => {
    res.sendFile(path.join(__dirname, 'views/compare.html'));
}) */

app.get('/compareget', isAuth, async(req, res) => {

    await sql.connect(sqlConfig)
    const db= await sql.query `select * from osk order by DATE_D DESC`

    const dbData = []
    const dbHarper = []

    db.recordset.map(d=>{
        let getDate = '—'
        if(d.DATE_D){
            getDate = moment(d.DATE_D).format('DD.MM.YYYY')
        }
        const one = {
            id:Number(d.INVNUMBER.trim()),
            idStr:d.INVNUMBER.trim().toString(),
            name: d.NOS,
            date: getDate
        }
        dbData.push(one)
   }) 
 
    

    const hdb = await axios(harpData(JSON.stringify({
        "operation": "sql",
        "sql": "SELECT * FROM FIN.inventory"
    })))

    const harpDB = await hdb.data
    
    harpDB.map(h=>{
        const oneH = {id:h.inv, last: moment(h.last).format('DD.MM.YYYY | HH:mm')}
        dbHarper.push(oneH)
    })

    res.json({
        harper:dbHarper,
        sql:dbData
    })
})


//app.listen(port, () => console.log(`Server listening on port ${port}!`));
server.listen(port, () => console.log(`Server listening on port ${port}!`));




