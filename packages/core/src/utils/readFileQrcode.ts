import jsQR from 'jsqr'
export const readFileQrCode = () => {
  return new Promise<string>((res, rej) => {
    var input = document.createElement('input')
    input.onchange = (e: any) => {
      var file = e.currentTarget.files && e.currentTarget.files[0]
      var reader = new FileReader()

      reader.onload = (readerEvent: any) => {
        const img = new Image()
        img.onload = () => {
          const canvas = document.createElement('canvas')
          canvas.width = img.width
          canvas.height = img.height
          const ctx = canvas.getContext('2d')
          ctx!.drawImage(img, 0, 0)
          const imageData = ctx!.getImageData(0, 0, canvas.width, canvas.height)
          const code = jsQR(imageData.data, imageData.width, imageData.height)
          if (code) {
            res(code.data)
          } else {
            rej('no code read')
          }
        }
        img.src = readerEvent.target.result
      }
      reader.readAsDataURL(file)
    }
    input.type = 'file'
    input.accept = '.jpg, .png, .jpeg'
    input.click()
  })
}
