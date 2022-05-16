import styled from "@emotion/styled";
import { Meta, Story } from "@storybook/react/types-6-0";
import { MemoryRouter } from "react-router-dom";
import {
  Box,
  Collapse,
  Container,
  CssBaseline,
  GlobalStyles,
  Grid,
  IconButton,
  Paper,
  Toolbar,
} from "@mui/material";
import { Header, HideOnScroll } from "../header";
import { css, Theme, useTheme } from "@emotion/react";
import { Button, SubMenu, SubMenuList as BasicSubMenuList } from "../basic-lib";
import {
  // AmmExitData,
  // AmmInData,
  globalCss,
  headerMenuData,
  headerToolBarData,
  HideIcon,
  // IBData,
  NavListIndex,
  PriceTag,
  subMenuLayer2,
  // VendorProviders,
  ViewIcon,
} from "@loopring-web/common-resources";
import { withTranslation } from "react-i18next";
import { OrderHistoryTable as OrderHistoryTableUI } from "../tableList/orderHistoryTable";
import { AssetTitleProps } from "../block";
import React from "react";
import { AssetTitle } from "../block";
import {
  AccountBasePanel,
  AccountBaseProps,
  ModalPanel,
  ResetProps,
  SwapTradeData,
  SwitchData,
  TradeBtnStatus,
  TransferProps,
  WithdrawProps,
} from "../";
import { setShowDeposit, setShowTransfer, setShowWithdraw } from "../../stores";
import {
  // ammCalcData,
  coinMap,
  CoinType,
  // tradeCalcData,
  walletMap,
} from "../../static";
import { useDispatch } from "react-redux";
import { Typography } from "@mui/material";

const Style = styled.div``;
const SubMenuList = withTranslation("layout", { withRef: true })(
  BasicSubMenuList
);
const OrderHistoryTable = withTranslation("common", { withRef: true })(
  OrderHistoryTableUI
);

