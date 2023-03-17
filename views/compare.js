const menu = document.querySelectorAll('.m')
const inp = document.querySelector('#search')
const res = document.querySelector('#res')
const chunkSize = 100 



     

const filtered = {
    invYes:[],
    invNo:[],
    all:[],
    pages:[],
    page: 0,
    total_pages: 0
   
}

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
    res.innerHTML = ''
    filtered.invYes = []
    filtered.invNo = []
    filtered.all = []
    filtered.pages = []
    filtered.page= 0
    filtered.total_pages = 0
    
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
    </div>`
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
        menu.forEach(m => m.classList.remove('actv'))
    }else{
        menu[1].classList.add('actv')
    }
}, false)



menu.forEach(m=>{
    m.addEventListener('click', ()=>{

        menu.forEach(m=>m.classList.remove('actv'))
        m.classList.add('actv')

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
    
    const allCall = await fetch('/compareget')
    const data = await allCall.json()

    ////filter weapons 

    const withoutWeapons = []
    
    data.sql.map((x=>{
        if (
            !x.name.toLowerCase().includes('5,45') && 
            !x.name.toLowerCase().includes('7,62') &&
            !x.name.toLowerCase().includes('пістолет пм') &&
            !x.name.toLowerCase().includes(' кулемет ') 
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
  menu[1].classList.add('actv')
  menu[0].classList.remove('actv')

  document.querySelector('#total').innerHTML = ` (${filtered.all.length})`
  document.querySelector('#innot').innerHTML = ` (${filtered.invNo.length})`
  document.querySelector('#inyes').innerHTML = ` (${filtered.invYes.length})`
  ///fix menu

   insertData(filtered.all)
   switchLoader(false)
  
}







getData()

document.querySelector('#download').addEventListener('click',()=>{

    const str = []
    filtered.all.map(f=>{
        str.push({"invNumber":f.id, "description":f.name, "LastUpdate":f.last})
    })
    
    ExportData(str)
}, false)


     