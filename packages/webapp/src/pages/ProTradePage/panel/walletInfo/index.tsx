import { TFunction, withTranslation, WithTranslation } from "react-i18next";
import React from "react";

import {
  AccountStatus,
  AvatarCoinStyled,
  EmptyValueTag,
  fnType,
  getValuePrecisionThousand,
  i18n,
  LockIcon,
  MarketType,
  SagaStatus,
  SoursURL,
} from "@loopring-web/common-resources";
import { Avatar, Box, Divider, Typography } from "@mui/material";
import {
  Button,
  useOpenModals,
  useSettings,
} from "@loopring-web/component-lib";
import { usePageTradePro } from "stores/router";
import _ from "lodash";
import {
  accountStaticCallBack,
  btnClickMap,
  btnLabel,
} from "layouts/connectStatusCallback";
import { useAccount } from "stores/account";
import { HeaderHeight } from "../../index";
import * as sdk from "@loopring-web/loopring-sdk";
import { useTokenMap } from "../../../../stores/token";
import {
  volumeToCount,
  volumeToCountAsBigNumber,
} from "../../../../hooks/help";

const OtherView = React.memo(({ t }: { market: MarketType; t: TFunction }) => {
  const { status: accountStatus, account } = useAccount();
  const [label, setLabel] = React.useState("");
  const _btnLabel = Object.assign(_.cloneDeep(btnLabel), {
    [fnType.NO_ACCOUNT]: [
      function () {
        return `depositTitleAndActive`;
      },
    ],
    [fnType.ERROR_NETWORK]: [
      function () {
        return `labelWrongNetwork`;
      },
    ],
  });
  React.useEffect(() => {
    if (accountStatus === SagaStatus.UNSET) {
      setLabel(accountStaticCallBack(_btnLabel));
    }
  }, [accountStatus, account.readyState, i18n.language]);
  const _btnClickMap = Object.assign(_.cloneDeep(btnClickMap), {});
  const BtnConnect = React.useMemo(() => {
    return (
      <Button
        style={{ height: 28, fontSize: "1.4rem" }}
        variant={"contained"}
        size={"small"}
        color={"primary"}
        onClick={() => {
          accountStaticCallBack(_btnClickMap, []);
        }}
      >
        {t(label)}
      </Button>
    );
  }, [label]);
  const viewTemplate = React.useMemo(() => {
    switch (account.readyState) {
      case AccountStatus.UN_CONNECT:
        return (
          <Box
            flex={1}
            height={"100%"}
            display={"flex"}
            justifyContent={"center"}
            alignItems={"center"}
            flexDirection={"column"}
          >
            <Typography
              lineHeight={2}
              paddingX={2}
              color={"text.primary"}
              marginBottom={2}
              variant={"body1"}
              whiteSpace={"pre-line"}
              textAlign={"center"}
            >
              {t("describeTitleConnectToWallet")}
            </Typography>
            {BtnConnect}
          </Box>
        );

        break;
      case AccountStatus.LOCKED:
        return (
          <Box
            flex={1}
            height={"100%"}
            display={"flex"}
            justifyContent={"center"}
            alignItems={"center"}
            flexDirection={"column"}
          >
            <Typography
              lineHeight={2}
              paddingX={2}
              color={"text.primary"}
              marginBottom={2}
              variant={"body1"}
              whiteSpace={"pre-line"}
              textAlign={"center"}
            >
              {t("describeTitleLocked")}
            </Typography>
            {BtnConnect}
          </Box>
        );
        break;
      case AccountStatus.NO_ACCOUNT:
        return (
          <Box
            flex={1}
            height={"100%"}
            display={"flex"}
            justifyContent={"center"}
            alignItems={"center"}
            flexDirection={"column"}
          >
            <Typography
              lineHeight={2}
              paddingX={2}
              color={"text.primary"}
              marginBottom={2}
              variant={"body1"}
              whiteSpace={"pre-line"}
              textAlign={"center"}
            >
              {t("describeTitleNoAccount")}
            </Typography>
            {BtnConnect}
          </Box>
        );
        break;
      case AccountStatus.NOT_ACTIVE:
        return (
          <Box
            flex={1}
            height={"100%"}
            display={"flex"}
            justifyContent={"center"}
            alignItems={"center"}
            flexDirection={"column"}
          >
            <Typography
              lineHeight={2}
              paddingX={2}
              color={"text.primary"}
              marginBottom={2}
              variant={"body1"}
              whiteSpace={"pre-line"}
              textAlign={"center"}
            >
              {t("describeTitleNotActive")}
            </Typography>
            {BtnConnect}
          </Box>
        );
        break;
      case AccountStatus.DEPOSITING:
        return (
          <Box
            flex={1}
            height={"100%"}
            display={"flex"}
            justifyContent={"center"}
            alignItems={"center"}
            flexDirection={"column"}
          >
            <Typography
              lineHeight={2}
              paddingX={2}
              color={"text.primary"}
              marginBottom={2}
              variant={"body1"}
              whiteSpace={"pre-line"}
              textAlign={"center"}
            >
              {t("describeTitleOpenAccounting")}
            </Typography>
            {BtnConnect}
          </Box>
        );
        break;
      case AccountStatus.ERROR_NETWORK:
        return (
          <Box
            flex={1}
            height={"100%"}
            display={"flex"}
            justifyContent={"center"}
            alignItems={"center"}
            flexDirection={"column"}
          >
            <Typography
              lineHeight={2}
              paddingX={2}
              color={"text.primary"}
              marginBottom={2}
              variant={"body1"}
              whiteSpace={"pre-line"}
              textAlign={"center"}
            >
              {t("describeTitleOnErrorNetwork", {
                connectName: account.connectName,
              })}
            </Typography>
          </Box>
        );
        break;
      default:
        break;
    }
  }, [t, account.readyState, BtnConnect]);
  return <>{viewTemplate}</>;

  // const swapBtnClickArray = Object.assign(_.cloneDeep(btnClickMap), {
  //     [ fnType.ACTIVATED ]: [swapCalculatorCallback]
  // })
});
const AssetsValue = React.memo(({ symbol }: { symbol: string }) => {
  const {
    pageTradePro: {
      tradeCalcProData: { walletMap },
    },
  } = usePageTradePro();
  const { tokenMap } = useTokenMap();
  if (walletMap && walletMap[symbol]?.detail) {
    const total = getValuePrecisionThousand(
      volumeToCountAsBigNumber(
        symbol,
        sdk.toBig(walletMap[symbol].detail.total ?? 0)
      ),
      undefined,
      undefined,
      tokenMap[symbol].precision,
      false,
      { floor: true, isFait: true }
    );

    const locked = Number(walletMap[symbol].detail.locked)
      ? volumeToCount(symbol, walletMap[symbol].detail.locked)
      : 0;

    return (
      <Box display={"flex"} flexDirection={"column"} alignItems={"flex-end"}>
        <Typography variant={"body1"} color={"text.primary"}>
          {total}
        </Typography>
        {locked ? (
          <Typography
            variant={"body2"}
            color={"text.secondary"}
            display={"inline-flex"}
            marginTop={1 / 2}
          >
            <LockIcon fontSize={"small"} /> : {locked}
          </Typography>
        ) : (
          EmptyValueTag
        )}
      </Box>
    );
  } else {
    return <Box>{EmptyValueTag}</Box>;
  }
});
const UnLookView = React.memo(
  ({ t, market }: { market: MarketType; t: TFunction }) => {
    // const {pageTradePro: {tradeCalcProData}} = usePageTradePro();
    //@ts-ignore
    const [, coinA, coinB] = market.match(/(\w+)-(\w+)/i);
    const { coinJson } = useSettings();
    const tokenAIcon: any = coinJson[coinA];
    const tokenBIcon: any = coinJson[coinB];
    // const walletMap = tradeCalcProData && tradeCalcProData.walletMap ? tradeCalcProData.walletMap : {};
    const { setShowDeposit, setShowTransfer } = useOpenModals();
    const onShowDeposit = React.useCallback(
      (token?: any) => {
        setShowDeposit({ isShow: true, symbol: token });
      },
      [setShowDeposit]
    );
    // const onShowWithdraw = React.useCallback((token?: any) => {
    //     showWithdraw({isShow: true, symbol: token})
    // }, [showWithdraw])
    const onShowTransfer = React.useCallback(
      (token?: any) => {
        setShowTransfer({ isShow: true, symbol: token });
      },
      [setShowTransfer]
    );

    return (
      <Box paddingBottom={2}>
        <Typography
          height={HeaderHeight}
          lineHeight={`${HeaderHeight}px`}
          paddingX={2}
          variant={"body1"}
          component={"h4"}
        >
          {t("labelAssetsTitle")}
        </Typography>
        <Divider />
        <Box
          paddingX={2}
          display={"flex"}
          flex={1}
          flexDirection={"column"}
          justifyContent={""}
        >
          <Box
            height={44}
            marginTop={1}
            display={"flex"}
            flexDirection={"row"}
            alignItems={"center"}
            justifyContent={"space-between"}
          >
            <Box
              component={"span"}
              display={"flex"}
              flexDirection={"row"}
              alignItems={"center"}
              className={"logo-icon"}
              height={"var(--withdraw-coin-size)"}
              justifyContent={"flex-start"}
              marginRight={1 / 2}
            >
              {tokenAIcon ? (
                <AvatarCoinStyled
                  imgx={tokenAIcon.x}
                  imgy={tokenAIcon.y}
                  imgheight={tokenAIcon.height}
                  imgwidth={tokenAIcon.width}
                  size={16}
                  variant="circular"
                  style={{ marginLeft: "-8px" }}
                  alt={coinA}
                  src={
                    "data:image/svg+xml;utf8," +
                    '<svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M0 0H36V36H0V0Z"/></svg>'
                  }
                />
              ) : (
                <Avatar
                  variant="circular"
                  alt={coinA}
                  style={{
                    width: "var(--withdraw-coin-size)",
                    height: "var(--withdraw-coin-size)",
                  }}
                  src={SoursURL + "images/icon-default.png"}
                />
              )}
              <Typography variant={"body1"}>{coinA}</Typography>
            </Box>
            <AssetsValue symbol={coinA} />
          </Box>
          <Box
            height={44}
            marginTop={1}
            display={"flex"}
            flexDirection={"row"}
            alignItems={"center"}
            justifyContent={"space-between"}
          >
            <Box
              component={"span"}
              display={"flex"}
              flexDirection={"row"}
              alignItems={"center"}
              className={"logo-icon"}
              height={"var(--withdraw-coin-size)"}
              justifyContent={"flex-start"}
              marginRight={1 / 2}
            >
              {tokenBIcon ? (
                <AvatarCoinStyled
                  imgx={tokenBIcon.x}
                  imgy={tokenBIcon.y}
                  imgheight={tokenBIcon.height}
                  imgwidth={tokenBIcon.width}
                  size={16}
                  variant="circular"
                  style={{ marginLeft: "-8px" }}
                  alt={coinB}
                  src={
                    "data:image/svg+xml;utf8," +
                    '<svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M0 0H36V36H0V0Z"/></svg>'
                  }
                />
              ) : (
                <Avatar
                  variant="circular"
                  alt={coinB}
                  style={{
                    width: "var(--withdraw-coin-size)",
                    height: "var(--withdraw-coin-size)",
                  }}
                  src={SoursURL + "images/icon-default.png"}
                />
              )}
              <Typography variant={"body1"}>{coinB}</Typography>
            </Box>
            <AssetsValue symbol={coinB} />

            {/*<Typography variant={'body1'}>{walletMap[ coinB ] ? walletMap[ coinB ]?.count : 0}</Typography>*/}
          </Box>
          <Box
            display={"flex"}
            flexDirection={"row"}
            alignItems={"center"}
            marginTop={2}
            justifyContent={"center"}
          >
            <Box marginRight={1}>
              <Button
                style={{ height: 28, fontSize: "1.4rem" }}
                variant={"contained"}
                size={"small"}
                color={"primary"}
                onClick={() => onShowDeposit(coinA)}
              >
                {t("labelDeposit")}
              </Button>
            </Box>
            <Box marginLeft={1}>
              <Button
                style={{ height: 28, fontSize: "1.4rem" }}
                variant={"outlined"}
                size={"small"}
                onClick={() => onShowTransfer(coinA)}
              >
                {t("labelTransfer")}
              </Button>
            </Box>
          </Box>
        </Box>
      </Box>
    );
  }
);

export const WalletInfo = withTranslation(["common", "layout"])(
  (
    props: {
      market: MarketType;
    } & WithTranslation
  ) => {
    const { account } = useAccount();
    return (
      <>
        {account.readyState === AccountStatus.ACTIVATED ? (
          <UnLookView {...props} />
        ) : (
          <OtherView {...props} />
        )}
      </>
    );
  }
);
