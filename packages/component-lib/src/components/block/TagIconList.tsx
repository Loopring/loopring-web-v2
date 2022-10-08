import { Avatar, Typography } from "@mui/material";
import React from "react";
import { CAMPAIGN_TAG } from "@loopring-web/common-resources";
import { useTheme } from "@emotion/react";

export const TagIconList = React.memo(
  ({
    campaignTagConfig,
    symbol,
    scenario,
    size,
  }: {
    campaignTagConfig: CAMPAIGN_TAG[];
    symbol: string;
    size?: string;
    scenario: "market" | "AMM" | "orderbook" | "Fiat";
  }) => {
    const theme = useTheme();
    return (
      <Typography
        component={"span"}
        display={"inline-flex"}
        className={"tagIconList"}
      >
        {campaignTagConfig.map((item) => {
          if (
            item.scenarios?.includes(scenario) &&
            item.symbols?.includes(symbol) &&
            item.endShow >= Date.now() &&
            item.startShow <= Date.now()
          ) {
            return (
              <Avatar
                alt={item.name}
                style={{
                  width: size ? size : "var(--svg-size-medium)",
                  height: size ? size : "var(--svg-size-medium)",
                  marginRight: theme.unit / 2,
                }}
                src={item.iconSource}
              />
            );
          } else {
            return <></>;
          }
        })}
      </Typography>
    );
  }
);