let tradeData: any = {};
// let depositProps: DepositProps<any, any> = {
//   isNewAccount: true,
//   tradeData,
//   coinMap,
//   walletMap,
//   depositBtnStatus: TradeBtnStatus.AVAILABLE,
//   onDepositClick: (tradeData: SwapTradeData<CoinType>) => {
//     console.log("Swap button click", tradeData);
//   },
//   handlePanelEvent: async (
//     props: SwitchData<any>,
//     switchType: "Tomenu" | "Tobutton"
//   ) => {
//     return new Promise((res) => {
//       setTimeout(() => {
//         console.log("wait 100, with props", props, switchType);
//         res();
//       }, 500);
//     });
//   },
// };
let withdrawProps: WithdrawProps<any, any> = {
  handleFeeChange(value: {
    belong: string;
    fee: number | string;
    __raw__?: any;
  }): void {
    console.log(value);
  },
  handleWithdrawTypeChange(value): void {
    console.log(value);
  },
  tradeData,
  coinMap,
  walletMap,
  withdrawBtnStatus: TradeBtnStatus.AVAILABLE,
  onWithdrawClick: (tradeData: SwapTradeData<CoinType>) => {
    console.log("Swap button click", tradeData);
  },

  handlePanelEvent: async (
    props: SwitchData<any>,
    switchType: "Tomenu" | "Tobutton"
  ) => {
    return new Promise((res: any) => {
      setTimeout(() => {
        console.log("wait 100, with props", props, switchType);
        res();
      }, 500);
    });
  },
  withdrawType: 4,
  withdrawTypes: ["10", "11"],
  // @ts-ignore
  feeInfo: { belong: "ETH", fee: 0.001, __raw__: "" },
  chargeFeeTokenList: [
    { belong: "ETH", fee: 0.001, __raw__: "" },
    { belong: "LRC", fee: "1", __raw__: "" },
  ] as any,
  handleOnAddressChange: (value: any) => {
    console.log("handleOnAddressChange", value);
  },
  handleAddressError: (_value: any) => {
    return { error: true, message: "any error" };
  },
};
let transferProps: TransferProps<any, any> = {
  tradeData,
  coinMap,
  walletMap,
  transferBtnStatus: TradeBtnStatus.AVAILABLE,
  onTransferClick: (tradeData: any) => {
    console.log("Swap button click", tradeData);
  },
  handlePanelEvent: async (
    props: SwitchData<any>,
    switchType: "Tomenu" | "Tobutton"
  ) => {
    return new Promise((res: any) => {
      setTimeout(() => {
        console.log("wait 100, with props", props, switchType);
        res();
      }, 500);
    });
  },
  handleFeeChange(value: {
    belong: string;
    fee: number | string;
    __raw__?: any;
  }): void {
    console.log(value);
  },
  // @ts-ignore
  feeInfo: { belong: "ETH", fee: 0.001, __raw__: "" },
  chargeFeeTokenList: [
    { belong: "ETH", fee: 0.001, __raw__: "" },
    { belong: "LRC", fee: "1", __raw__: "" },
  ] as any,
  handleOnAddressChange: (value: any) => {
    console.log("handleOnAddressChange", value);
  },
  handleAddressError: (_value: any) => {
    return { error: true, message: "any error" };
  },
};
let resetProps: ResetProps<any> = {
  isFeeNotEnough: false,
  chargeFeeTokenList: [],
  // tradeData,
  assetsData: [],
  // walletMap,
  feeInfo: { belong: "ETH", fee: 0.001, __raw__: {} },
  resetBtnStatus: TradeBtnStatus.AVAILABLE,
  onResetClick: () => {
    console.log("Swap button click", tradeData);
  },
  handleFeeChange: async (value: any) => {
    console.log(value);
  },
};
// let swapProps: SwapProps<IBData<string>, string, any> = {
//   refreshRef: React.createRef(),
//   tradeData: {
//     sell: { belong: undefined },
//     buy: { belong: undefined },
//     slippage: "",
//   } as any,
//   tradeCalcData,
//   onSwapClick: (tradeData) => {
//     console.log("Swap button click", tradeData);
//   },
//   handleSwapPanelEvent: async (data: any, switchType: any) => {
//     console.log(data, switchType);
//   },
// };
// let ammProps: AmmProps<AmmExitData<IBData<any>>, any, AmmInData<any>, any> = {
//   refreshRef: React.createRef(),
//   ammDepositData: {
//     coinA: { belong: "ETH", balance: 0.3, tradeValue: 0 },
//     coinB: { belong: "LRC", balance: 1000, tradeValue: 0 },
//     coinLP: { belong: "LP-ETH-LRC", balance: 1000, tradeValue: 0 },
//     slippage: "",
//   },
//   ammWithdrawData: {
//     coinA: { belong: "ETH", balance: 0.3, tradeValue: 0 },
//     coinB: { belong: "LRC", balance: 1000, tradeValue: 0 },
//     slippage: "",
//   },
//   // tradeCalcData,
//   ammCalcDataDeposit: ammCalcData,
//   ammCalcDataWithDraw: ammCalcData,
//   handleAmmAddChangeEvent: (data: any, type: any) => {
//     console.log("handleAmmAddChangeEvent", data, type);
//   },
//   handleAmmRemoveChangeEvent: (data: any) => {
//     console.log("handleAmmRemoveChangeEvent", data);
//   },
//   onAmmRemoveClick: (data: any) => {
//     console.log("onAmmRemoveClick", data);
//   },
//   onAmmAddClick: (data: any) => {
//     console.log("onAmmAddClick", data);
//   },
// };

const ModalPanelWrap = () => {
  return (
    <ModalPanel
      transferProps={transferProps}
      withdrawProps={withdrawProps}
      resetProps={resetProps}
      // nftDepositProps={depositProps as any}
      // ammProps={ammProps as any}
      // swapProps={swapProps as any}
      assetsData={resetProps as any}
      exportAccountProps={{} as any}
      activeAccountProps={{} as any}
      setExportAccountToastOpen={{} as any}
      nftTransferProps={{} as any}
      nftWithdrawProps={{} as any}
      depositProps={{} as any}
    />
  );
};

const AssetTitleWrap = (rest: any) => {
  const assetTitleProps: AssetTitleProps = {
    onShowReceive: () => {},
    onShowSend: () => {},
    accountId: 0,
    setHideL2Assets: () => undefined,
    hideL2Assets: false,
    assetInfo: {
      totalAsset: 123456.789,
      priceTag: PriceTag.Dollar,
    },
  };

  return (
    <>
      <Grid item xs={12}>
        <AssetTitle
          {...{
            ...rest,
            ...assetTitleProps,
          }}
        />
      </Grid>
    </>
  );
};

