const param = window.location.href.split('/sticker/')[1]
const p = (param != '') ? 'with' : 'without'
console.log(p) 
const all = document.querySelector('.all')

const opt = (filename) => {
    return{
    margin:       0,
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

document.getElementById('b').scrolling = 'no';

const ps = []

const trun = (str, length) => {
        return str.length > length
          ? `${str.substr(0, length)}...`
          : str;
      }









const stickers = []

const mypdf = async  () => {
all.innerHTML = `<div class="center_text">
Wait while we get data<br>
<img style="width:200px;" src="https://thumbs.gfycat.com/HugeDeliciousArchaeocete-max-1mb.gif">
</div>`
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
    
    all.innerHTML = ''    
    //alert('Data ready. Wait while pdfs generated')
    for (let i=0; i < ps.length; i++){ //ps.length
       console.log(i)
            all.innerHTML += ps[i]
            await html2pdf().set(opt('filename_'+(i+1))).from(all).save()
            all.innerHTML = ''  
    }
    all.innerHTML = '<div class="center_text"><div>Check «Downloads» folder for PDF files</div></div>'
}

loop()     


       

}



mypdf()



 
 


