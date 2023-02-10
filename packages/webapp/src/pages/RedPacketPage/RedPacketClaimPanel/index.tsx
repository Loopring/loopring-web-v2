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
  TabTokenTypeIndex,
} from "@loopring-web/common-resources";

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
  const [currentTab, setCurrentTab] = React.useState<TabTokenTypeIndex>(
    match?.params.item ?? TabTokenTypeIndex.ERC20
  );

  const handleTabChange = (value: TabTokenTypeIndex) => {
    switch (value) {
      case TabTokenTypeIndex.ERC20:
        history.push("/l2assets/assets/RedPacket/ERC20");
        setCurrentTab(TabTokenTypeIndex.ERC20);
        break;
      case TabTokenTypeIndex.NFT:
      default:
        history.replace("/l2assets/assets/RedPacket/NFT");
        setCurrentTab(TabTokenTypeIndex.NFT);
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
            label={t("labelRedPacketClaim" + TabTokenTypeIndex.ERC20)}
            value={TabTokenTypeIndex.ERC20}
          />
          <Tab
            label={t("labelRedPacketClaim" + TabTokenTypeIndex.NFT)}
            value={TabTokenTypeIndex.NFT}
          />
        </Tabs>
        {currentTab === TabTokenTypeIndex.ERC20 && (
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
        {currentTab === TabTokenTypeIndex.NFT && <></>}
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
