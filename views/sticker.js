const param = window.location.href.split('/sticker/')[1]
const p = (param != '') ? 'with' : 'without'
console.log(p) 
const all = document.querySelector('.all')

const opt = (filename) => {
    return{
    margin:       2,
    filename:     filename+'.pdf',
    image:        { type: 'jpeg', quality: 0.99 },
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

  

const ps = []

const trun = (str, length) => {
        return str.length > length
          ? `${str.substr(0, length)}...`
          : str;
      }









const stickers = []

const mypdf = async  () => {

    const data = await fetch("/stickerdata/"+p)
    const json = await data.json()
    
     json.data.map(d=>{
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
            str += template(s)
                
            if((i+1) % 44 == 0 || (i+1) == stickers.length){
                ps.push(str)
                str = ''
            }
            
        }) 

        
        
        

const loop = async () => {
    for (let i=0; i < ps.length; i++){
            console.log(i)
            all.innerHTML += ps[i]
            await html2pdf().set(opt('filename_'+(i+1))).from(all).save()
            all.innerHTML = ''    
           
           
    }
}

loop()     


       

}



mypdf()



 
 


