import React from "react";
import { Avatar, Box } from "@mui/material";
import { AvatarCoinStyled, SoursURL } from "@loopring-web/common-resources";

export const CoinIcons = React.memo(
  ({ tokenIcon, size = 24 }: { tokenIcon: [any, any?]; size?: number }) => {
    const [coinAInfo, coinBInfo] = tokenIcon;
    return (
      <>
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
                height: "var(--list-menu-coin-size)",
                width: "var(--list-menu-coin-size)",
              }}
              // src={sellData?.icon}
              src={SoursURL + "images/icon-default.png"}
            />
          )}
        </Box>
        {coinBInfo ? (
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
            {coinBInfo.w ? (
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
                  height: "var(--list-menu-coin-size)",
                  width: "var(--list-menu-coin-size)",
                }}
                // src={sellData?.icon}
                src={SoursURL + "images/icon-default.png"}
              />
            )}
          </Box>
        ) : (
          <></>
        )}
      </>
    );
  }
);
