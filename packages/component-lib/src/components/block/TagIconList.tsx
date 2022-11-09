import { Avatar, Tooltip, Typography } from "@mui/material";
import React from "react";
import { CAMPAIGNTAGCONFIG, SCENARIO } from "@loopring-web/common-resources";
import { useTheme } from "@emotion/react";

export const TagIconList = React.memo(
  ({
    campaignTagConfig,
    symbol,
    scenario,
    size,
  }: {
    campaignTagConfig: CAMPAIGNTAGCONFIG;
    symbol: string;
    size?: string;
    scenario: SCENARIO;
  }) => {
    const theme = useTheme();
    return (
      <Typography
        component={"span"}
        display={"inline-flex"}
        className={"tagIconList"}
      >
        {campaignTagConfig[scenario]?.map((item) => {
          if (
            // item.scenarios?.includes(scenario) &&
            item.symbols?.includes(symbol) &&
            item.endShow >= Date.now() &&
            item.startShow <= Date.now()
          ) {
            return (
              <>
                {item?.behavior === "tooltips" ? (
                  <Tooltip title={item.content ?? scenario}>
                    <Avatar
                      alt={item.name}
                      style={{
                        width: size ? size : "var(--svg-size-medium)",
                        height: size ? size : "var(--svg-size-medium)",
                        marginRight: theme.unit / 2,
                      }}
                      src={item.iconSource}
                    />
                  </Tooltip>
                ) : (
                  <Avatar
                    onClick={() => {
                      if (item?.behavior === "link") {
                        window.open(item.content, "_blank");
                        window.opener = null;
                      }
                    }}
                    alt={item.name}
                    style={{
                      width: size ? size : "var(--svg-size-medium)",
                      height: size ? size : "var(--svg-size-medium)",
                      marginRight: theme.unit / 2,
                    }}
                    src={item.iconSource}
                  />
                )}
              </>
            );
          } else {
            return <></>;
          }
        })}
      </Typography>
    );
  }
);
