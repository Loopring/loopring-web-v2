import React from "react";
import {
  LoopringAPI,
  StylePaper,
  useAccount,
  useSystem,
  useToast,
  useWalletLayer2,
} from "@loopring-web/core";
import {
  RedPacketClaimTable,
  Toast,
  ToastType,
  TransactionTradeViews,
  useSettings,
} from "@loopring-web/component-lib";
import { useTranslation } from "react-i18next";
import { useHistory, useRouteMatch } from "react-router-dom";
import { useClaimNFTRedPacket, useClaimRedPacket } from "./hooks";
import {
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Typography,
} from "@mui/material";
import {
  CloseIcon,
  RedPacketIcon,
  RowConfig,
  SagaStatus,
  TOAST_TIME,
} from "@loopring-web/common-resources";

export const RedPacketClaimPanel = ({
  hideAssets,
}: {
  hideAssets?: boolean;
}) => {
  const container = React.useRef<HTMLDivElement>(null);
  const { etherscanBaseUrl, forexMap } = useSystem();
  const { toastOpen, setToastOpen, closeToast } = useToast();
  const { status: walletLayer2Status } = useWalletLayer2();
  const { t } = useTranslation();
  const { isMobile } = useSettings();
  const history = useHistory();

  const {
    redPacketClaimList,
    showNFTsPanel,
    showLoading,
    getClaimRedPacket,
    onItemClick,
    onViewMoreNFTsClick,
    onCloseNFts,
  } = useClaimRedPacket(setToastOpen);
  const {
    page,
    onItemClick: onItemNFTClick,
    redPacketNFTClaimList,
    showLoading: showNFTLoading,
    getClaimNFTRedPacket,
    redPacketNFTClaimTotal,
  } = useClaimNFTRedPacket({ setToastOpen });
  let match: any = useRouteMatch("/l2assets/assets/RedPacket/:item");

  React.useEffect(() => {
    if (getClaimRedPacket && walletLayer2Status === SagaStatus.UNSET) {
      getClaimRedPacket();
    }
  }, [walletLayer2Status]);
  //TODO:
  const [pageSize, setPageSize] = React.useState(500);

  React.useEffect(() => {
    let height = container?.current?.offsetHeight;
    if (height) {
      const pageSize = Math.floor(height / RowConfig.rowHeight) - 3;
      setPageSize(pageSize);
    }
  }, [container?.current?.offsetHeight]);
  const { account } = useAccount();
  const [totalLuckyTokenNFTBalance, setTotalLuckyTokenNFTBalance] =
    React.useState(undefined as number | undefined);
  React.useEffect(() => {
    (async () => {
      const response: any = await LoopringAPI.luckTokenAPI?.getLuckTokenUnclaimNFTBlindboxCnt({
        accountId: account.accountId,
      }, account.apiKey)
      setTotalLuckyTokenNFTBalance(response.count)
    })()
  }, []);
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
        <Box className="tableWrapper table-divide-short">
          <RedPacketClaimTable
            {...{
              rawData: redPacketClaimList,
              showloading: showLoading,
              forexMap,
              onItemClick,
              etherscanBaseUrl,
              getClaimRedPacket,
              onViewMoreNFTsClick,
              hideAssets,
            }}
            totalLuckyTokenNFTBalance={totalLuckyTokenNFTBalance}
          />
        </Box>
        <Dialog
          maxWidth={"lg"}
          open={showNFTsPanel}
          onClose={() => {
            onCloseNFts();
          }}
        >
          <DialogTitle>
            <Typography variant={"h3"} textAlign={"center"}>
              {t("labelBlindBoxRecievedRedPackets")}
            </Typography>
            <IconButton
              size={"medium"}
              sx={{
                position: "absolute",
                right: 8,
                top: 8,
              }}
              color={"inherit"}
              onClick={() => {
                onCloseNFts();
              }}
            >
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent style={{ width: "960px" }}>
            <RedPacketClaimTable
              isNFT
              rawData={redPacketNFTClaimList}
              showloading={showNFTLoading}
              forexMap={forexMap}
              onItemClick={onItemNFTClick}
              etherscanBaseUrl={etherscanBaseUrl}
              getClaimRedPacket={getClaimNFTRedPacket}
            />
          </DialogContent>
        </Dialog>
      </StylePaper>
      <Toast
        alertText={toastOpen?.content ?? ""}
        severity={toastOpen?.type ?? ToastType.success}
        open={toastOpen?.open ?? false}
        autoHideDuration={TOAST_TIME}
        onClose={closeToast}
      />
    </Box>
  );
};
