import styled from "@emotion/styled";
import { Avatar } from "@mui/material";
import { AvatarCoinProps } from "./interface";
import { hr } from "./overrides/overrides-mui";

export * from "./overrides/muTheme";
export * from "./css/global";
// export * from "./css/color-lib"
export * from "./interface";
export * from "./globalSetup";
export { hexToRGB } from "./css/color-lib";
//transform-origin: top left;
export { hr };
//https://static.loopring.io/assets/images/coin/loopring.png
export const AvatarCoinStyled = styled(Avatar)<AvatarCoinProps>`
  &.MuiAvatar-root {
    height: 36px;
    width: 36px;
    background-image: url("./static/coin/loopring.png");
    ${({
      imgx,
      imgy,
      imgheight = 36,
      imgwidth = 36,
      size = 24,
    }: AvatarCoinProps) => {
      return `
             background-position-x: -${imgx}px ;
             background-position-y: -${imgy}px ;
             height: ${imgheight}px ;
             width: ${imgwidth}px ;
             transform-origin: center;
             transform: scale(${size / 36});
        `;
    }}
    background-size: auto;
  }
` as (props: AvatarCoinProps) => JSX.Element;
