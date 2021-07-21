import styled from '@emotion/styled';
import { Avatar } from '@material-ui/core';
import { AvatarCoinProps } from './interface';

export * from "./overrides/muTheme"
export * from "./css/global"
// export * from "./css/color-lib"
export * from "./interface"
export * from "./globalSetup"

export const AvatarCoinStyled = styled(Avatar)<AvatarCoinProps>`
      &.MuiAvatar-root{  
        height: 36px;
        width: 36px;
        transform-origin: top left;
        background-image: url("./static/images/coin/loopring.png") ;
        ${({imgX,imgY,imgHeight=36,imgWidth=36,size=24}:AvatarCoinProps)=>{
            return `
             background-position-x: -${imgX}px ;
             background-position-y: -${imgY}px ;
             height: ${imgHeight}px ;
             width: ${imgWidth}px ;
             transform: scale(${size/36});
        `}}
        background-size: auto;
        
      }
` as React.ComponentType<AvatarCoinProps>;