import { WithTranslation, withTranslation } from "react-i18next";
import React from "react";
import {
  AccountStatus,
  i18n,
  myLog,
  SagaStatus,
  subMenuHebao,
} from "@loopring-web/common-resources";
import { Box, Typography } from "@mui/material";
import {
  Button,
  HebaoStep,
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
import { HebaoProtector } from "./HebaoProtector";

import { useRouteMatch } from "react-router-dom";
import { HebaoValidationInfo } from "./HebaoValidationInfo";
import { useHebaoMain } from "./hook";
import { StylePaper } from "pages/styled";
import { ModalLock } from "./modal";
import { HebaoHistory } from "./HebaoHistory";

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
export const HebaoPage = withTranslation(["common"])(
  ({ t, ...rest }: WithTranslation) => {
    const { account } = useAccount();
    let match = useRouteMatch("/hebao/:item");
    let options;
    // @ts-ignore
    const selected = match?.params?.item ?? "myProtected";
    const {
      protectList,
      guardiansList,
      hebaoConfig,
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
      step: HebaoStep;
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
    const hebaoRouter = () => {
      switch (selected) {
        case "hebao-validation-info":
          return (
            <HebaoValidationInfo
              {...{ guardiansList, hebaoConfig, setOpenHebao }}
              handleOpenModal={handleOpenModal}
              loadData={loadData}
            />
          );
        case "hebao-history":
          return (
            <HebaoHistory
              operationLogList={operationLogList}
              hebaoConfig={hebaoConfig}
            />
          );
        case "hebao-protected":
        default:
          return (
            <HebaoProtector
              protectList={protectList}
              hebaoConfig={hebaoConfig}
              loadData={loadData}
              isContractAddress={isContractAddress}
              handleOpenModal={handleOpenModal}
            />
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
              <Typography marginY={3} variant={"h1"} textAlign={"center"}>
                {t("describeTitleConnectToWallet")}
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
                    subMenu={subMenuHebao as any}
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
                {hebaoRouter()}
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
        <ModalLock
          options={openHebao.options ?? {}}
          {...{
            open: openHebao.isShow,
            step: openHebao.step,
            handleOpenModal,
            onClose: () => {
              setOpenHebao({
                isShow: false,
                step: HebaoStep.LockAccount_WaitForAuth,
              });
            },
          }}
        />
        <>{viewTemplate}</>
      </>
    );
  }
);
