console.log('compare')


const getData = async () => {
    const allCall = await fetch('/compareget')
    const data = await allCall.json()
    console.log(data)
}

getData()