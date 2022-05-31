import React from "react";
import { Box, Grid, ListItemText, MenuItem } from "@mui/material";
import styled from "@emotion/styled";
import {
  Button,
  Popover,
  PopoverType,
  PopoverWrapProps,
} from "../../../basic-lib";
import { MoreIcon } from "@loopring-web/common-resources";
import { LpTokenAction } from "../AssetsTable";
import { useHistory } from "react-router-dom";
import { TFunction } from "i18next";
import { useSettings } from "../../../../stores";

const GridStyled = styled(Grid)`
  .MuiGrid-item {
    padding: ${({ theme }) => theme.unit / 4}px 0 0;
  }
`;
export type ActionProps = {
  tokenValue: any;
  allowTrade?: any;
  market: `${string}-${string}`;
  isLp: boolean;
  onSend: (token: string, isToL1: boolean) => void;
  onReceive: (token: string) => void;
  // onShowDeposit: (token: string) => void;
  // onShowTransfer: (token: string) => void;
  // onShowWithdraw: (token: string) => void;
  getMarketArrayListCallback: (token: string) => string[];
  t: TFunction;
};
const ActionPopContent = React.memo(
  ({
    market,
    isLp,
    allowTrade,
    onSend,
    onReceive,
    // onShowDeposit,
    tokenValue,
    // onShowTransfer,
    // onShowWithdraw,
    getMarketArrayListCallback,
    t,
  }: ActionProps) => {
    const history = useHistory();
    const { isMobile } = useSettings();
    const tradeList = [
      ...[
        <MenuItem onClick={() => onReceive(tokenValue)}>
          <ListItemText>{t("labelReceive")}</ListItemText>
        </MenuItem>,
        <MenuItem onClick={() => onSend(tokenValue, isLp)}>
          <ListItemText>{t("labelSend")}</ListItemText>
        </MenuItem>,
      ],
      // ...(isToL1
      //   ? [
      //       <MenuItem onClick={() => onShowWithdraw(tokenValue)}>
      //         <ListItemText>{t("labelL2toL1Action")}</ListItemText>
      //       </MenuItem>,
      //     ]
      //   : []),
    ];
    const marketList = isLp
      ? []
      : getMarketArrayListCallback(market).filter((pair) => {
          const [first, last] = pair.split("-");
          if (first === "USDT" || last === "USDT") {
            return true;
          }
          return first === market;
        });

    return (
      <Box borderRadius={"inherit"} minWidth={110}>
        {isMobile && tradeList.map((item) => <>{item}</>)}
        {isLp ? (
          <>
            {allowTrade?.joinAmm?.enable && (
              <MenuItem
                onClick={() =>
                  history.push(
                    `/liquidity/pools/coinPair/${market}?type=${LpTokenAction.add}`
                  )
                }
              >
                <ListItemText>{t("labelPoolTableAddLiqudity")}</ListItemText>
              </MenuItem>
            )}
            <MenuItem
              onClick={() =>
                history.push(
                  `/liquidity/pools/coinPair/${market}?type=${LpTokenAction.remove}`
                )
              }
            >
              <ListItemText>{t("labelPoolTableRemoveLiqudity")}</ListItemText>
            </MenuItem>
          </>
        ) : (
          marketList.map((pair) => {
            const formattedPair = pair.replace("-", " / ");
            return (
              <MenuItem
                key={pair}
                onClick={() =>
                  history.push({
                    pathname: `/trade/lite/${pair}`,
                  })
                }
              >
                <ListItemText>{formattedPair}</ListItemText>
              </MenuItem>
            );
          })
        )}
      </Box>
    );
  }
);

const ActionMemo = React.memo((props: ActionProps) => {
  const { isMobile } = useSettings();
  const {
    t,
    allowTrade,
    tokenValue,
    onSend,
    onReceive,
    isLp,
    // onShowDeposit,
    // onShowTransfer,
    // onShowWithdraw,
  } = props;
  const popoverProps: PopoverWrapProps = {
    type: PopoverType.click,
    popupId: "testPopup",
    className: "arrow-none",
    children: <MoreIcon cursor={"pointer"} />,
    popoverContent: <ActionPopContent {...props} />,
    anchorOrigin: {
      vertical: "bottom",
      horizontal: "right",
    },
    transformOrigin: {
      vertical: "top",
      horizontal: "right",
    },
  } as PopoverWrapProps;

  return (
    <GridStyled
      container
      spacing={1}
      justifyContent={"space-between"}
      alignItems={"center"}
    >
      {isMobile ? (
        <>
          {!isLp && allowTrade?.order?.enable && (
            <Grid item marginTop={1}>
              <Popover {...{ ...popoverProps }} />
            </Grid>
          )}
          {isLp && (
            <Grid item marginTop={1}>
              <Popover {...{ ...popoverProps }} />
            </Grid>
          )}
        </>
      ) : (
        <>
          <Box display={"flex"}>
            <Grid item>
              <Button
                variant={"text"}
                size={"medium"}
                color={"primary"}
                onClick={() => onReceive(tokenValue)}
              >
                {t("labelReceive")}
              </Button>
            </Grid>
            <Grid item>
              <Button
                variant={"text"}
                size={"medium"}
                color={"primary"}
                onClick={() => onSend(tokenValue, isLp)}
              >
                {t("labelSend")}
              </Button>
            </Grid>
            {/*{isToL1 && (*/}
            {/*  <Grid item>*/}
            {/*    <Button*/}
            {/*      variant={"text"}*/}
            {/*      size={"medium"}*/}
            {/*      color={"primary"}*/}
            {/*      onClick={() => onShowWithdraw(tokenValue)}*/}
            {/*    >*/}
            {/*      {t("labelL2toL1Action")}*/}
            {/*    </Button>*/}
            {/*  </Grid>*/}
            {/*)}*/}
          </Box>
          {!isLp && allowTrade?.order?.enable && (
            <Grid item marginTop={1}>
              <Popover {...{ ...popoverProps }} />
            </Grid>
          )}
          {isLp && (
            <Grid item marginTop={1}>
              <Popover {...{ ...popoverProps }} />
            </Grid>
          )}
        </>
      )}
    </GridStyled>
  );
});
export default ActionMemo;
