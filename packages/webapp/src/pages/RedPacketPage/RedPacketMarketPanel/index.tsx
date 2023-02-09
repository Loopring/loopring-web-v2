import React from "react";
import {
  AccountStep,
  EmptyDefault,
  FormControlLabel,
  RedPacketPrepare,
  RedPacketViewStep,
  TablePagination,
  useOpenModals,
  useSettings,
} from "@loopring-web/component-lib";
import { useTranslation } from "react-i18next";
import { useHistory, useRouteMatch } from "react-router-dom";
import { makeViewCard, StylePaper, useOpenRedpacket } from "@loopring-web/core";
import { useMarketRedPacket } from "./hooks";
import { Box, Button, Checkbox, Grid, Tab, Tabs } from "@mui/material";
import * as sdk from "@loopring-web/loopring-sdk";

import {
  BackIcon,
  CheckBoxIcon,
  CheckedIcon,
  RefreshIcon,
  ScanQRIcon,
  SoursURL,
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

enum TabIndex {
  ERC20 = "ERC20",
  NFT = "NFT",
}
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
  const { callOpen } = useOpenRedpacket();
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
  let match: any = useRouteMatch("/redPacket/markets/:item");

  const [currentTab, setCurrentTab] = React.useState<TabIndex>(
    match?.params.item ?? TabIndex.ERC20
  );

  const handleTabChange = (value: TabIndex) => {
    switch (value) {
      case TabIndex.ERC20:
        history.push("/redPacket/markets/ERC20");
        setCurrentTab(TabIndex.ERC20);
        break;
      case TabIndex.NFT:
      default:
        history.replace("/redPacket/markets/NFT");
        setCurrentTab(TabIndex.NFT);
        break;
    }
  };
  const listMemo = React.useCallback(
    (list: sdk.LuckyTokenItemForReceive[] | undefined) => {
      return (
        <>
          {list?.length ? (
            list.map((item, index) => {
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
                    _type="official"
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
    },
    [hideOpen]
  );
  const listERC20 = React.useMemo(() => {
    return (
      <>
        {listMemo(luckTokenList.officialList)}
        {listMemo(luckTokenList.publicList)}
      </>
    );
  }, [hideOpen, luckTokenList.officialList, luckTokenList.publicList]);
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
            variant={"outlined"}
            size={"medium"}
            color={"inherit"}
            sx={{ marginLeft: 1 }}
            onClick={() => history.push("/redPacket/create")}
          >
            {t("labelCreateRedPacket")}
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
            variant={"contained"}
            size={"small"}
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
              label={t("labelRedPacketMarket" + TabIndex.ERC20)}
              value={TabIndex.ERC20}
            />
            <Tab
              label={t("labelRedPacketMarket" + TabIndex.NFT)}
              value={TabIndex.NFT}
            />
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
                  handlePageChange({ page: 0 });
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

        {currentTab === TabIndex.ERC20 && (
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
        )}
        {currentTab === TabIndex.NFT && <></>}
      </StylePaper>
    </Box>
  );
};