const Layer2Wrap = withTranslation("common")(({ t, ...rest }: any) => {
  const selected = "assets";
  const StylePaper = styled(Box)`
    width: 100%;
    height: 100%;
    flex: 1;
    background: var(--color-box);
    border-radius: ${({ theme }) => theme.unit}px;
    padding: ${({ theme }) => theme.unit * 3}px;

    .tableWrapper {
      ${({ theme }) => theme.border.defaultFrame({ c_key: "default", d_R: 1 })};
      // margin-top:  ${({ theme }) => theme.unit * 3}px;
      // border: 1px solid #252842;
      // border-radius: ${({ theme }) => theme.unit}px;
      // padding: 26px;
    }
  ` as typeof Paper;
  const accountInfoProps: AccountBaseProps = {
    __timer__: -1,
    frozen: false,
    keySeed: "",
    qrCodeUrl: "",
    accAddress: "0x123567243o24o242423098784",
    accountId: 0,
    apiKey: "",
    connectName: "unknown" as any,
    eddsaKey: undefined,
    etherscanUrl: "https://material-ui.com/components/material-icons/",
    keyNonce: undefined,
    nonce: undefined,
    publicKey: undefined,
    readyState: "unknown",
    level: "VIP 1",
    mainBtn: (
      <Button
        variant={"contained"}
        size={"small"}
        color={"primary"}
        onClick={() => console.log("my event")}
      >
        My button
      </Button>
    ),
  };
  const hasAccount = true;
  const [showAccountInfo, setShowAccountInfo] = React.useState(hasAccount);
  const handleClick = (_event: React.MouseEvent) => {
    if (showAccountInfo) {
      // headerMenuData[ NavListIndex.layer2 ].iconBtn.view = false;
      setShowAccountInfo(false);
    } else {
      // headerMenuData[ NavListIndex.layer2 ].iconBtn.view = true;
      setShowAccountInfo(true);
    }
    _event.stopPropagation();
  };
  headerMenuData[NavListIndex.layer2].extender = hasAccount ? (
    <IconButton
      disabled={!hasAccount}
      onClick={handleClick}
      aria-label={t("labelShowAccountInfo")}
      color="primary"
    >
      {showAccountInfo ? <HideIcon /> : <ViewIcon />}
    </IconButton>
  ) : undefined;

  return (
    <>
      <CssBaseline />
      <HideOnScroll>
        <Header
          {...{ ...rest }}
          headerMenuData={{ ...headerMenuData }}
          headerToolBarData={{ ...headerToolBarData }}
          selected={"markets"}
        />
      </HideOnScroll>
      <Toolbar />
      <ModalPanelWrap />
      {hasAccount ? (
        <Collapse in={showAccountInfo}>
          <Container maxWidth="lg">
            <Box marginTop={3}>
              <AccountBasePanel {...{ ...accountInfoProps, t, ...rest }} />
            </Box>
          </Container>
        </Collapse>
      ) : undefined}
      <Container maxWidth="lg">
        {/*style={{height: '100%' }}*/}
        <Box
          flex={1}
          display={"flex"}
          alignItems={"stretch"}
          flexDirection="row"
          marginTop={3}
          minWidth={800}
        >
          <Box width={200} display={"flex"} justifyContent={"stretch"}>
            <SubMenu>
              <SubMenuList selected={selected} subMenu={subMenuLayer2 as any} />
            </SubMenu>
          </Box>
          <Box flex={1} marginLeft={4} height={1600} flexDirection="column">
            <Box marginBottom={3}>
              <AssetTitleWrap />
            </Box>
            <StylePaper>
              <Typography variant={"h5"} component={"h3"}>
                Orders
              </Typography>
              <Box marginTop={2} className="tableWrapper">
                <OrderHistoryTable rawData={[]} pageSize={0} {...rest} />
              </Box>
            </StylePaper>
          </Box>
        </Box>
      </Container>
      {/*<Footer></Footer>*/}
    </>
  );
});

const Template: Story<any> = () => {
  const theme: Theme = useTheme();
  console.log(theme.mode);
  return (
    <>
      <MemoryRouter initialEntries={["/"]}>
        <GlobalStyles
          styles={css`
  ${globalCss({ theme })};

  body:before {
    ${
      theme.mode === "dark"
        ? `
            color: ${theme.colorBase.textPrimary};        
           
            background: var(--color-global-bg);
       `
        : ""
    }
  }
}
`}
        />
        <Style>
          <Layer2Wrap />
        </Style>
      </MemoryRouter>
    </>
  );
};

export default {
  title: "components/Layout/Layer2",
  component: Layer2Wrap,
  argTypes: {},
} as Meta;

export const Layer2Story = Template.bind({});
// SwitchPanel.args = {}
