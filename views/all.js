
const app = document.querySelector("#app")
const auth = document.querySelector('#auth')
const user =  document.querySelector('#user')
const pass =  document.querySelector('#pass')
const btn =  document.querySelector('#authbtn')
const creds = {auth:false, pass:false}
const aigingDays = 15 
//

const compareMenu = document.querySelectorAll('.m')

const myheaders =  (pass) => {
    return {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    'Authentication': pass}
}

const simpleAuth = async () => {
     if(creds.auth){
        app.classList.remove('off')
        auth.classList.add('off')
        getData()
    }else{
        app.classList.add('off')
        auth.classList.remove('off')
    }
 }

btn.addEventListener('click', async () => {
        const forAuth = await fetch('/auth', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({user:user.value, pass:pass.value})
            });
            const isAuth = await forAuth.json();
            creds.auth = isAuth.auth
            creds.pass = isAuth.pass
            if(!creds.auth){
                alert('Wrong user/pass')
            }
            simpleAuth()
            
  }, false)


simpleAuth()

///////////////////////////////////////////////


const filtered = {
    invTerm:[],
    invYes:[],
    invNo:[],
    all:[],
    pages:[],
    page: 0,
    total_pages: 0,
    buffer:[],
    buffer_str:'',
    isAuth:false
}


const mainNav = document.querySelectorAll('.nav_item')
const views = document.querySelectorAll('.view')

const inventory = () => {
    getData()
    document.getElementById('b').classList.remove('noflow')
    upld.value = ''
    rc.innerHTML = ''
}

const No = () => {
    compareMenu.forEach(c=>{
        c.classList.remove('actv')
    })
    compareMenu[0].classList.add('actv')
    document.querySelector('#allX').innerHTML = ''
    upld.value = ''
    rc.innerHTML = ''
}

const actionsNav = {
    'inventory': () => inventory(),
    'createStickers': () => {document.getElementById('b').classList.add('noflow')
                    No()},
    'allStickers': () => No(),
    'onPhone' : () => {document.getElementById('b').classList.remove('noflow')
                    No()},
    'help' : () => {document.getElementById('b').classList.remove('noflow')
                    No() }
  };
  
  

mainNav.forEach(m => {
    m.addEventListener('click',() => {
        mainNav.forEach(m => {m.classList.remove('active_side_nav')})
        m.classList.add('active_side_nav')
        
        views.forEach(v => {
            v.classList.add('off')
            if(v.id.split('_')[0] === m.id){
                v.classList.remove('off')
                //console.log(v.id.split('_')[0],m.id,'look')
            } 
        })
        
        actionsNav[m.id]()
    }, false)
})

////////////////COMPARE////////////////

const rc = document.querySelector('#rc')
const inp = document.querySelector('#search')
const res = document.querySelector('#res')
const buffer = document.querySelector('#buffer')
const upld = document.getElementById('upload')
const chunkSize = 100 


const ExportData = (input) =>
    {
            filename='reports.xlsx';
       data=input
        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "invs");
        XLSX.writeFile(wb,filename);
     }

const clearData = () => {
    buffer.value = ''
    res.innerHTML = ''
    filtered.invTerm = []
    filtered.invYes = []
    filtered.invNo = []
    filtered.all = []
    filtered.pages = []
    filtered.page= 0
    filtered.total_pages = 0
    filtered.buffer = []
    filtered.buffer_str = ''
    inp.value = ''
    textarea.value = ''
    gen.classList.add('hidegen')
    upld.value = ''
    rc.innerHTML = ''
}

const trun = (str, length) => {
    return str.length > length
      ? `${str.substr(0, length)}...`
      : str;
  }

const switchLoader = (switcher) => {
    document.querySelector('.loader').style.display = (switcher) ? 'flex' : 'none'
}

const template = (d) => {
    const fullname = (d.fullname) ? d.fullname : '—'
    const old = (d.inv && d.term) ? 'old' : ''
    const classX = (d.inv) ? 'yep' : 'nope'
    const classY = (d.inv) ? '' : 't'
    const style = (d.inv) ? 'style="color:#fff;"' : ''
    return `<div class="card  ${classX} ${old}">
    <div class="num ${classY}">${d.id} <div class="ddate">Added: ${d.date}</div></div>
    <div class="podn">${d.podname}</div>
    <div class="desc"  ${style}>${trun(d.name, 80)}</div>
    <div class="respName">${fullname}</div>
    <div class="date">Inventory: ${d.last}</div>
    <div id="${d.id}" class="micromark"  onClick="cp(this)"></div>
    </div>`
}


