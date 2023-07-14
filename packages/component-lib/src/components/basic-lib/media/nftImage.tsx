import { NftImageProps } from './Interface'
import { css, Theme } from '@emotion/react'
import styled from '@emotion/styled'
import { Box } from '@mui/material'
import { SoursURL } from '@loopring-web/loopring-sdk'

export const NftImage = (props: NftImageProps & any) => {
  return (
    <img
      // contentEditable={true}
      referrerPolicy={'unsafe-url'}
      // loading={"lazy"}
      // crossOrigin={"anonymous"}
      style={{ objectFit: 'contain' }}
      onError={props.onError}
      alt={props.name ?? 'NFT'}
      width={props.width ?? '100%'}
      height={props.height ?? '100%'}
      src={props.src?.replace(/(javascript:)|(data:)/gi, '')}
    />
  )
}

export const NftImageStyle = (props: { src: string | undefined; style?: React.CSSProperties }) => {
  return (
    <img
      referrerPolicy={'unsafe-url'}
      style={{ objectFit: 'contain', ...props.style }}
      alt={'NFT'}
      src={props.src?.replace(/(javascript:)|(data:)/gi, '')}
    />
  )
}

export const cssBackground = (_props: { theme: Theme }) => {
  // const fillColor = theme.colorBase.textDisable.replace("#", "%23");
  // const _svg =
  //   encodeURI(`<svg width="24" height="24" viewBox="0 0 24 24" fill="${fillColor}" xmlns="http://www.w3.org/2000/svg">
  //   <g opacity="0.09">
  //     <path fill-rule="evenodd" clip-rule="evenodd" d="M3.59635 7.47796L12.0594 2.80892L20.5971 7.47796V16.522L12.0642 21.1885L3.59635 16.3878V7.47796ZM12.0504 1L22.1799 6.53957V12V17.4604L12.0504 23L2 17.3022V6.53957L12.0504 1ZM10.3283 15.3263C10.3283 15.5885 10.1157 15.8011 9.85346 15.8011H9.08297C8.897 15.8011 8.72815 15.6925 8.65097 15.5233L6.27116 10.3061C6.26803 10.2992 6.26117 10.2948 6.25362 10.2948C6.24273 10.2948 6.234 10.3038 6.23434 10.3147C6.23951 10.4782 6.24469 10.645 6.24986 10.8148C6.25525 10.9848 6.26063 11.1581 6.26602 11.3349C6.27678 11.5048 6.28486 11.6782 6.29024 11.8549C6.29563 12.0248 6.30101 12.1982 6.3064 12.3749V15.3263C6.3064 15.5885 6.09381 15.8011 5.83158 15.8011H5.69095C5.42871 15.8011 5.21613 15.5885 5.21613 15.3263V8.99534C5.21613 8.7331 5.42871 8.52052 5.69095 8.52052H6.45413C6.6397 8.52052 6.80827 8.62863 6.88567 8.79729L9.25836 13.9674C9.26072 13.9726 9.26586 13.9759 9.27152 13.9759C9.2797 13.9759 9.28625 13.9691 9.28599 13.9609C9.28076 13.7961 9.27554 13.6346 9.27031 13.4762C9.26493 13.3063 9.25954 13.1397 9.25416 12.9766C9.25416 12.8066 9.25147 12.6401 9.24608 12.4769L9.22993 11.9671V8.99534C9.22993 8.7331 9.44252 8.52052 9.70475 8.52052H9.85346C10.1157 8.52052 10.3283 8.7331 10.3283 8.99534V15.3263ZM12.2987 15.3263C12.2987 15.5885 12.0861 15.8011 11.8238 15.8011H11.5701C11.3079 15.8011 11.0953 15.5885 11.0953 15.3263V8.99534C11.0953 8.7331 11.3079 8.52052 11.5701 8.52052H13.9236C14.1858 8.52052 14.3984 8.7331 14.3984 8.99534V9.31011C14.3984 9.57235 14.1858 9.78493 13.9236 9.78493H12.7735C12.5112 9.78493 12.2987 9.99752 12.2987 10.2598V11.1863C12.2987 11.4486 12.5112 11.6612 12.7735 11.6612H13.7782C14.0405 11.6612 14.2531 11.8737 14.2531 12.136V12.4508C14.2531 12.713 14.0405 12.9256 13.7782 12.9256H12.7735C12.5112 12.9256 12.2987 13.1382 12.2987 13.4004V15.3263ZM17.4192 15.8011C17.6814 15.8011 17.894 15.5885 17.894 15.3263V10.2801C17.894 10.0179 18.1066 9.80532 18.3688 9.80532H18.9859C19.2481 9.80532 19.4607 9.59274 19.4607 9.3305V8.99534C19.4607 8.7331 19.2481 8.52052 18.9859 8.52052H15.5826C15.3203 8.52052 15.1077 8.7331 15.1077 8.99534V9.3305C15.1077 9.59274 15.3203 9.80532 15.5826 9.80532H16.1997C16.4619 9.80532 16.6745 10.0179 16.6745 10.2801V12.8032V15.3263C16.6745 15.5885 16.8871 15.8011 17.1493 15.8011H17.4192Z"/>
  //   </g>
  //   </svg>`);

  // background-image: url("data:image/svg+xml, ${svg}");

  return css`
    flex: 1;
    background-color: var(--color-box);
    background-repeat: no-repeat;
    background-clip: content-box;
    background-size: contain;
    background-position: 50% 50%;
    align-self: stretch;
  `
}

export const BoxNFT = styled(Box)`
  background: no-repeat 50% 50%;
  background-color: var(--opacity);
  background-image: url(${SoursURL + 'svg/loopring.svg'});

  &.redPacketNFT {
    //height: var(--nft-large-avatar);
    width: var(--nft-large-avatar);
    padding-top: var(--nft-large-avatar);
  }

  img {
    object-fit: contain;
    overflow: hidden;
    border-radius: ${({ theme }) => theme.unit}px;
  }
` as typeof Box
