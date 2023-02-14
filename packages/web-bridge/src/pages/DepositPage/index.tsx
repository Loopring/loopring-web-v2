import { WithTranslation, withTranslation } from "react-i18next";
import React from "react";
import {
  AccountStatus,
  Exchange,
  fnType,
  LoopringIcon,
  SagaStatus,
  TradeBtnStatus,
} from "@loopring-web/common-resources";
import {
  boxLiner,
  BtnInfo,
  DepositPanel,
  DepositProps,
  SwitchPanelStyled,
  useSettings,
} from "@loopring-web/component-lib";
import {
  accountStaticCallBack,
  btnClickMap,
  useAccount,
  WalletConnectL1Btn,
} from "@loopring-web/core";
import { Box, Link, Typography } from "@mui/material";
import styled from "@emotion/styled";
import _ from "lodash";

const BoxStyle = styled(Box)`
  max-height: var(--swap-box-height);
  width: var(--modal-width);

  & > div > div {
    width: 100%;
  }

  &.mobile {
    width: calc(var(--modal-width) + 20px);
  }

  .MuiToolbar-root {
    margin-top: -24px !important;
  }

  min-height: 320px;
  ${({ theme }) => boxLiner({ theme })};

  .depositTitle {
    font-size: ${({ theme }) => theme.fontDefault.h4};
  }
` as typeof SwitchPanelStyled;
export const DepositToPage = withTranslation(["common"])(
  ({
    t,
    depositProps,
  }: { depositProps: DepositProps<any, any> } & WithTranslation) => {
    const { isMobile } = useSettings();

    const [_depositBtnI18nKey, setDepositBtnI18nKey] =
      React.useState<BtnInfo | undefined>(undefined);
    const [_depositBtnStatus, setDepositBtnStatus] = React.useState(
      TradeBtnStatus.AVAILABLE
    );
    const { account, status: accountStatus } = useAccount();
    const { onDepositClick, btnInfo, depositBtnStatus, ...restProps } =
      depositProps;
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
    const _onDepositClick = React.useCallback(
      (data: any) => {
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
      },
      [onDepositClick]
    );
    return (
      <Box
        flex={1}
        display={"flex"}
        justifyContent={"center"}
        flexDirection={"column"}
        alignItems={"center"}
      >
        <Box
          display={"flex"}
          marginBottom={5 / 2}
          width={`calc(var(--modal-width) + ${isMobile ? 20 : 0}px)`}
          justifyContent={"space-between"}
          alignItems={"center"}
        >
          <Link href={Exchange?.toString() ?? ""}>
            <LoopringIcon
              htmlColor={"var(--color-primary)"}
              style={{ height: "40px", width: "120px", marginTop: -10 }}
            />
          </Link>

          <Box
            display={"flex"}
            alignItems={"flex-end"}
            flexDirection={"column"}
            justifyContent={"center"}
          >
            {account.readyState !== AccountStatus.UN_CONNECT && (
              <Typography
                color={"var(--color-text-secondary)"}
                marginBottom={1 / 4}
              >
                {t("labelPayer")}
              </Typography>
            )}
            <Box display={"flex"} alignItems={"center"}>
              <WalletConnectL1Btn isShowOnUnConnect={false} />
            </Box>
          </Box>
        </Box>
        <BoxStyle
          display={"flex"}
          flexDirection={"column"}
          paddingY={isMobile ? 2 : undefined}
          paddingTop={5 / 2}
          className={isMobile ? "mobile" : ""}
        >
          <Box
            marginTop={-3}
            display={"flex"}
            flex={1}
            flexDirection={"column"}
          >
            <DepositPanel
              {...restProps}
              isHideDes={account.readyState === AccountStatus.UN_CONNECT}
              title={t(
                account.readyState === AccountStatus.UN_CONNECT
                  ? "labelL1toL2TitleBridgeNoConnect"
                  : "labelL1toL2TitleBridge"
              )}
              accountReady={account?.readyState as any}
              btnInfo={_depositBtnI18nKey}
              depositBtnStatus={_depositBtnStatus}
              onDepositClick={_onDepositClick}
              isNewAccount={false}
            />
          </Box>
        </BoxStyle>
      </Box>
    );
  }
);