const cp = (el) => {
    const isExist = filtered.buffer.includes(el.id)
    if(!isExist){
        filtered.buffer.push(el.id)
        el.classList.add('sel')
    }else{
        filtered.buffer.map((f,i)=>{
            if(f == el.id)
            filtered.buffer.splice(i, 1)
        })
        el.classList.remove('sel')
    }
    
    
    filtered.buffer_str = filtered.buffer.join(',')
    buffer.value = filtered.buffer_str
    buffer.select()
    buffer.setSelectionRange(0, 99999)
    navigator.clipboard.writeText(buffer.value)
    textarea.value = filtered.buffer_str
    gen.classList.remove('hidegen')
    if(filtered.buffer_str.length < 1){
        gen.classList.add('hidegen')
    }
    //marks
}

const makePages = () => {
    const pager = document.querySelector('#w')
    pager.innerHTML = ''
        for(let i = 0; i < filtered.total_pages; i++){
            pager.innerHTML += `<div class="px" attr-d="${i}">${i+1}</div>`
        }

    const pxs = document.querySelectorAll('.px')
    pxs[0].classList.add('actv')
        pxs.forEach(p=>{
            p.addEventListener('click',()=>{
                pxs.forEach(p=>{p.classList.remove('actv')})
                p.classList.add('actv')
                res.innerHTML = ''
                filtered.pages[Number(p.getAttribute('attr-d'))].map(p=>{
                    res.innerHTML += template(p)
                })
                window.scrollTo( 0, 0 );
            },false)
        })

}

const insertData = (data) => {
    buffer.value = ''
    filtered.buffer = []
    filtered.buffer_str = ''
    window.scrollTo(0,0)
    gen.classList.add('hidegen')
   res.innerHTML = '' 
  
   const chunkedArray = []
    for (var i = 0; i < data.length; i += chunkSize) {
     chunkedArray.push(data.slice(i, i + chunkSize))
    }

    filtered.pages = chunkedArray
    filtered.total_pages = filtered.pages.length 

    
   
    if(filtered.pages.length > 0){
        filtered.pages[0].map(p =>{
            res.innerHTML += template(p)
        })   
        
        makePages() 
    }else{
        document.querySelector('#w').innerHTML =''
    }
    
    
}

inp.addEventListener('input', () => {
    const s = inp.value.toLowerCase()
    const search = filtered.all.filter( x => x.idStr.includes(s) || x.name.toLowerCase().includes(s) || x.fullname.toLowerCase().includes(s) ||x.podname.toLowerCase().includes(s)  )
    //console.log(search.length)
    rc.innerHTML = 'found: '+search.length
    if(inp.value.length == 0){
        rc.innerHTML = ''
    }
    insertData(search)
    ///fix menu

    if(inp.value.length > 0){
        compareMenu.forEach(m => {
            m.classList.remove('actv')
        })
    }else{
        compareMenu[0].classList.add('actv')
        rc.innerHTML = ''
    }
}, false)





compareMenu.forEach(m=>{
    m.addEventListener('click', ()=>{

        compareMenu.forEach(m=>m.classList.remove('actv'))
        m.classList.add('actv')
        inp.value = ''
        rc.innerHTML = ''

        const actions = {
            'yes': () => insertData(filtered.invYes),
            'not': () => insertData(filtered.invNo),
            'all': () => insertData(filtered.all),
            'aiging': () => insertData(filtered.invTerm),
            'updt': () => getData()
          };
          
          actions[m.id]()
    }, false)
})

const counterStickers = () => {
    const total = filtered.all.length
    const onPage = 27
    const setPages = 4
    const totalSets = Math.ceil(total / (onPage * setPages))
    const s = (totalSets == 1) ? 'file' : 'files'
    const str = `Warning! This is a very resource-intensive task. If you have a weak computer it may take some time.<br>For <b>${total} items</b> will be generate <b>${totalSets} PDF ${s} (~2MB)</b> with ${setPages} pages inside (${onPage} items per page).<br><br>If you sure &#8594; click button below and be patient`
    document.querySelector('#stickerCount').innerHTML = str
}

