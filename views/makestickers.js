console.log('makestickers')


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
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(dataset)
    });
    const content = await rawResponse.json();
  
    return content
  }

  const all = document.querySelector('.pdf')

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

let ps = []

const trun = (str, length) => {
        return str.length > length
          ? `${str.substr(0, length)}...`
          : str;
      }


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
    const answer = await apiPost('/dataset', dataset)
    console.log(answer)
    
    mypdf(answer)


    
}, false)