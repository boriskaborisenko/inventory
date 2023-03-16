const menu = document.querySelectorAll('.m')
const inp = document.querySelector('#search')
const res = document.querySelector('#res')

const filtered = {
    invYes:[],
    invNo:[],
    all:[]
}

const clearData = () => {
    res.innerHTML = ''
    filtered.invYes = []
    filtered.invNo = []
    filtered.all = []
}

const switchLoader = (switcher) => {
    document.querySelector('.loader').style.display = (switcher) ? 'flex' : 'none'
}

const insertData = (data) => {
   res.innerHTML = '' 
    data.map(d =>{
        res.innerHTML += `<div>${d.id} ${d.name} ${d.last}</div>`
    })
}

inp.addEventListener('keyup', () => {
    const search = filtered.all.filter(x => x.idStr.includes(inp.value) )
    if(inp.value.length >= 3 && search.length < 400)
        insertData(search)
}, false)


console.log(menu)
menu.forEach(m=>{
    m.addEventListener('click', ()=>{
        const actions = {
            'yes': () => console.log('Apples'),
            'not': () => console.log('Oranges'),
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
    console.log(data)

   data.sql.map((s)=>{
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

  console.log(filtered)

   insertData(filtered.invYes)
   switchLoader(false)

}

getData()