const getData = async () => {
    switchLoader(true)
    clearData()
    
    const allCall = await fetch('/compareget', {
       headers:myheaders(creds.pass)
    })
    const data = await allCall.json()
    //console.log(data,'ALL')
    ////filter weapons 

    const withoutWeapons = []
    
    data.sql.map((x=>{
        if (
            !x.name.toLowerCase().includes('5,45') && 
            !x.name.toLowerCase().includes('7,62') &&
            !x.name.toLowerCase().includes('пістолет пм')
            ){
            withoutWeapons.push(x)
        }
    }))
   
     //////////////////////////
    
   //data.sql.map((s)=>{
    withoutWeapons.map((s) => {
    const x = data.harper.filter(f => f.id === s.id)
    if(x.length > 0){
        s.inv = true
        s.last = x[0].last
        filtered.invYes.push(s)
    }else{
        s.last = '—'
        s.inv = false
        filtered.invNo.push(s)
    }

    s.term = false
    
    const findKDKfull = data.kdk.find(k => k.N_KDK.trim() === s.kdk)
    const findPOD = data.pod.find(p => p.CEH === s.kpod)
    
    
    s.fullname = '...'
    if(findKDKfull){
        s.fullname = `${findKDKfull.NAM} ${findKDKfull.FAM.toUpperCase()}`
    }

    s.podname = '...'
    if(findPOD){
        s.podname = `${findPOD.NAIM_P}`
    }
    

    filtered.all.push(s)

   
})




//////// fix terms of inv
const terms = (days) => {
    filtered.invYes.map(iy => {
        const diff = (moment().diff(moment(iy.last.split(' | ')[0],'DD.MM.YYYY'),'days'))
        if(diff >= days){
            iy.term = true
            filtered.invTerm.push(iy)
        }
    })
}
terms(aigingDays)


  ///fix menu
  //menu[1].classList.add('actv')
  //menu[0].classList.remove('actv')

  document.querySelector('#total').innerHTML = ` (${filtered.all.length})`
  document.querySelector('#innot').innerHTML = ` (${filtered.invNo.length})`
  document.querySelector('#inyes').innerHTML = ` (${filtered.invYes.length})`
  document.querySelector('#inaiging').innerHTML = ` (${filtered.invTerm.length})`
  ///fix menu

   insertData(filtered.all)
   switchLoader(false)
   counterStickers()
  
}



document.querySelector('#download').addEventListener('click',()=>{

    const str = []
    filtered.all.map(f=>{
        str.push({"code":f.id, "Опис":f.name, "МВО":f.fullname, "Підрозділ":f.podname, "Дата сканування":f.last})
    })
    
    ExportData(str)
}, false)

/////// MAKE STICKERS /////

const gen = document.querySelector('#gen')
const textarea = document.querySelector('#area')

const createSet = (input) => {
    const dataset = []
    input.split(',').map(o=>{
        if(o.trim().length > 0)
        dataset.push(Number(o.trim()))
    })
    const unique = [...new Set(dataset)];
    return unique
}

const apiPost = async (endpoint,dataset) => {
    const rawResponse = await fetch(endpoint, {
      method: 'POST',
      headers: myheaders(creds.pass),
      body: JSON.stringify(dataset)
    });
    const content = await rawResponse.json();
  
    return content
  }

  const all = document.querySelector('.pdf')

  const opt = (filename) => {
      return{
      margin:       1,
      filename:     filename+'.pdf',
      image:        { type: 'jpeg', quality: 0.99 },
      html2canvas:  { scale: 2 },
      jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
      }
  };
  
  const templateSticker = (sticker) => { 
  
  
          return `<div class="one">
              <div class="l">
                  <div class="anno">${trun(sticker.name, 62).toUpperCase()}</div>   
                  <div class="x"><img src="../views/barcodes/${sticker.bar}"></div>
                  <div class="stid">${sticker.inv}</div>
              </div>
              <div class="r">
                  <img src="../views/qr/${sticker.qr}" alt="">
              </div>
              
          </div>`
  }

let ps = []

