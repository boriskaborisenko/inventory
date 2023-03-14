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
    
    

    const ps = []
  
 
    let str = ''
    stickers.map((s, i) => {
        str += template(s)
            
        if((i+1) % 44 == 0 || (i+1) == stickers.length){
            ps.push(str)
            str = ''
        }
        
    }) 


 
    

    html2pdf().set(opt('testfile')).from(all).toPdf().get('pdf').then( (pdf) => {
       
            all.innerHTML = 'somedata'
            
                pdf.addPage();
            
            
        
      }).toContainer().toCanvas().toPdf().save(); 
    
    //all.innerHTML = ps[30]

   
    //html2pdf().set(opt('testfile')).from(all).save();

    
            //all.innerHTML+=template(s)
           /*  html2pdf().set(opt('testfile')).from(all).toPdf().get('pdf').then( (pdf) => {
                all.innerHTML = '';
                pdf.addPage();
              }).toContainer().toCanvas().toPdf().save();  */

})