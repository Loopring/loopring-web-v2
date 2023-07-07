import React from "react";
import {
  AccountStep,
  EmptyDefault,
  FormControlLabel,
  RedPacketBlindBoxDetail,
  RedPacketPrepare,
  RedPacketViewStep,
  TablePagination,
  useOpenModals,
  useSettings,
} from "@loopring-web/component-lib";
import { useTranslation } from "react-i18next";
import { useHistory, useRouteMatch } from "react-router-dom";
import {
  getIPFSString,
  makeViewCard,
  StylePaper,
  useOpenRedpacket,
  useSystem,
  redPacketHistory as redPacketHistoryStore,
} from "@loopring-web/core";
import { useMarketRedPacket } from "./hooks";
import { Box, Button, Checkbox, Grid, Tab, Tabs, Typography } from "@mui/material";
import * as sdk from "@loopring-web/loopring-sdk";

import {
  BackIcon,
  CheckBoxIcon,
  CheckedIcon,
  RefreshIcon,
  ScanQRIcon,
  SoursURL,
  TabTokenTypeIndex,
} from "@loopring-web/common-resources";
import styled from "@emotion/styled";

const LoadingStyled = styled(Box)`
  position: fixed;
  z-index: 21;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: var(--field-opacity);
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  width: 100%;
`;

