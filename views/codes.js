const code = window.location.href.split('/code/')[1]
const codeData = {code, harp:false}

//http://localhost:3000/code/U2FsdGVkX1++5XVEDS2k2P1a7RoXNgJkR+TvVnAzTno=

const main = document.querySelector('#main')
const inv = document.querySelector("#inv")
const details = document.querySelector("#details")
const person = document.querySelector("#person")
const last = document.querySelector("#last")
const cont = document.querySelector('.cont')
const load = document.querySelector('.preloader')
const btn = document.querySelector('#mark')
const info = document.querySelector('.info')
const err = document.querySelector('.err')

const pasteData = (d) => {
    if(d.id !== undefined){
        inv.innerHTML = d.id
        details.innerHTML = d.inv.comm
        person.innerHTML = 'Відповідальний: '+d.inv.fio
        last.innerHTML = (d.harp) ? 'Last inventory:<br>'+d.harp : 'Last inventory:<br>— '
        load.style.display = 'none'
        err.style.display = 'none'
    }else{
        cont.style.display = 'none'
        load.style.display = 'none'
        
    }
    
}



fetch("/getcodedata/"+codeData.code).then(response=>response.json())
.then(data=>{
    codeData.inv = data.data
    codeData.id = data.id
    codeData.server = data.serv
    codeData.harp = data.harp
    console.log(codeData)
    pasteData(codeData)
})



const mark = document.querySelector('#mark')
mark.addEventListener('click', async () => {
    load.style.display = 'flex'
    fetch("/mark/"+codeData.id).then(response=>response.json())
    .then(data=>{
        console.log(data)
        //pasteData(data)
        load.style.display = 'none'
        cont.style.disply = 'none'
        btn.style.display = 'none'
        last.style.display = 'none'
        info.style.display = 'block'
        setTimeout(()=>{location.href = 'https://nema.takogo.net'  },4000)
        
    })

}, false)