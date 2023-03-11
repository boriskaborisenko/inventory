console.log('mainjs')
let all 
fetch("/inv").then(response=>response.json())
.then(data=>{
    console.log(data.length,'DATA')
    all=data
    console.log(all)
})

const inp = document.querySelector('#filter')
const res = document.querySelector('#res')

inp.addEventListener('change',()=>{
    console.log(inp.value)
    const data = all.filter(x => x.INVNUMBER.includes(inp.value))
    res.innerHTML = ""
    data.map(d=>{
        const date = moment(d.date_d).format('DD.MM.YYYY')
        const is22 = (moment(d.date_d).isBetween('2022-01-01','2022-12-31')) ? 'red' : 'green'
        console.log(d.INVNUMBER, d.NOS, date, is22)
       
        if(inp.value.length > 5){
            res.innerHTML += `<div class="row"><div class="el inv">${d.INVNUMBER}</div>
            <div class="el date ${is22}">${date}</div>
            <div class="desc">${d.NOS}</div></div>`  
        }
    })
}, false)

console.log(moment())