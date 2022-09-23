import React from "react";
import { Avatar, Box, BoxProps, styled } from "@mui/material";
import { AvatarCoinStyled, SoursURL } from "@loopring-web/common-resources";

const BoxStyle = styled(Box)<BoxProps & { size: number }>`
  ${({ size }) => {
    return `
    .logo-icon.dual:last-child {
      transform: scale(0.6) translate(${size / 6}px, ${size / 6}px);
    }
    `;
  }}
`;

export const CoinIcons = React.memo(
  ({
    tokenIcon,
    size = 24,
    type = "token",
  }: {
    tokenIcon: [any, any?];
    size?: number;
    type?: string;
  }) => {
    const [coinAInfo, coinBInfo] = tokenIcon;
    return (
      <BoxStyle display={"flex"} justifyContent={"center"} size={size}>
        <Box
          className={`logo-icon ${type}`}
          display={"flex"}
          height={"var(--list-menu-coin-size)"}
          position={"relative"}
          zIndex={20}
          width={"var(--list-menu-coin-size)"}
          alignItems={"center"}
          justifyContent={"center"}
        >
          {coinAInfo ? (
            <AvatarCoinStyled
              imgx={coinAInfo.x}
              imgy={coinAInfo.y}
              imgheight={coinAInfo.height}
              imgwidth={coinAInfo.width}
              size={size}
              variant="circular"
              alt={coinAInfo?.simpleName as string}
              // src={sellData?.icon}
              src={
                "data:image/svg+xml;utf8," +
                '<svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M0 0H36V36H0V0Z"/></svg>'
              }
            />
          ) : (
            <Avatar
              variant="circular"
              alt={coinAInfo?.simpleName as string}
              style={{
                height: size ?? "var(--list-menu-coin-size)",
                width: size ?? "var(--list-menu-coin-size)",
              }}
              // src={sellData?.icon}
              src={SoursURL + "images/icon-default.png"}
            />
          )}
        </Box>
        {coinBInfo || ["dual", "lp"].includes(type) ? (
          <Box
            className={`logo-icon ${type}`}
            display={"flex"}
            height={"var(--list-menu-coin-size)"}
            position={"relative"}
            zIndex={18}
            left={-8}
            width={"var(--list-menu-coin-size)"}
            alignItems={"center"}
            justifyContent={"center"}
          >
            {coinBInfo ? (
              <AvatarCoinStyled
                imgx={coinBInfo.x}
                imgy={coinBInfo.y}
                imgheight={coinBInfo.h}
                imgwidth={coinBInfo.w}
                size={size}
                variant="circular"
                alt={coinBInfo?.simpleName as string}
                // src={sellData?.icon}
                src={
                  "data:image/svg+xml;utf8," +
                  '<svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M0 0H36V36H0V0Z"/></svg>'
                }
              />
            ) : (
              <Avatar
                variant="circular"
                alt={coinBInfo?.simpleName as string}
                style={{
                  height: size ?? "var(--list-menu-coin-size)",
                  width: size ?? "var(--list-menu-coin-size)",
                }}
                // src={sellData?.icon}
                src={SoursURL + "images/icon-default.png"}
              />
            )}
          </Box>
        ) : (
          <></>
        )}
      </BoxStyle>
    );
  }
);
