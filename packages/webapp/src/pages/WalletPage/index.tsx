import { WithTranslation, withTranslation } from "react-i18next";
import React from "react";
import {
  AccountStatus,
  i18n,
  myLog,
  SagaStatus,
  subMenuGuardian,
} from "@loopring-web/common-resources";
import { Box, Link, Typography } from "@mui/material";
import {
  Button,
  GuardianStep,
  ModalQRCode,
  setShowConnect,
  SubMenu,
  SubMenuList,
  WalletConnectStep,
} from "@loopring-web/component-lib";
import { changeShowModel, useAccount } from "../../stores/account";
import _ from "lodash";
import {
  accountStaticCallBack,
  btnLabel,
} from "../../layouts/connectStatusCallback";
import store from "../../stores";

import { useHistory, useRouteMatch } from "react-router-dom";
import { useHebaoMain } from "./hook";
import { StylePaper } from "pages/styled";
import { ModalLock } from "./modal";
import { WalletHistory } from "./WalletHistory";
import { WalletValidationInfo } from "./WalletValidationInfo";
import { WalletProtector } from "./WalletProtector";

const BtnConnect = withTranslation(["common", "layout"], { withRef: true })(
  ({ t }: any) => {
    const { status: accountStatus, account } = useAccount();
    const [label, setLabel] = React.useState(undefined);
    const _btnLabel = Object.assign(_.cloneDeep(btnLabel));

    React.useEffect(() => {
      if (accountStatus === SagaStatus.UNSET) {
        setLabel(accountStaticCallBack(_btnLabel));
      }
    }, [accountStatus, account.readyState, i18n.language]);

    return (
      <Button
        variant={"contained"}
        size={"large"}
        color={"primary"}
        fullWidth={true}
        style={{ maxWidth: "280px" }}
        onClick={() => {
          myLog("UN_CONNECT!");
          store.dispatch(changeShowModel({ _userOnModel: true }));
          store.dispatch(
            setShowConnect({ isShow: true, step: WalletConnectStep.Provider })
          );
        }}
      >
        {t(label)}
      </Button>
    );
  }
) as typeof Button;
export const GuardianPage = withTranslation(["common"])(
  ({ t, ...rest }: WithTranslation) => {
    const { account } = useAccount();
    let match = useRouteMatch("/guardian/:item");
    const [openQRCode, setOpenQRCode] = React.useState(false);
    const onOpenAdd = React.useCallback(() => {
      setOpenQRCode(true);
    }, []);
    const description = () => (
      <Typography
        marginTop={2}
        component={"div"}
        textAlign={"center"}
        variant={"body2"}
      >
        <Typography
          color={"var(--color-text-secondary)"}
          component={"p"}
          variant={"inherit"}
        >
          {account?.accAddress}
        </Typography>
      </Typography>
    );
    const history = useHistory();
    // @ts-ignore
    const selected = match?.params?.item ?? "myProtected";
    const {
      protectList,
      guardiansList,
      guardianConfig,
      openHebao,
      operationLogList,
      setOpenHebao,
      loadData,
      isContractAddress,
    } = useHebaoMain();
    const handleOpenModal = ({
      step,
      options,
    }: {
      step: GuardianStep;
      options?: any;
    }) => {
      setOpenHebao((state) => {
        state.isShow = true;
        state.step = step;
        state.options = {
          ...state.options,
          ...options,
        };
        return { ...state };
      });
    };
    const guardianRouter = () => {
      switch (selected) {
        case "guardian-validation-info":
          return !isContractAddress ? (
            <WalletValidationInfo
              onOpenAdd={onOpenAdd}
              {...{ guardiansList, guardianConfig, setOpenHebao }}
              handleOpenModal={handleOpenModal}
              loadData={loadData}
            />
          ) : (
            <Box
              flex={1}
              display={"flex"}
              justifyContent={"center"}
              flexDirection={"column"}
              alignItems={"center"}
            >
              <Typography marginY={3} variant={"h1"} textAlign={"center"}>
                {t("labelWalletToWallet")}
              </Typography>
              <BtnConnect />
            </Box>
          );
        case "guardian-history":
          return (
            <WalletHistory
              operationLogList={operationLogList}
              guardianConfig={guardianConfig}
            />
          );
        case "guardian-protected":
        default:
          return !isContractAddress ? (
            <WalletProtector
              onOpenAdd={onOpenAdd}
              protectList={protectList}
              guardianConfig={guardianConfig}
              loadData={loadData}
              // isContractAddress={isContractAddress}
              handleOpenModal={handleOpenModal}
            />
          ) : (
            <Box
              flex={1}
              display={"flex"}
              justifyContent={"center"}
              flexDirection={"column"}
              alignItems={"center"}
            >
              <Typography marginY={3} variant={"h1"} textAlign={"center"}>
                {t("describeTitleConnectToWallet")}
              </Typography>
              <BtnConnect />
            </Box>
          );
      }
    };
    const viewTemplate = React.useMemo(() => {
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
              <Typography marginTop={3} variant={"h1"} textAlign={"center"}>
                {t("describeTitleConnectToWalletAsGuardian")}
              </Typography>

              <Link
                marginY={2}
                variant={"body1"}
                textAlign={"center"}
                color={"textSecondary"}
                onClick={() =>
                  window.open("./#/document/walletdesign_en.md", "_blank")
                }
              >
                {t("describeWhatIsGuardian")}
              </Link>
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
            <>
              <Box
                width={"200px"}
                display={"flex"}
                justifyContent={"stretch"}
                marginRight={3}
                marginBottom={2}
                className={"MuiPaper-elevation2"}
              >
                <SubMenu>
                  <SubMenuList
                    selected={selected}
                    subMenu={subMenuGuardian as any}
                  />
                </SubMenu>
              </Box>
              <StylePaper
                minHeight={420}
                display={"flex"}
                alignItems={"stretch"}
                flexDirection={"column"}
                marginTop={0}
                flex={1}
                marginBottom={2}
                className={"MuiPaper-elevation2"}
              >
                {guardianRouter()}
              </StylePaper>
            </>
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
              <Typography marginY={3} variant={"h1"} textAlign={"center"}>
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
    }, [account.readyState, selected, protectList]);

    return (
      <>
        <ModalQRCode
          open={openQRCode}
          className={"guardianPop"}
          onClose={() => setOpenQRCode(false)}
          title={
            <Typography component={"p"} textAlign={"center"} marginBottom={1}>
              <Typography
                color={"var(--color-text-primary)"}
                component={"p"}
                variant={"h4"}
                marginBottom={2}
              >
                {t("labelWalletAddAsGuardian")}
              </Typography>
              <Typography
                color={"var(--color-text-secondary)"}
                component={"p"}
                variant={"body1"}
                marginBottom={2}
              >
                {t("labelWalletScanQRCode")}
              </Typography>
            </Typography>
          }
          size={260}
          description={description()}
          url={`ethereum:${account?.accAddress}?type=${account?.connectName}&action=HebaoAddGuardian`}
        />
        <ModalLock
          options={openHebao.options ?? {}}
          {...{
            open: openHebao.isShow,
            step: openHebao.step,
            handleOpenModal,
            onClose: () => {
              setOpenHebao({
                isShow: false,
                step: GuardianStep.LockAccount_WaitForAuth,
              });
            },
          }}
        />
        <>{viewTemplate}</>
      </>
    );
  }
);
