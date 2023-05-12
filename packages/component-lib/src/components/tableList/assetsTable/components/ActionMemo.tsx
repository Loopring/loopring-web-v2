import React from "react";
import { Box, Grid, ListItemText, MenuItem, Typography } from "@mui/material";
import styled from "@emotion/styled";
import {
  Button,
  Popover,
  PopoverPure,
  PopoverType,
  PopoverWrapProps,
} from "../../../basic-lib";
import {
  EmptyValueTag,
  getValuePrecisionThousand,
  MoreIcon,
} from "@loopring-web/common-resources";
import { useHistory } from "react-router-dom";
import { TFunction } from "i18next";
import { useOpenModals, useSettings, useToggle } from "../../../../stores";
import { AmmPanelType } from "../../../tradePanel";
import { RawDataAssetsItem } from "../AssetsTable";
import { bindTrigger, usePopupState } from "material-ui-popup-state/hooks";
import { bindPopover } from "material-ui-popup-state/core";
import { LoadingBlock } from "../../../block";
import { useTranslation } from "react-i18next";

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
  isDefi: boolean;
  isInvest: boolean;
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
    isDefi,
    allowTrade,
    onSend,
    onReceive,
    // onShowDeposit,
    tokenValue,
    isInvest,
    // onShowTransfer,
    // onShowWithdraw,
    getMarketArrayListCallback,
    t,
  }: ActionProps) => {
    const history = useHistory();
    const { setShowAmm } = useOpenModals();
    const { toggle } = useToggle();
    const _allowTrade = {
      ...toggle,
      allowTrade,
    };
    const { isMobile } = useSettings();
    const tradeList = [
      ...[
        <MenuItem key={"token-Receive"} onClick={() => onReceive(tokenValue)}>
          <ListItemText>{t("labelReceive")}</ListItemText>
        </MenuItem>,
        <MenuItem key={"token-Send"} onClick={() => onSend(tokenValue, isLp)}>
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
            <MenuItem
              disabled={!_allowTrade?.joinAmm?.enable}
              onClick={
                () => {
                  // const pair = `${row.ammDetail.coinAInfo.name}-${row.ammDetail.coinBInfo.name}`;
                  setShowAmm({
                    isShow: true,
                    type: AmmPanelType.Join,
                    symbol: market,
                  });
                }
                // () => undefined
                // history.push(
                //   `/liquidity/pools/coinPair/${market}?type=${LpTokenAction.add}`
                // )
              }
            >
              <ListItemText>{t("labelPoolTableAddLiquidity")}</ListItemText>
            </MenuItem>
            <MenuItem
              onClick={
                () => {
                  setShowAmm({
                    isShow: true,
                    type: AmmPanelType.Exit,
                    symbol: market,
                  });
                }
                // history.push(
                //   `/liquidity/pools/coinPair/${market}?type=${LpTokenAction.remove}`
                // )
              }
            >
              <ListItemText>{t("labelPoolTableRemoveLiquidity")}</ListItemText>
            </MenuItem>
          </>
        ) : isDefi ? (
          isInvest && !isMobile ? (
            <>
              {tradeList.map((item) => (
                <>{item}</>
              ))}
            </>
          ) : (
            <>
              <MenuItem
                disabled={!_allowTrade?.[`${tokenValue}Invest`]?.enable}
                onClick={() => {
                  history.push(`/invest/defi/${tokenValue}-null/invest`);
                }}
              >
                <ListItemText>{t("labelDefiInvest")}</ListItemText>
              </MenuItem>
              <MenuItem
                disabled={!_allowTrade?.[`${tokenValue}Invest`]?.enable}
                onClick={() => {
                  history.push(`/invest/defi/${tokenValue}-null/redeem`);
                }}
              >
                <ListItemText>{t("labelDefiRedeem")}</ListItemText>
              </MenuItem>
            </>
          )
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
  const history = useHistory();
  const {
    t,
    allowTrade,
    tokenValue,
    onSend,
    onReceive,
    isLp,
    isInvest = false,
    isDefi,
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
          {((!isLp && allowTrade?.order?.enable) || isLp || isDefi) && (
            <Grid item marginTop={1}>
              <Popover {...{ ...popoverProps }} />
            </Grid>
          )}
        </>
      ) : (
        <>
          <Box display={"flex"}>
            {isInvest ? (
              <>
                <Grid item>
                  <Button
                    variant={"text"}
                    size={"small"}
                    color={"primary"}
                    onClick={() => {
                      history.push(`/invest/defi/${tokenValue}-null/invest`);
                    }}
                  >
                    {t("labelDefiInvest")}
                  </Button>
                </Grid>
                <Grid item>
                  <Button
                    variant={"text"}
                    size={"small"}
                    color={"primary"}
                    onClick={() => {
                      history.push(`/invest/defi/${tokenValue}-null/redeem`);
                    }}
                  >
                    {t("labelDefiRedeem")}
                  </Button>
                </Grid>
              </>
            ) : (
              <>
                <Grid item>
                  <Button
                    variant={"text"}
                    size={"small"}
                    color={"primary"}
                    onClick={() => onReceive(tokenValue)}
                  >
                    {t("labelReceive")}
                  </Button>
                </Grid>
                <Grid item>
                  <Button
                    variant={"text"}
                    size={"small"}
                    color={"primary"}
                    onClick={() => onSend(tokenValue, isLp)}
                  >
                    {t("labelSend")}
                  </Button>
                </Grid>
              </>
            )}
          </Box>
          {!isLp && !isInvest && allowTrade?.order?.enable && (
            <Grid item marginTop={1}>
              <Popover {...{ ...popoverProps }} />
            </Grid>
          )}
          {(isLp || isInvest) && (
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

export const LockedMemo = React.memo(
  (
    props: RawDataAssetsItem & {
      onTokenLockHold?: (item: any) => void;
      tokenLockDetail?: any[] | undefined;
    }
  ) => {
    const { t } = useTranslation(["tables", "common"]);
    const { onTokenLockHold, tokenLockDetail, ...row } = props;
    const popupState = usePopupState({
      variant: "popover",
      popupId: "lockedDetail",
    });
    const bindAction = bindTrigger(popupState);
    const value = row["locked"];
    const precision = row["precision"];
    if (!Number(value)) {
      return <Box className={"textAlignRight"}>{EmptyValueTag}</Box>;
    } else {
      return (
        <Box className={"textAlignRight"}>
          <Typography
            display={"inline-flex"}
            alignItems={"center"}
            component={"span"}
            sx={{ textDecoration: onTokenLockHold ? "underline dotted" : "" }}
            // @ts-ignore
            onClick={(e) => {
              if (onTokenLockHold) {
                onTokenLockHold(row);
                bindAction.onClick(e as any);
              }
            }}
          >
            {getValuePrecisionThousand(
              value,
              precision,
              precision,
              undefined,
              false,
              { floor: true }
            )}
            {/*<IconButtonStyle size={"large"} edge={"end"}>*/}
            {/*  <ViewMoreIcon />*/}
            {/*</IconButtonStyle>*/}
          </Typography>
          <PopoverPure
            className={"arrow-right"}
            {...bindPopover(popupState)}
            {...{
              anchorOrigin: {
                vertical: "bottom",
                horizontal: "right",
              },
              transformOrigin: {
                vertical: "top",
                horizontal: "right",
              },
            }}
          >
            <Box borderRadius={"inherit"} minWidth={110}>
              {tokenLockDetail ? (
                tokenLockDetail.map((item) => {
                  return (
                    <Box
                      display={"flex"}
                      key={item.key}
                      flexDirection={"row"}
                      justifyContent={"space-between"}
                      paddingX={1}
                    >
                      <Typography
                        display={"inline-flex"}
                        alignItems={"center"}
                        component={"span"}
                        color={"textSecondary"}
                      >
                        {t(item.key)}
                      </Typography>
                      <Typography
                        display={"inline-flex"}
                        alignItems={"center"}
                        component={"span"}
                        color={"textPrimary"}
                      >
                        {item.value}
                      </Typography>
                    </Box>
                  );
                })
              ) : (
                <LoadingBlock />
              )}
            </Box>
          </PopoverPure>
        </Box>
      );
    }
  }
);
