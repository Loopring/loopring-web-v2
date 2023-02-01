import React from "react";
import {
  AccountStep,
  EmptyDefault,
  FormControlLabel,
  RedPacketPrepare,
  useOpenModals,
  useSettings,
} from "@loopring-web/component-lib";
import { useTranslation } from "react-i18next";
import { useHistory } from "react-router-dom";
import {
  redPacketHistory,
  StylePaper,
  useAccount,
  useOpenRedpacket,
  useSystem,
  useTokenMap,
  volumeToCountAsBigNumber,
} from "@loopring-web/core";
import { useMarketRedPacket } from "./hooks";
import { Box, Button, Checkbox, Grid } from "@mui/material";
import {
  BackIcon,
  CheckBoxIcon,
  CheckedIcon,
  getValuePrecisionThousand,
  RefreshIcon,
  ScanQRIcon,
} from "@loopring-web/common-resources";
import * as sdk from "@loopring-web/loopring-sdk";

export const RedPacketMarketPanel = ({
  setToastOpen,
}: {
  setToastOpen: (props: any) => void;
}) => {
  const container = React.useRef<HTMLDivElement>(null);
  const { setShowAccount, setShowRedPacket } = useOpenModals();
  const _redPacketHistory =
    redPacketHistory.useRedPacketHistory().redPacketHistory;
  const { t } = useTranslation();
  const { isMobile } = useSettings();
  const { chainId } = useSystem();
  const { account } = useAccount();
  const history = useHistory();
  const { callOpen } = useOpenRedpacket();
  const { tokenMap, idIndex } = useTokenMap();
  const { setShowOfficial, showOfficial, luckTokenList, handlePageChange } =
    useMarketRedPacket({
      setToastOpen,
    });
  const amountStrCallback = React.useCallback(
    (_info: sdk.LuckyTokenItemForReceive) => {
      const tokenInfo = tokenMap[idIndex[_info?.tokenId] ?? ""];

      if (tokenInfo && _info && _info.tokenAmount) {
        const symbol = tokenInfo.symbol;
        const amount = getValuePrecisionThousand(
          volumeToCountAsBigNumber(
            symbol,
            _info.tokenAmount.totalAmount as any
          ),
          tokenInfo.precision,
          tokenInfo.precision,
          undefined,
          false,
          {
            floor: false,
            // isTrade: true,
          }
        );
        return amount + " " + symbol;
      }
      return "";

      // tokenMap[]
    },
    [tokenMap]
  );
  // const callOpen = () => {};
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
      >
        <Grid
          container
          spacing={1}
          justifyContent={"flex-end"}
          marginY={1}
          paddingX={2}
        >
          <Grid item>
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
          </Grid>
          <Grid item>
            <FormControlLabel
              style={{ marginRight: 0, paddingRight: 0 }}
              control={
                <Checkbox
                  checked={showOfficial}
                  checkedIcon={<CheckedIcon />}
                  icon={<CheckBoxIcon />}
                  color="default"
                  onChange={(event) => {
                    setShowOfficial(event.target.checked);
                  }}
                />
              }
              label={t("labelNotActive")}
            />
          </Grid>
        </Grid>
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
          <Grid container display={"flex"} paddingX={1}>
            {luckTokenList.officialList?.length ? (
              luckTokenList.officialList.map((item, index) => {
                const token = tokenMap[idIndex[item?.tokenId] ?? ""];
                return (
                  <Grid
                    item
                    xs={6}
                    md={4}
                    lg={3}
                    key={index}
                    position={"relative"}
                    marginY={1}
                  >
                    <RedPacketPrepare
                      {...{ ...item }}
                      redPacketHashItems={
                        _redPacketHistory[chainId]
                          ? _redPacketHistory[chainId][account.accAddress]
                          : undefined
                      }
                      setShowRedPacket={setShowRedPacket} //
                      chainId={chainId as any}
                      account={account}
                      amountStr={amountStrCallback(item)}
                      onOpen={callOpen}
                      tokenInfo={token}
                      _type="official"
                    />
                  </Grid>
                );
              })
            ) : (
              <></>
            )}
            {!!luckTokenList.publicList?.length &&
              luckTokenList.publicList.map((item, index) => {
                const token = tokenMap[idIndex[item?.tokenId] ?? ""];
                return (
                  <Grid
                    xs={6}
                    md={4}
                    lg={3}
                    item
                    key={index}
                    position={"relative"}
                    marginY={1}
                  >
                    <RedPacketPrepare
                      {...{ ...item }}
                      redPacketHashItems={
                        _redPacketHistory[chainId]
                          ? _redPacketHistory[chainId][account.accAddress]
                          : undefined
                      }
                      setShowRedPacket={setShowRedPacket} //
                      chainId={chainId as any}
                      account={account}
                      amountStr={amountStrCallback(item)}
                      onOpen={callOpen}
                      tokenInfo={token}
                    />
                  </Grid>
                );
              })}
          </Grid>
        )}
      </StylePaper>
    </Box>
  );
};
