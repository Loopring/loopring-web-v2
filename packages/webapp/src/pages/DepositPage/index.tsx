import { WithTranslation, withTranslation } from "react-i18next";
import React from "react";
import { AccountStatus, myLog } from "@loopring-web/common-resources";
import {
  boxLiner,
  DepositPanel,
  DepositTitle,
  useSettings,
} from "@loopring-web/component-lib";
import { useAccount } from "stores/account";
import { useDeposit } from "hooks/useractions/useDeposit";
import { Box, Typography } from "@mui/material";
import { BtnConnect } from "layouts/BtnConnect";
import styled from "@emotion/styled";
import { useLocation } from "react-router-dom";
const BoxStyle = styled(Box)`
  max-height: 400px;
  width: var(--swap-box-width);
  ${({ theme }) => boxLiner({ theme })};
  .depositTitle {
    font-size: ${({ theme }) => theme.fontDefault.h4};
  }
` as typeof Box;
export const DepositToPage = withTranslation(["common"])(
  ({ t }: WithTranslation) => {
    const { search, pathname } = useLocation();
    const searchParams = new URLSearchParams(search);
    const token = searchParams.get("token");
    const owner = searchParams.get("owner");
    const { account } = useAccount();
    const { isMobile } = useSettings();
    const { depositProps } = useDeposit(true, { token, owner });

    const viewTemplate = React.useMemo(() => {
      // myLog(
      //   depositProps.toIsAddressCheckLoading,
      //   depositProps.toIsLoopringAddress,
      //   depositProps.realToAddress,
      //   depositProps.referIsAddressCheckLoading,
      //   depositProps.referIsLoopringAddress,
      //   depositProps.realReferAddress
      // );
      switch (account.readyState) {
        case AccountStatus.UN_CONNECT:
          return (
            <Box
              flex={1}
              display={"flex"}
              justifyContent={"center"}
              flexDirection={"column"}
              alignItems={"center"}
            >
              <Typography
                marginTop={3}
                marginBottom={1}
                variant={isMobile ? "h4" : "h1"}
                textAlign={"center"}
              >
                {t("describeTitleConnectToWalletAsDeposit")}
              </Typography>
              <BtnConnect />
            </Box>
          );
          break;
        case AccountStatus.LOCKED:
        case AccountStatus.NO_ACCOUNT:
        case AccountStatus.NOT_ACTIVE:
        case AccountStatus.DEPOSITING:
        case AccountStatus.ACTIVATED:
          return (
            <Box
              flex={1}
              display={"flex"}
              justifyContent={"center"}
              flexDirection={"column"}
              alignItems={"center"}
            >
              <BoxStyle display={"flex"} flexDirection={"column"}>
                <Box
                  display={"flex"}
                  padding={2}
                  alignItems={"center"}
                  justifyContent={"center"}
                >
                  <DepositTitle title={t("depositTitle")} />
                </Box>
                <DepositPanel {...depositProps} isNewAccount={false} />
              </BoxStyle>
            </Box>
          );
          break;
        case AccountStatus.ERROR_NETWORK:
          return (
            <Box
              flex={1}
              display={"flex"}
              justifyContent={"center"}
              flexDirection={"column"}
              alignItems={"center"}
            >
              <Typography
                marginY={3}
                variant={isMobile ? "h4" : "h1"}
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
    }, [account.readyState, account.connectName, isMobile, t, depositProps]);
    return <>{viewTemplate}</>;
  }
);
