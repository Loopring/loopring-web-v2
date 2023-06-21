import React from 'react'
import { ShareReferralSvg, ShareReferralSvgProps } from '@loopring-web/common-resources'

export const ReferralImage = React.forwardRef(
  (
    { src, width, height, ...props }: ShareReferralSvgProps,
    ref: React.ForwardedRef<SVGSVGElement>,
  ) => {
    // let name: any = ;
    // name = name[name.length - 1];
    const [base64, setBase64] = React.useState('')
    const convertImageToBase64 = (imgUrl: string, callback: (dataUrl: string) => void) => {
      const image = new Image()
      image.crossOrigin = 'anonymous'
      image.onload = () => {
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        canvas.height = image.naturalHeight
        canvas.width = image.naturalWidth
        // @ts-ignore
        ctx.drawImage(image, 0, 0)
        const dataUrl = canvas.toDataURL()
        callback && callback(dataUrl)
      }
      image.src = imgUrl
    }
    convertImageToBase64(src, (dataUrl) => {
      setBase64(dataUrl)
    })

    return (
      <>
        {base64 && (
          <ShareReferralSvg
            ref={ref}
            src={base64}
            name={(src ?? '/').split('/')?.pop()}
            width={width}
            height={height}
            {...{ ...props }}
          />
        )}
      </>
    )
  },
)
