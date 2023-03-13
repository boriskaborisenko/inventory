const param = window.location.href.split('/sticker/')[1]
const p = (param != '') ? 'with' : 'without'
console.log(p) 
const all = document.querySelector('.all')

const opt = (filename) => {
    return{
    margin:       1,
    filename:     filename+'.pdf',
    image:        { type: 'jpeg', quality: 0.98 },
    html2canvas:  { scale: 2 },
    jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
    }
};

const template = (sticker) => { 


        return `<div class="one">
            <div class="l">
                <div class="anno">${trun(sticker.name, 52).toUpperCase()}</div>   
                <div class="x"><img src="../views/barcodes/${sticker.bar}"></div>
                <div class="stid">${sticker.inv}</div>
            </div>
            <div class="r">
                <img src="../views/qr/${sticker.qr}" alt="">
            </div>
            
        </div>`
}

  



const trun = (str, length) => {
        return str.length > length
          ? `${str.substr(0, length)}...`
          : str;
      }


const pages = (total, divider, data) => {
    const pages = Math.ceil(total/divider)
 console.log(total, divider, pages)
        
        
}


const stickers = []
 fetch("/stickerdata/"+p).then(response=>response.json())
.then(data=>{
    data.data.map(d=>{
        const sticker = {
            inv:d.inv,
            name:d.name,
            qr:d.qr,
            bar:d.bar
        }
        stickers.push(sticker)
    })
    
    console.log(stickers)

    pages(stickers.length, 176, stickers)
    
    stickers.map((s,i) => {
        if(i<176){
            all.innerHTML+=template(s)
           
        }
    }) 

    //html2pdf().set(opt('testfile')).from(all).save();

})