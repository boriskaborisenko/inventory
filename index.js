const dotenv = require('dotenv').config()
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

 /*  qrcode.save("sample.svg", function(error) {
    if (error) throw error;
    console.log("Done!");
  }); */

/* const ciphertext = CryptoJS.AES.encrypt('101480013', process.env.AESSECRET).toString();


const bytes  = CryptoJS.AES.decrypt(ciphertext, process.env.AESSECRET);
const originalText = bytes.toString(CryptoJS.enc.Utf8);
 */

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


/* 
let all 
const main = async () => {
    await sql.connect(sqlConfig)
    //all = await sql.query`select date_d, INVNUMBER, NOS from osk`
    all = await sql.query `select * from osk `
    console.log(all.recordset, all.recordset.length)
} */
//main()
//console.log(process.env)



///SERVER
const app = express();
const port = process.env.PORT;


app.use(cors());




/* app.use('/views',express.static(__dirname + '/views'));
app.use('/code',express.static(__dirname + '/views'));
app.use('/sticker',express.static(__dirname + '/views'));  */
app.use('/views', express.static(path.join(__dirname, '/views')))

// Configuring body parser middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get('/', (req,res) => {
    //console.log(all.recordset.length)
    res.sendFile(path.join(__dirname, 'views/home.html'));
})



///// mobile inventory logic start ////////

app.get('/code/:inv', async (req, res) => {
    res.sendFile(path.join(__dirname, 'views/code.html'));
})


app.get('/getcodedata/:inv', async (req, res) => {
    const addSlash = req.params.inv.replace(/xAzX/g,"/")
    const bytes  = CryptoJS.AES.decrypt(addSlash, process.env.AESSECRET);
    const originalText = bytes.toString(CryptoJS.enc.Utf8);
    
    
    const id = Number(originalText)
    console.log(id)
    await sql.connect(sqlConfig)
    const all = await sql.query `select * from osk o join kdk k on o.n_kdk = k.n_kdk where o.invnumber = ${id}`

    console.log(all)
    if(all.rowsAffected[0] == 0){
        console.log('return error')
        return res.json({
            error:true
        })
    }
    
    const selected = {
        fio:all.recordset[0].FIO_OTV,
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


app.get('/sticker',  (req,res) => {
    res.sendFile(path.join(__dirname, 'views/sticker.html'));
})

app.get('/stickerdata/:imgs', async (req, res) => {
    await sql.connect(sqlConfig)
   const  all = await sql.query `select * from osk `
    console.log(all.recordset.length)
    
    const lowdata = []
    all.recordset.map((a, index) => {

        const id = a.INVNUMBER.trim()
        const preUrl = CryptoJS.AES.encrypt(id, process.env.AESSECRET).toString()
        const killSlash = preUrl.replace(/\//g,"xAzX")

        const url = process.env.BASEURL+'/code/'+killSlash
        console.log(id, a.NOS, url)

        if(req.params.imgs == 'with'){
             makeQR(url,index)
             makeBarcode(id,index)
        }

       
       lowdata.push({
            inv:Number(id), 
            name: a.NOS, 
            url:url,
            qr: index+'.svg',
            bar:index+'.svg'
        })
        


    })
   
    res.json({data:lowdata})
})



app.listen(port, () => console.log(`Server listening on port ${port}!`));


