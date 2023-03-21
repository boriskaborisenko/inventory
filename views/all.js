
const app = document.querySelector("#app")
const auth = document.querySelector('#auth')
const user =  document.querySelector('#user')
const pass =  document.querySelector('#pass')
const btn =  document.querySelector('#authbtn')
const creds = {auth:false, pass:false}

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
}

const No = () => {
    document.querySelector('#allX').innerHTML = ''
}

const actionsNav = {
    'inventory': () => inventory(),
    'createStickers': () => console.log('createStickers func'),
    'allStickers': () => No(),
    'onPhone' : () => No(),
    'help' : () => No()
  };
  
  

mainNav.forEach(m => {
    m.addEventListener('click',() => {
        mainNav.forEach(m => {m.classList.remove('active_side_nav')})
        m.classList.add('active_side_nav')
        
        views.forEach(v => {
            v.classList.add('off')
            if(v.id.split('_')[0] === m.id){
                v.classList.remove('off')
                console.log(v.id.split('_')[0],m.id,'look')
            } 
        })
        
        actionsNav[m.id]()
    }, false)
})

////////////////COMPARE////////////////
const compareMenu = document.querySelectorAll('.m')
const inp = document.querySelector('#search')
const res = document.querySelector('#res')
const buffer = document.querySelector('#buffer')
const chunkSize = 100 


const ExportData = (input) =>
    {
            filename='reports.xlsx';
       data=input
        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "People");
        XLSX.writeFile(wb,filename);
     }

const clearData = () => {
    buffer.value = ''
    res.innerHTML = ''
    filtered.invYes = []
    filtered.invNo = []
    filtered.all = []
    filtered.pages = []
    filtered.page= 0
    filtered.total_pages = 0
    filtered.buffer = []
    filtered.buffer_str = ''
    
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
    const classX = (d.inv) ? 'yep' : 'nope'
    const classY = (d.inv) ? '' : 't'
    const style = (d.inv) ? 'style="color:#fff;"' : ''
    return `<div class="card  ${classX}">
    <div class="num ${classY}">${d.id} <div class="ddate">Added: ${d.date}</div></div>
    <div class="desc"  ${style}>${trun(d.name, 80)}</div>
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
    console.log(filtered.buffer, filtered.buffer_str)
    
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

inp.addEventListener('keyup', () => {
    const search = filtered.all.filter( x => x.idStr.includes(inp.value) || x.name.toLowerCase().includes(inp.value) )
    insertData(search)
    ///fix menu

    if(inp.value > 0){
        //menu.forEach(m => m.classList.remove('actv'))
    }else{
        //menu[1].classList.add('actv')
    }
}, false)



compareMenu.forEach(m=>{
    m.addEventListener('click', ()=>{

        compareMenu.forEach(m=>m.classList.remove('actv'))
        m.classList.add('actv')
        inp.value = ''

        const actions = {
            'yes': () => insertData(filtered.invYes),
            'not': () => insertData(filtered.invNo),
            'all': () => insertData(filtered.all),
            'updt': () => getData()
          };
          
          actions[m.id]()
    }, false)
})



const getData = async () => {
    switchLoader(true)
    clearData()
    
    const allCall = await fetch('/compareget', {
       headers:myheaders(creds.pass)
    })
    const data = await allCall.json()

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
    
    filtered.all.push(s)
   })

   //console.log(filtered)

  ///fix menu
  //menu[1].classList.add('actv')
  //menu[0].classList.remove('actv')

  document.querySelector('#total').innerHTML = ` (${filtered.all.length})`
  document.querySelector('#innot').innerHTML = ` (${filtered.invNo.length})`
  document.querySelector('#inyes').innerHTML = ` (${filtered.invYes.length})`
  ///fix menu

   insertData(filtered.all)
   switchLoader(false)
  
}



document.querySelector('#download').addEventListener('click',()=>{

    const str = []
    filtered.all.map(f=>{
        str.push({"invNumber":f.id, "description":f.name, "LastUpdate":f.last})
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
                      
                  if((i+1) % 27 == 0 || (i+1) == stickers.length){
                      ps.push(str)
                      str = ''
                  }
                  
              }) 
      
              
              
              
      
      const loop = async () => {
          
          all.innerHTML = ''    
          //alert('Data ready. Wait while pdfs generated')
          for (let i=0; i < ps.length; i++){ //ps.length
             console.log(i)
                  all.innerHTML += ps[i]
                  await html2pdf().set(opt('stickersPack_'+(i+1))).from(all).save()
                  //all.innerHTML = ''  
          }
          
      }
      
      loop()     
      
      
             
      
      }


gen.addEventListener('click', async ()=>{
    
    const dataset = createSet(textarea.value)
    console.log(dataset)
    all.innerHTML = ''
    stickers = []
    ps = []
    const answer = (dataset.length > 0) ?  await apiPost('/dataset', dataset) : false
    console.log(answer)
   
    if(answer)
    mypdf(answer)


    
}, false)



/////// ALL STICKERS 

const allX = document.querySelector('#allX')

const psAll = []
let stickersAll = []  

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
           console.log(i)
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


   

 