let stickers = []

 const mypdf = async  (answer) => {
     
          answer.data.map(d=>{
              const sticker = {
                  inv:d.inv,
                  name:d.name,
                  qr:d.qr,
                  bar:d.bar
              }
              stickers.push(sticker)
          })
              
           
      
             
          
          
              let str = ''
              stickers.map((s, i) => {
                  str += templateSticker(s)
                      
                  if((i+1) % 108 == 0 || (i+1) == stickers.length){
                      ps.push(str)
                      str = ''
                  }
                  
              }) 
      
              
              
              
      
      const loop = async () => {
          
          all.innerHTML = ''    
          //alert('Data ready. Wait while pdfs generated')
          for (let i=0; i < ps.length; i++){ //ps.length
                  all.innerHTML += ps[i]
                  await html2pdf().set(opt('stickersPack_'+(i+1))).from(all).save()
                  //all.innerHTML = ''  
          }
          
      }
      
      loop()     
      
      
             
      
      }


gen.addEventListener('click', async ()=>{
    
    const dataset = createSet(textarea.value)
    all.innerHTML = ''
    stickers = []
    ps = []
    const answer = (dataset.length > 0) ?  await apiPost('/dataset', dataset) : false
    
    if(answer)
    mypdf(answer)


    
}, false)



/////// ALL STICKERS 

const allX = document.querySelector('#allX')

const psAll = []
const stickersAll = []  

const mypdfAll = async  () => {
    document.getElementById('b').classList.add('noflow')
    switchLoader(true)
        const data = await fetch("/stickerdata/with", {headers:myheaders(creds.pass)})
        const json = await data.json()
        
         json.data.map(d=>{
            const sticker = {
                inv:d.inv,
                name:d.name,
                qr:d.qr,
                bar:d.bar
            }
            stickersAll.push(sticker)
            
        })
            
            
    
           
        
        
            let str = ''
            stickersAll.map((s, i) => {
                str += templateSticker(s)
                if((i+1) % 108 == 0 || (i+1) == stickersAll.length){
                    psAll.push(str)
                    str = ''
                }
                
            }) 
    
            
            
            
    
    const loop = async () => {
        
        allX.innerHTML = ''    
        //alert('Data ready. Wait while pdfs generated')
        for (let i=0; i < psAll.length; i++){ //ps.length
                allX.innerHTML += psAll[i]
                await html2pdf().set(opt('filename_'+(i+1))).from(allX).save()
                allX.innerHTML = ''  
        }
        allX.innerHTML = '<div class="center_text"><div>Check «Downloads» folder for PDF files</div></div>'
        switchLoader(false)
        document.getElementById('b').classList.remove('noflow')
    }
    
    loop()     
    
    
           
    
    }

    document.querySelector('#genAll').addEventListener('click', ()=>{
        mypdfAll()
    }, false)



    //getData()



    const helps = [
        {
            name:'Harper DB', 
            url: 'https://studio.harperdb.io/o/2da4a20d/i/compute-stack-2da4a20d-1617638214557/browse/FIN/inventory'
        },
        {
            name:'Merge PDF',
            url:'https://smallpdf.com/merge-pdf'
        },
        {
            name:'Zero Trust',
            url:'https://www.cloudflare.com/ru-ru/insights-zero-trust-network-security/'
        }
    ]
    const ulHelps = document.querySelector('#helper')

helps.map(h=>{
    ulHelps.innerHTML += `<li class="ohli"><a class="oha" href="${h.url}" target="_blank">${h.name}</a></li>`
})


const filePicked = (oEvent) => {
    const oFile = oEvent.target.files[0]
    //const sFilename = oFile.name;
    const reader = new FileReader()
    
    reader.onload = function(e) {
        const data = e.target.result
        const cfb = XLSX.read(data, {type: 'binary'})
        //console.log(cfb,'CFB')
        cfb.SheetNames.forEach(function(sheetName) {
            //const sCSV = XLS.utils.make_csv(cfb.Sheets[sheetName])   
            const oJS = XLS.utils.sheet_to_json(cfb.Sheets[sheetName]) 
    
            checkXLSX(oJS)
        });
    };
    
    reader.readAsBinaryString(oFile)
}

const checkXLSX = (data) => {
    const out = []
    if(data.length > 108){
        alert('Too long file. Chunk data to 108 items')
    }else{
        data.map(d=>{
            out.push(Number(d.code))
        })

        const go = out.sort((a, b) => {
            return a - b;
          })

        textarea.value = go.join(', ')
        gen.classList.remove('hidegen')
    }
}

textarea.addEventListener('input' ,() =>{
    if(textarea.value.length < 1){
        gen.classList.add('hidegen')
    }else{
        gen.classList.remove('hidegen') 
    }
    
}, false)
  

upld.addEventListener('change', filePicked, false);
   

 