export const RedPacketMarketPanel = ({
  setToastOpen,
}: {
  setToastOpen: (props: any) => void;
}) => {
  const container = React.useRef<HTMLDivElement>(null);
  const {
    setShowAccount,
    setShowRedPacket,
    modals: { isShowRedPacket },
  } = useOpenModals();
  const { t } = useTranslation();
  const { isMobile } = useSettings();
  const history = useHistory();
  const { baseURL } = useSystem();
  const { redPacketHistory } = redPacketHistoryStore.useRedPacketHistory();
  const { callOpen } = useOpenRedpacket();
  let match: any = useRouteMatch("/redPacket/markets/:item");
  const {
    showLoading,
    hideOpen,
    setHideOpen,
    luckTokenList,
    pagination,
    handlePageChange,
  } = useMarketRedPacket({
    setToastOpen,
  });

  const [currentTab, setCurrentTab] = React.useState<TabTokenTypeIndex>(
    match?.params.item ?? TabTokenTypeIndex.ERC20
  );

  const handleTabChange = (value: TabTokenTypeIndex) => {
    switch (value) {
      case TabTokenTypeIndex.ERC20:
        history.push("/redPacket/markets/ERC20");
        setCurrentTab(TabTokenTypeIndex.ERC20);
        break;
      case TabTokenTypeIndex.NFT:
      default:
        history.replace("/redPacket/markets/NFT");
        setCurrentTab(TabTokenTypeIndex.NFT);
        break;
    }
  };
  const listMemo = (list: sdk.LuckyTokenItemForReceive[] | undefined) => {
    return (
      <>
        {list?.length ? (
          list.map((item, index) => {
            // item.isOfficial
            if (
              isShowRedPacket.step === RedPacketViewStep.TimeOutPanel &&
              isShowRedPacket.info &&
              isShowRedPacket.info.hash === item.hash &&
              // @ts-ignore
              isShowRedPacket.info.id == item.id
            ) {
              item = {
                ...item,
                ...isShowRedPacket.info,
              };
            }
            const {
              chainId,
              account,
              amountStr,
              myAmountStr,
              tokenInfo,
              claim,
              claimed
            } = makeViewCard(item);

            return !(hideOpen && claim) ? (
              <Grid
                item
                xs={6}
                md={4}
                lg={3}
                key={index + item.hash}
                position={"relative"}
                marginY={1}
              >
                <RedPacketPrepare
                  {...{ ...item }}
                  claim={claim}
                  setShowRedPacket={setShowRedPacket} //
                  chainId={chainId as any}
                  account={account}
                  amountStr={amountStr}
                  myAmountStr={myAmountStr}
                  onOpen={callOpen}
                  tokenInfo={tokenInfo}
                  getIPFSString={getIPFSString}
                  baseURL={baseURL}
                  _type={
                    item.type.mode === sdk.LuckyTokenClaimType.BLIND_BOX 
                      ? "blindbox" 
                      : (item as any)?.isOfficial ? "official" : "default"
                  }
                  claimed={claimed}
                />
              </Grid>
            ) : (
              <></>
            );
          })
        ) : (
          <></>
        )}
      </>
    );
  };
  const listERC20 = React.useMemo(() => {
    return (
      <>
        {listMemo(
          luckTokenList.officialList.map((x) => ({
            ...x,
            isOfficial: true,
            info: { ...x.info },
          }))
        )}
        {listMemo(
          luckTokenList.publicList.map((x) => ({ ...x, isOfficial: false }))
        )}
      </>
    );
  }, [
    hideOpen,
    redPacketHistory,
    luckTokenList.officialList,
    luckTokenList.publicList,
  ]);
  return (
    <Box
      flex={1}
      display={"flex"}
      flexDirection={"column"}
      sx={isMobile ? { maxWidth: "calc(100vw - 32px)" } : {}}
    >
      <Box
        display={"flex"}
        justifyContent={"space-between"}
        alignItems={"center"}
        marginBottom={2}
      >
        <Button
          startIcon={<BackIcon fontSize={"small"} />}
          variant={"text"}
          size={"medium"}
          sx={{ color: "var(--color-text-secondary)" }}
          color={"inherit"}
          onClick={() => history.push("/l2assets/assets/RedPacket")}
        >
          {t("labelRedPacketMarkets")}
        </Button>
        <Box display={"flex"} alignItems={"center"} justifyContent={"flex-end"}>
          <Button
            variant={"contained"}
            size={"small"}
            sx={{ marginLeft: 1 }}
            onClick={() => history.push("/redPacket/create")}
          >
            <Typography variant={"body1"}>{t("labelCreateRedPacket")}</Typography>
          </Button>
          <Button
            variant={"outlined"}
            size={"medium"}
            color={"inherit"}
            sx={{ marginLeft: 1 }}
            onClick={() => history.push("/redPacket/records")}
          >
            {t("labelMyRedPacket")}
          </Button>
          <Button
            startIcon={<ScanQRIcon fontSize={"small"} />}
            variant={"outlined"}
            size={"medium"}
            color={"inherit"}
            sx={{ marginLeft: 1 }}
            onClick={() => {
              setShowAccount({ isShow: true, step: AccountStep.QRCodeScanner });
            }}
          >
            {t("labelRedPacketQRCodeImport")}
          </Button>
        </Box>
      </Box>
      <StylePaper
        ref={container}
        flex={1}
        display={"flex"}
        flexDirection={"column"}
        paddingBottom={2}
        position={"relative"}
      >
        <Box
          display={"flex"}
          flexDirection={"row"}
          justifyContent={"space-between"}
          marginBottom={1}
        >
          <Tabs
            value={currentTab}
            onChange={(_event, value) => handleTabChange(value)}
            aria-label="l2-history-tabs"
            variant="scrollable"
          >
            <Tab
              label={t("labelRedPacketMarket" + TabTokenTypeIndex.ERC20)}
              value={TabTokenTypeIndex.ERC20}
            />
            {/*<Tab*/}
            {/*  label={t("labelRedPacketMarket" + TabTokenTypeIndex.NFT)}*/}
            {/*  value={TabTokenTypeIndex.NFT}*/}
            {/*/>*/}
          </Tabs>
          <Box
            justifyContent={"flex-end"}
            marginY={1}
            paddingX={2}
            display={"flex"}
          >
            <Box>
              <Button
                startIcon={<RefreshIcon fontSize={"small"} />}
                variant={"outlined"}
                size={"medium"}
                color={"primary"}
                onClick={() => {
                  handlePageChange({ page: 1 });
                }}
              >
                {t("labelRefreshRedPacket")}
              </Button>
            </Box>
            <Box marginLeft={1}>
              <FormControlLabel
                style={{ marginRight: 0, paddingRight: 0 }}
                control={
                  <Checkbox
                    checked={hideOpen}
                    checkedIcon={<CheckedIcon />}
                    icon={<CheckBoxIcon />}
                    color="default"
                    onChange={(event) => {
                      setHideOpen(event.target.checked);
                    }}
                  />
                }
                label={t("labelRedpacketNotActive")}
              />
            </Box>
          </Box>
        </Box>
        <>
          {!luckTokenList.officialList?.length &&
          !luckTokenList.publicList?.length ? (
            <Box
              flex={1}
              display={"flex"}
              alignItems={"center"}
              height={"100%"}
              justifyContent={"center"}
            >
              <EmptyDefault
                // width={"100%"}
                height={"100%"}
                message={() => (
                  <Box
                    flex={1}
                    display={"flex"}
                    alignItems={"center"}
                    justifyContent={"center"}
                  >
                    {t("labelNoContent")}
                  </Box>
                )}
              />
            </Box>
          ) : (
            <Grid container display={"flex"} paddingX={1} spacing={2}>
              {listERC20}
            </Grid>
          )}
          {showLoading && (
            <LoadingStyled color={"inherit"}>
              <img
                className="loading-gif"
                alt={"loading"}
                width="36"
                src={`${SoursURL}images/loading-line.gif`}
              />
            </LoadingStyled>
          )}
          <Box>
            <TablePagination
              page={pagination.page}
              pageSize={pagination.pageSize}
              total={luckTokenList.publicTotal}
              onPageChange={(page) => {
                handlePageChange({ page });
              }}
            />
          </Box>
        </>
      </StylePaper>
    </Box>
  );
};
