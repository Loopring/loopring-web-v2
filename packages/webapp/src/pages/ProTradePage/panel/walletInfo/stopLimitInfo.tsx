import { Trans, WithTranslation, withTranslation } from "react-i18next";

import {
  Avatar,
  Box,
  Divider,
  List,
  ListItem,
  Typography,
} from "@mui/material";
import { SoursURL, ThemeType } from "@loopring-web/common-resources";
import React from "react";

export const StopLimitInfo = withTranslation("common")(
  ({ t }: WithTranslation) => {
    const theme = useTheme();
    return (
      <Box
        display={"flex"}
        flexDirection={"column"}
        alignItems={"stretch"}
        height={"100%"}
      >
        <Box component={"header"} width={"100%"} paddingX={2}>
          <Typography variant={"body1"} lineHeight={"44px"}>
            {t(`labelStopLimitWhatIs`)}
          </Typography>
        </Box>
        <Divider style={{ marginTop: "-1px" }} />
        <Box
          flex={"1"}
          display={"flex"}
          flexDirection={"column"}
          sx={{ overflowY: "scroll" }}
          paddingX={2}
        >
          <Typography
            component={"p"}
            variant={"body1"}
            color={"textPrimary"}
            marginTop={2}
          >
            {t("labelLimitMainContent")}
          </Typography>
          <Box display={"flex"} flexDirection={"column"} marginTop={2}>
            <Typography
              component={"h6"}
              variant={"body1"}
              color={"textPrimary"}
            >
              {t("labelLimitStopPriceLabel")}
            </Typography>
            <Typography
              component={"p"}
              variant={"body1"}
              color={"textSecondary"}
              marginTop={1}
            >
              {t("labelLimitStopPriceContent")}
            </Typography>
          </Box>
          <Box display={"flex"} flexDirection={"column"} marginTop={2}>
            <Typography
              component={"h6"}
              variant={"body1"}
              color={"textPrimary"}
            >
              {t("labelLimitLimitPriceLabel")}
            </Typography>
            <Typography
              component={"p"}
              variant={"body1"}
              color={"textSecondary"}
              marginTop={1}
            >
              {t("labelLimitLimitPriceContent")}
            </Typography>
          </Box>
          <Box display={"flex"} flexDirection={"column"} marginTop={2}>
            <Typography
              component={"h6"}
              variant={"body1"}
              color={"textPrimary"}
            >
              {t("labelLimitAmountLabel")}
            </Typography>
            <Typography
              component={"p"}
              variant={"body1"}
              color={"textSecondary"}
              marginTop={1}
            >
              {t("labelLimitAmountContent")}
            </Typography>
          </Box>
          <Typography
            component={"p"}
            marginTop={2}
            variant={"body1"}
            color={"textPrimary"}
          >
            {t("labelLimitDes")}
          </Typography>
          <Box display={"flex"} flexDirection={"column"} marginTop={2}>
            <Typography
              component={"h6"}
              variant={"body1"}
              color={"textPrimary"}
            >
              {t("labelLimitDemoTitle")}
            </Typography>
            <Typography component={"span"} marginTop={1}>
              <Avatar
                variant="rounded"
                style={{
                  width: "100%",
                  height: "100%",
                }}
                alt={""}
                // src={sellData?.icon}
                src={
                  SoursURL +
                  (theme.mode === ThemeType.dark
                    ? "images/stoplimit_dark.svg"
                    : "images/stoplimit_light.svg")
                }
              />
            </Typography>
          </Box>
          <Box display={"flex"} flexDirection={"column"} marginTop={2}>
            <Typography
              variant={"body1"}
              component={"div"}
              color={"textPrimary"}
              sx={{ whiteSpace: "pre-line", wordBreak: "break-all" }}
            >
              <Trans
                i18nKey={"labelLimitDemoDes"}
                components={{
                  li: (
                    <ListItem
                      sx={{
                        height: "auto",
                        display: "list-item",
                        paddingLeft: 1 / 2,
                      }}
                    />
                  ),
                  ol: (
                    <List
                      sx={{
                        marginTop: 1,
                        listStyle: "disc outside",
                        marginLeft: 1 / 2,
                      }}
                    />
                  ),
                }}
              >
                The current price is 2,400 (A). You can set the stop price above
                the current price, such as 3,000 (B), or below the current
                price, such as 1,500 (C). Once the price goes up to 3,000 (B) or
                drops to 1,500 (C), the Stop-Limit order will be triggered, and
                the limit order will be automatically placed on the order book.
                Note:
                <List sx={{ marginTop: 1 }}>
                  <ListItem>
                    Limit price can be set above or below the stop price for
                    both buy and sell orders. For example, stop price B can be
                    placed along with a lower limit price B1 or a higher limit
                    price B2.
                  </ListItem>
                  <ListItem>
                    A limit order is invalid before the stop price is triggered,
                    including when the limit price is reached ahead of the stop
                    price.
                  </ListItem>
                  <ListItem>
                    When the stop price is reached, it only indicates that a
                    limit order is activated and will be submitted to the order
                    book rather than the limit order being filled immediately.
                    The limit order will be executed according to its own rules.
                  </ListItem>
                </List>
              </Trans>
            </Typography>
          </Box>
        </Box>
      </Box>
    );
  }
);
