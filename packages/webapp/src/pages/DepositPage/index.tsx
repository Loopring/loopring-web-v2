import { WithTranslation, withTranslation } from "react-i18next";
import React from "react";
import {
  AccountStatus,
  fnType,
  IBData,
  myLog,
  SagaStatus,
} from "@loopring-web/common-resources";
import {
  boxLiner,
  BtnInfo,
  DepositPanel,
  DepositTitle,
  SwapTradeData,
  TradeBtnStatus,
} from "@loopring-web/component-lib";
import { useAccount } from "stores/account";
import { useDeposit } from "hooks/useractions/useDeposit";
import { Box } from "@mui/material";
import styled from "@emotion/styled";
import { useLocation } from "react-router-dom";
import {
  accountStaticCallBack,
  btnClickMap,
  btnLabel,
} from "../../layouts/connectStatusCallback";
import * as _ from "lodash";
import { activateAccount } from "../../services/account/activateAccount";
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
    const { search } = useLocation();
    const searchParams = new URLSearchParams(search);
    const token = searchParams.get("token");
    const owner = searchParams.get("owner");
    const [_depositBtnI18nKey, setDepositBtnI18nKey] =
      React.useState<BtnInfo | undefined>(undefined);
    const [_depositBtnStatus, setDepositBtnStatus] = React.useState(
      TradeBtnStatus.AVAILABLE
    );
    const { account, status: accountStatus } = useAccount();
    const {
      depositProps: {
        onDepositClick,
        btnInfo,
        depositBtnStatus,
        ...depositProps
      },
    } = useDeposit(true, { token, owner });
    const depositBtnCallback = () => {
      setDepositBtnStatus(depositBtnStatus as TradeBtnStatus);
      return btnInfo;
    };
    React.useEffect(() => {
      if (accountStatus === SagaStatus.UNSET) {
        setDepositBtnI18nKey(
          accountStaticCallBack({
            [fnType.ACTIVATED]: [depositBtnCallback],
            [fnType.LOCKED]: [depositBtnCallback],
            [fnType.NO_ACCOUNT]: [depositBtnCallback],
            [fnType.NOT_ACTIVE]: [depositBtnCallback],
            [fnType.DEPOSITING]: [depositBtnCallback],
            [fnType.UN_CONNECT]: [
              function () {
                setDepositBtnStatus(TradeBtnStatus.AVAILABLE);
                return { label: `labelConnectWallet` };
              },
            ],
            [fnType.ERROR_NETWORK]: [
              function () {
                setDepositBtnStatus(TradeBtnStatus.DISABLED);
                return { label: `labelWrongNetwork` };
              },
            ],
          } as any)
        );
      }
    }, [accountStatus, btnInfo, depositBtnStatus]);
    const _onDepositClick = React.useCallback((data: any) => {
      accountStaticCallBack(
        Object.assign(_.cloneDeep(btnClickMap), {
          [fnType.ACTIVATED]: [onDepositClick],
          [fnType.LOCKED]: [onDepositClick],
          [fnType.NO_ACCOUNT]: [onDepositClick],
          [fnType.NOT_ACTIVE]: [onDepositClick],
          [fnType.DEPOSITING]: [onDepositClick],
        }),
        [data]
      );
    }, []);
    return (
      <>
        {
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
              <DepositPanel
                {...depositProps}
                btnInfo={_depositBtnI18nKey}
                depositBtnStatus={_depositBtnStatus}
                onDepositClick={_onDepositClick}
                isNewAccount={false}
              />
            </BoxStyle>
          </Box>
        }
      </>
    );
  }
);
