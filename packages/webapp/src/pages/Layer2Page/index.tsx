import { useRouteMatch } from "react-router-dom";

import { Box, Typography } from "@mui/material";
import { Button, SubMenu, SubMenuList } from "@loopring-web/component-lib";
import { useTranslation, withTranslation } from "react-i18next";
import {
  AccountStatus,
  fnType,
  i18n,
  LoadingIcon,
  myLog,
  SagaStatus,
  subMenuLayer2,
} from "@loopring-web/common-resources";

import AssetPanel from "./AssetPanel";
import HistoryPanel from "./HistoryPanel";
import OrderPanel from "./OrderPanel";
import MyLiqudityPanel from "./MyLiquidityPanel";
import React from "react";
import { useAccount } from "../../stores/account";
import {
  accountStaticCallBack,
  btnClickMap,
  btnLabel,
} from "../../layouts/connectStatusCallback";
import _ from "lodash";
import { SecurityPanel } from "./SecurityPanel";
import { VipPanel } from "./VipPanel";
import { RewardPanel } from "./RewardPanel";
import { RedPockPanel } from "./RedPockPanel";
import { MyNFTPanel } from "./MyNFTPanel";
import { useModals } from "hooks/useractions/useModals";
import { accountServices } from "services/account/accountServices";

export const subMenu = subMenuLayer2;

const BtnConnect = withTranslation(["common"], { withRef: true })(
  ({ t }: any) => {
    const { status: accountStatus, account } = useAccount();
    const { showDeposit } = useModals();
    // const {setShowAccount} = useOpenModals();
    const [label, setLabel] = React.useState(undefined);

    const _btnLabel = Object.assign(_.cloneDeep(btnLabel), {
      [fnType.NO_ACCOUNT]: [
        function () {
          return `depositTitleAndActive`;
        },
      ],
      [fnType.ERROR_NETWORK]: [
        function () {
          return `labelWrongNetwork`;
        },
      ],
    });

    React.useEffect(() => {
      if (accountStatus === SagaStatus.UNSET) {
        setLabel(accountStaticCallBack(_btnLabel));
      }
    }, [accountStatus, account.readyState, i18n.language]);

    const _btnClickMap = Object.assign(_.cloneDeep(btnClickMap), {});

    return (
      <Button
        variant={"contained"}
        size={"large"}
        color={"primary"}
        fullWidth={true}
        style={{ maxWidth: "280px" }}
        onClick={() => {
          // remove the middle account status panel
          // make deposite directly to create an account
          if (account.readyState === AccountStatus.NO_ACCOUNT) {
            myLog("DEPOSITING! sendCheckAcc");
            accountServices.sendCheckAcc();
            showDeposit({ isShow: true });
            return;
          }
          accountStaticCallBack(_btnClickMap, []);
        }}
      >
        {t(label)}
      </Button>
    );
  }
) as typeof Button;

export const Layer2Page = () => {
  let match: any = useRouteMatch("/layer2/:item");
  const { account } = useAccount();

  const { t } = useTranslation(["common", "layout"]);
  const selected = match?.params.item ?? "assets";
  const layer2Router = React.useMemo(() => {
    switch (selected) {
      case "assets":
        return <AssetPanel />;
      case "my-liquidity":
        return <MyLiqudityPanel />;
      case "my-nft":
        return <MyNFTPanel />;
      case "history":
        return <HistoryPanel />;
      case "order":
        return <OrderPanel />;
      case "redpock":
        return <RedPockPanel />;
      case "rewards":
        return <RewardPanel />;
      case "security":
        return <SecurityPanel />;
      case "vip":
        return <VipPanel />;
      default:
        <AssetPanel />;
    }
  }, [selected]);

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
        return (
          <Box
            flex={1}
            display={"flex"}
            justifyContent={"center"}
            flexDirection={"column"}
            alignItems={"center"}
          >
            <Typography marginY={3} variant={"h1"} textAlign={"center"}>
              {t("describeTitleLocked")}
            </Typography>
            <BtnConnect />
          </Box>
        );
        break;
      case AccountStatus.NO_ACCOUNT:
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
              variant={"h1"}
              whiteSpace={"pre-line"}
              textAlign={"center"}
            >
              {t("describeTitleNoAccount")}
            </Typography>
            <BtnConnect />
          </Box>
        );
        break;
      case AccountStatus.NOT_ACTIVE:
        return (
          <Box
            flex={1}
            display={"flex"}
            justifyContent={"center"}
            flexDirection={"column"}
            alignItems={"center"}
          >
            <Typography marginY={3} variant={"h1"} textAlign={"center"}>
              {t("describeTitleNotActive")}
            </Typography>
            <BtnConnect />
          </Box>
        );
        break;
      case AccountStatus.DEPOSITING:
        return (
          <Box
            flex={1}
            display={"flex"}
            justifyContent={"center"}
            flexDirection={"column"}
            alignItems={"center"}
          >
            <LoadingIcon color={"primary"} style={{ width: 60, height: 60 }} />
            <Typography marginY={3} variant={"h1"} textAlign={"center"}>
              {t("describeTitleOpenAccounting")}
            </Typography>
            {/*<BtnConnect/>*/}
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
            <Typography marginY={3} variant={"h1"} textAlign={"center"}>
              {t("describeTitleOnErrorNetwork", {
                connectName: account.connectName,
              })}
            </Typography>
            {/*<BtnConnect/>*/}
          </Box>
        );
        break;

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
                <SubMenuList selected={selected} subMenu={subMenu as any} />
              </SubMenu>
            </Box>
            <Box
              minHeight={420}
              display={"flex"}
              alignItems={"stretch"}
              flexDirection={"column"}
              marginTop={0}
              flex={1}
            >
              {layer2Router}
            </Box>
          </>
        );
      default:
        break;
    }
  }, [t, account.readyState, selected]);

  return <>{viewTemplate}</>;
};
