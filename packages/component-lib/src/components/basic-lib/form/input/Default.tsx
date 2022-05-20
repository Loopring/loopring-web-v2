import styled from "@emotion/styled";
import {
  Avatar,
  Box,
  FormControlLabel as MuFormControlLabel,
  TextField as MuTextField,
} from "@mui/material";
import {
  AvatarCoinStyled,
  LPTokenType,
  MarketType,
  SoursURL,
} from "@loopring-web/common-resources";
import { useSettings } from "../../../../stores";

// ${({theme}) => theme.border.defaultFrame({c_key: 'blur', d_R: 1/2})};
export const FormControlLabel = styled(MuFormControlLabel)`
  && {
    padding-right: ${({ theme }) => theme.unit * 2}px;
    background-color: inherit;
    border-radius: ${({ theme }) => theme.unit / 2}px;
    color: var(--color-text-secondary);
  }
`;
export const TextField = styled(MuTextField)`
  label + & {
    //margin-top: 24px;
    margin-top: 0;
  }

  && {
    .MuiSelect-nativeInput + svg {
      position: absolute;
      right: 0.4rem;
      top: ${({ theme }) => theme.unit}px;
      color: var(--color-text-secondary);
    }

    &:not(.MuiFormControl-fullWidth) {
      max-width: 260px;
    }

    text-overflow: fade();
  }

  &:focus {
    ${({ theme }) => theme.border.defaultFrame({ c_key: "focus", d_R: 0.5 })};
    outline: transparent;
  }
` as typeof MuTextField;

export const CoinIcon = <R extends MarketType | string | LPTokenType>({
  symbol,
  lpSize = 24,
  size = 24,
}: {
  symbol: R;
  lpSize?: number;
  size?: number;
}) => {
  const { coinJson } = useSettings();
  if (symbol && symbol.match(/LP-(\w+)-(\w+)/i) && coinJson) {
    // @ts-ignore
    const [, coinA, coinB] = symbol.match(/LP-(\w+)-(\w+)/i);
    const coinAIcon: any = coinJson[coinA];
    const coinBIcon: any = coinJson[coinB];
    return (
      <Box display={"flex"} alignItems={"center"} marginRight={-1 / 2}>
        <Box
          className={"logo-icon"}
          display={"flex"}
          height={"var(--list-menu-coin-size)"}
          position={"relative"}
          zIndex={20}
          width={"var(--list-menu-coin-size)"}
          alignItems={"center"}
          justifyContent={"center"}
        >
          {coinAIcon ? (
            <AvatarCoinStyled
              imgx={coinAIcon.x}
              imgy={coinAIcon.y}
              imgheight={coinAIcon.h}
              imgwidth={coinAIcon.w}
              size={lpSize}
              variant="circular"
              alt={symbol}
              src={
                "data:image/svg+xml;utf8," +
                '<svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M0 0H36V36H0V0Z"/></svg>'
              }
            />
          ) : (
            <Avatar
              variant="circular"
              alt={symbol}
              style={{
                height: "var(--list-menu-coin-size)",
                width: "var(--list-menu-coin-size)",
              }}
              src={SoursURL + "images/icon-default.png"}
            />
          )}
        </Box>
        <Box
          className={"logo-icon"}
          display={"flex"}
          height={"var(--list-menu-coin-size)"}
          position={"relative"}
          zIndex={18}
          left={-8}
          width={"var(--list-menu-coin-size)"}
          alignItems={"center"}
          justifyContent={"center"}
        >
          {coinBIcon ? (
            <AvatarCoinStyled
              imgx={coinBIcon.x}
              imgy={coinBIcon.y}
              imgheight={coinBIcon.h}
              imgwidth={coinBIcon.w}
              size={lpSize}
              variant="circular"
              alt={symbol}
              src={
                "data:image/svg+xml;utf8," +
                '<svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M0 0H36V36H0V0Z"/></svg>'
              }
            />
          ) : (
            <Avatar
              variant="circular"
              alt={symbol}
              style={{
                height: "var(--list-menu-coin-size)",
                width: "var(--list-menu-coin-size)",
              }}
              src={SoursURL + "images/icon-default.png"}
            />
          )}
        </Box>
      </Box>
    );
  } else {
    const coinIcon: any = coinJson[symbol];
    return (
      <>
        {coinIcon ? (
          <AvatarCoinStyled
            imgx={coinIcon.x}
            imgy={coinIcon.y}
            imgheight={coinIcon.h}
            imgwidth={coinIcon.w}
            size={size}
            variant="circular"
            alt={symbol}
            src={
              "data:image/svg+xml;utf8," +
              '<svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M0 0H36V36H0V0Z"/></svg>'
            }
          />
        ) : (
          <Avatar
            variant="circular"
            alt={symbol}
            style={{
              height: "var(--list-menu-coin-size)",
              width: "var(--list-menu-coin-size)",
            }}
            // src={sellData?.icon}
            src={SoursURL + "images/icon-default.png"}
          />
        )}
      </>
    );
  }
};
