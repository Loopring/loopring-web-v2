import {
  Account,
  AccountStatus,
  EmptyValueTag,
  FeeInfo,
  WalletMap,
} from "@loopring-web/common-resources";
import { useTranslation } from "react-i18next";
import { Box, Button, Typography } from "@mui/material";
import { useSettings } from "../../../stores";
import { toBig } from "@loopring-web/loopring-sdk";

export const CheckActiveStatus = ({
  walletMap,
  // isFeeNotEnough,
  onClick,
  account,
  goSend,
  goClose,
  goUpdateAccount,
  chargeFeeTokenList = [],
}: {
  account: Account;
  chargeFeeTokenList: FeeInfo[];
  goUpdateAccount: () => void;
  goClose: () => void;
  goSend: () => void;
  walletMap?: WalletMap<any, any>;
  // isFeeNotEnough: boolean;
  onClick: () => void;
}) => {
  const { t } = useTranslation("common");
  let { feeChargeOrder } = useSettings();

  const isFeeNotEnough = !(
    walletMap &&
    chargeFeeTokenList.findIndex((item) => {
      if (walletMap && walletMap[item.belong]) {
        if (
          toBig(walletMap[item.belong].count ?? 0).gt(
            toBig(item.fee.toString().replace(",", ""))
          )
        ) {
          return true;
        }
      }
      return false;
    }) !== -1
  );
  return (
    <Box
      flex={1}
      display={"flex"}
      alignItems={"center"}
      flexDirection={"column"}
      paddingBottom={4}
      width={"100%"}
    >
      <Typography
        component={"h3"}
        variant={"h3"}
        marginBottom={3}
        marginTop={-1}
      >
        {t("xxxxxxxx")}
      </Typography>
      <Box
        display={"flex"}
        flexDirection={"column"}
        justifyContent={"center"}
        flex={1}
        alignItems={"stretch"}
        alignSelf={"stretch"}
        className="modalContent"
        paddingX={10}
        paddingBottom={4}
      >
        {account.isContract ? (
          <Typography component={"p"} variant={"body1"} color={"inherit"}>
            {t("labelActivatedAccountNotSupport")}
          </Typography>
        ) : (
          <>
            {feeChargeOrder?.map((item, index) => (
              <Typography key={index + item}>
                <Typography>{item}</Typography>
                <Typography>
                  {walletMap && walletMap[item]
                    ? walletMap[item].count
                    : EmptyValueTag}
                </Typography>
              </Typography>
            ))}
          </>
        )}

        {/*<Typography*/}
        {/*  component={"p"}*/}
        {/*  variant={"body1"}*/}
        {/*  color={"textSecondary"}*/}
        {/*  marginBottom={1}*/}
        {/*>*/}
        {/*  */}
        {/*</Typography>*/}
        <Box onClick={onClick}>
          {account?.isContract ? (
            <Button size={"large"} fullWidth onClick={goClose}>
              Close
            </Button>
          ) : isFeeNotEnough ? (
            account.readyState === AccountStatus.DEPOSITING ? (
              <Box display={"flex"}>
                <Box paddingRight={2} width={"50%"}>
                  <Button size={"large"} fullWidth onClick={goSend}>
                    waiting
                  </Button>
                </Box>
                <Box width={"50%"}>
                  <Button size={"large"} fullWidth onClick={goSend}>
                    add asset
                  </Button>
                </Box>
              </Box>
            ) : (
              <Button size={"large"} fullWidth onClick={goSend}>
                Add asset
              </Button>
            )
          ) : (
            <Button size={"large"} fullWidth onClick={goUpdateAccount}>
              Active Account
            </Button>
          )}
        </Box>
      </Box>
    </Box>
  );
};
