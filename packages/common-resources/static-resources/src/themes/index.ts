import styled from '@emotion/styled';
import { Avatar } from '@material-ui/core';
import { AvatarCoinProps } from './interface';

export * from "./overrides/muTheme"
export * from "./css/global"
// export * from "./css/color-lib"
export * from "./interface"
export * from "./globalSetup"
//transform-origin: top left;

export const AvatarCoinStyled = styled(Avatar)<AvatarCoinProps>`
      &.MuiAvatar-root{  
        height: 36px;
        width: 36px;
        background-image: url("./static/images/coin/loopring.png") ;
        ${({imgx,imgy,imgheight=36,imgwidth=36,size=24}:AvatarCoinProps)=>{
            return `
             background-position-x: -${imgx}px ;
             background-position-y: -${imgy}px ;
             height: ${imgheight}px ;
             width: ${imgwidth}px ;
             transform-origin: center;
             transform: scale(${size/36});
        `}}
        background-size: auto;
        
      }
` as React.ComponentType<AvatarCoinProps>;