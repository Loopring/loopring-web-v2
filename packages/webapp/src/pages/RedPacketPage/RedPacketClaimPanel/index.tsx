import React from "react";
import {
  StylePaper,
  useSystem,
  useToast,
  useWalletLayer2,
} from "@loopring-web/core";
import {
  EmptyDefault,
  RedPacketClaimTable,
  RedPacketReceiveTable,
  RedPacketRecordTable,
  Toast,
  TransactionTradeViews,
  useSettings,
} from "@loopring-web/component-lib";
import { Trans, useTranslation } from "react-i18next";
import { useHistory, useRouteMatch } from "react-router-dom";
import { useClaimRedPacket } from "./hooks";
import { Box, Button, Tab, Tabs } from "@mui/material";
import {
  RedPacketIcon,
  SagaStatus,
  TOAST_TIME,
} from "@loopring-web/common-resources";

enum TabIndex {
  ERC20 = "ERC20",
  NFT = "NFT",
}

export const RedPacketClaimPanel = () => {
  const container = React.useRef<HTMLDivElement>(null);
  const { etherscanBaseUrl, forexMap } = useSystem();
  const { toastOpen, setToastOpen, closeToast } = useToast();
  const { status: walletLayer2Status } = useWalletLayer2();
  const { t } = useTranslation();
  const { isMobile } = useSettings();
  const history = useHistory();
  const { redPacketClaimList, showLoading, getClaimRedPacket, onItemClick } =
    useClaimRedPacket(setToastOpen);
  let match: any = useRouteMatch("/l2assets/assets/RedPacket/:item");

  React.useEffect(() => {
    if (getClaimRedPacket && walletLayer2Status === SagaStatus.UNSET) {
      getClaimRedPacket();
    }
  }, [walletLayer2Status]);
  const [currentTab, setCurrentTab] = React.useState<TabIndex>(
    match?.params.item ?? TabIndex.ERC20
  );

  const handleTabChange = (value: TabIndex) => {
    switch (value) {
      case TabIndex.ERC20:
        history.push("/l2assets/assets/RedPacket/ERC20");
        setCurrentTab(TabIndex.ERC20);
        break;
      case TabIndex.NFT:
      default:
        history.replace("/l2assets/assets/RedPacket/NFT");
        setCurrentTab(TabIndex.NFT);
        break;
    }
  };
  return (
    <Box
      flex={1}
      display={"flex"}
      flexDirection={"column"}
      sx={isMobile ? { maxWidth: "calc(100vw - 32px)" } : {}}
      paddingTop={2}
      position={"relative"}
    >
      <Box
        position={"absolute"}
        display={"flex"}
        alignItems={"center"}
        sx={{
          right: 0,
          top: -42,
          zIndex: 99,
        }}
      >
        <Button
          variant={"text"}
          target="_self"
          rel="noopener noreferrer"
          href={`./#/l2assets/history/transactions?types=${TransactionTradeViews.redPacket}`}
        >
          {t("labelTransactionsLink")}
        </Button>
        <Button
          startIcon={<RedPacketIcon fontSize={"small"} />}
          variant={"contained"}
          size={"small"}
          // sx={{ color: "var(--color-text-secondary)" }}
          color={"primary"}
          onClick={() => history.push("/redPacket/markets")}
        >
          {t("labelRedPacketMarketsBtn")}
        </Button>
      </Box>
      <StylePaper
        ref={container}
        flex={1}
        display={"flex"}
        flexDirection={"column"}
      >
        <Tabs
          value={currentTab}
          onChange={(_event, value) => handleTabChange(value)}
          aria-label="l2-history-tabs"
          variant="scrollable"
        >
          <Tab
            label={t("labelRedPacketClaim" + TabIndex.ERC20)}
            value={TabIndex.ERC20}
          />
          <Tab
            label={t("labelRedPacketClaim" + TabIndex.NFT)}
            value={TabIndex.NFT}
          />
        </Tabs>
        {currentTab === TabIndex.ERC20 && (
          <>
            {!!redPacketClaimList.length ? (
              <Box className="tableWrapper table-divide-short">
                <RedPacketClaimTable
                  {...{
                    rawData: redPacketClaimList,
                    showloading: showLoading,
                    forexMap,
                    onItemClick,
                    etherscanBaseUrl,
                    getClaimRedPacket,
                  }}
                />
              </Box>
            ) : (
              <Box flex={1} height={"100%"} width={"100%"}>
                <EmptyDefault
                  height={"calc(100% - 35px)"}
                  message={() => {
                    return (
                      <Trans i18nKey="labelNoContent">Content is Empty</Trans>
                    );
                  }}
                />
              </Box>
            )}
          </>
        )}
        {currentTab === TabIndex.NFT && <></>}
      </StylePaper>
      <Toast
        alertText={toastOpen?.content ?? ""}
        severity={toastOpen?.type ?? "success"}
        open={toastOpen?.open ?? false}
        autoHideDuration={TOAST_TIME}
        onClose={closeToast}
      />
    </Box>
  );
};
