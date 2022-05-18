import {
  Account,
  EmptyValueTag,
  FeeInfo,
  WalletMap,
} from "@loopring-web/common-resources";
import { useTranslation } from "react-i18next";
import { Box, Button, Typography } from "@mui/material";
import React from "react";
export const CheckActiveStatus = ({
  walletMap,
  account,
  goSend,
  goDisconnect,
  goUpdateAccount,
  isShow,
  checkFeeIsEnough,
  isFeeNotEnough,
  // isDepositing = false,
  chargeFeeTokenList = [],
}: {
  account: Account & { isContract: boolean | undefined };
  chargeFeeTokenList: FeeInfo[];
  goUpdateAccount: () => void;
  goDisconnect: () => void;
  goSend: () => void;
  isDepositing: boolean;
  walletMap?: WalletMap<any, any>;
  isShow: boolean;
  checkFeeIsEnough: (isRequiredAPI?: boolean) => void;
  isFeeNotEnough: boolean;
  onClick: () => void;
}) => {
  const { t } = useTranslation("common");
  const [know, setKnow] = React.useState(false);
  const [knowDisable, setKnowDisable] = React.useState(true);

  const onIKnowClick = () => {
    if (account.isContract) {
      setKnow(true);
    } else if (isFeeNotEnough) {
      setKnow(true);
    } else {
      goUpdateAccount();
    }
  };
  React.useEffect(() => {
    if (isShow) {
      checkFeeIsEnough();
      setKnow(false);
    }
  }, [isShow]);

  React.useEffect(() => {
    if (
      chargeFeeTokenList !== undefined &&
      chargeFeeTokenList.length &&
      account.isContract !== undefined
    ) {
      setKnowDisable(false);
    } else {
      setKnowDisable(true);
    }
  }, [isShow, account.isContract, chargeFeeTokenList]);
  return (
    <Box
      flex={1}
      display={"flex"}
      alignItems={"center"}
      flexDirection={"column"}
      paddingBottom={4}
      width={"100%"}
    >
      {!know ? (
        <>
          <Typography
            component={"h3"}
            variant={"h3"}
            marginBottom={3}
            marginTop={-1}
          >
            {t("labelActiveAccountTitle")}
          </Typography>
          <Box
            display={"flex"}
            flexDirection={"column"}
            justifyContent={"center"}
            flex={1}
            alignItems={"stretch"}
            alignSelf={"stretch"}
            className="modalContent"
            paddingX={5 / 2}
          >
            <Typography
              variant={"body1"}
              color={"var(--color-text-third)"}
              whiteSpace={"pre-line"}
            >
              {t("labelBenefitL2")}
            </Typography>

            <Box marginTop={3}>
              <Button
                size={"large"}
                variant={"contained"}
                fullWidth
                disabled={knowDisable}
                onClick={onIKnowClick}
              >
                {t("labelIKnow")}
              </Button>
            </Box>
          </Box>
        </>
      ) : (
        <>
          <Typography
            component={"h3"}
            variant={"h3"}
            marginBottom={3}
            marginTop={-1}
          >
            {t("labelActiveAccountTitle")}
          </Typography>
          <Box
            display={"flex"}
            flexDirection={"column"}
            justifyContent={"center"}
            flex={1}
            alignItems={"stretch"}
            alignSelf={"stretch"}
            className="modalContent"
            paddingX={5 / 2}
          >
            {account.isContract ? (
              <>
                <Typography
                  component={"p"}
                  variant={"h5"}
                  color={"error"}
                  marginTop={1}
                  textAlign={"center"}
                >
                  {t("labelActivatedAccountNotSupport")}
                </Typography>
                <Typography
                  component={"p"}
                  variant={"body1"}
                  color={"textPrimary"}
                  marginTop={1}
                >
                  {t("labelActivatedAccountNotSupportDes")}
                </Typography>
                <Button
                  size={"large"}
                  fullWidth
                  onClick={goDisconnect}
                  variant={"contained"}
                >
                  {t("labelDisconnect")}
                </Button>
              </>
            ) : (
              <>
                {!!isFeeNotEnough ? (
                  <Typography
                    color={"var(--color-warning)"}
                    component={"p"}
                    variant={"body1"}
                    marginTop={1}
                  >
                    {t("labelNotBalancePayForActive")}
                  </Typography>
                ) : (
                  <Typography
                    color={"textPrimary"}
                    component={"p"}
                    variant={"body1"}
                    marginTop={1}
                  >
                    {t("labelEnoughBalancePayForActive")}
                  </Typography>
                )}
                <Typography
                  component={"p"}
                  variant={"body1"}
                  color={"var(--color-text-third)"}
                  marginTop={2}
                  marginBottom={1}
                >
                  {t("labelActivatedAccountChargeFeeList")}
                </Typography>
                {chargeFeeTokenList?.map((item, index) => (
                  <Typography
                    key={index + item.belong}
                    color={"textSecondary"}
                    display={"flex-inline"}
                    paddingY={1 / 2}
                    marginLeft={2}
                  >
                    <Typography
                      component={"span"}
                      variant={"inherit"}
                      color={"inherit"}
                      display={"inline-block"}
                      minWidth={60}
                    >
                      {item.belong + ": "}
                    </Typography>
                    <Typography component={"span"} color={"inherit"}>
                      {`fee is ${item.fee};`}
                    </Typography>
                    <Typography component={"span"} color={"inherit"}>
                      {` Your L2 asset is ${
                        walletMap && walletMap[item.belong]
                          ? walletMap[item.belong].count
                          : EmptyValueTag
                      }`}
                    </Typography>
                  </Typography>
                ))}
                {!!isFeeNotEnough && (
                  <Typography
                    color={"var(--color-text-third)"}
                    component={"p"}
                    variant={"body1"}
                    marginTop={2}
                  >
                    {t("labelHaveInProcessingL1toL2")}
                  </Typography>
                )}
                <Box marginTop={3}>
                  <Button
                    size={"large"}
                    variant={"contained"}
                    fullWidth
                    onClick={goSend}
                  >
                    {t("labelAddAssetGateBtn")}
                  </Button>
                </Box>
              </>
            )}
          </Box>
        </>
      )}
    </Box>
  );
};
