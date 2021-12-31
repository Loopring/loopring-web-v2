import styled from "@emotion/styled";
import { SwapPanel } from "./Swap";
import { Meta, Story } from "@storybook/react/types-6-0";
import { MemoryRouter } from "react-router-dom";
import { Box, Grid } from "@mui/material";
import {
  AmmJoinData,
  AmmInData,
  AmmExitData,
  IBData,
  SlippageTolerance,
  WithdrawType,
  WithdrawTypes,
} from "@loopring-web/common-resources";
import {
  ammCalcData,
  coinMap,
  CoinType,
  tradeCalcData,
  walletMap,
} from "../../static";
import { Button } from "../basic-lib";
import { ResetPanel } from "./Reset";
import { useTranslation } from "react-i18next";
import {
  AmmPanel,
  AmmPanelType,
  AmmProps,
  DepositProps,
  ModalPanel,
  ResetProps,
  SwapProps,
  SwapTradeData,
  SwitchData,
  TradeBtnStatus,
  TransferProps,
  WithdrawProps,
} from "./index";

import { DepositPanel, TransferPanel, WithdrawPanel } from "../modal";

import { useDispatch } from "react-redux";
import {
  setShowAmm,
  setShowDeposit,
  setShowResetAccount,
  setShowSwap,
  setShowTransfer,
  setShowWithdraw,
} from "../../stores";
import { SlippagePanel } from "./components";
import React from "react";

const Style = styled.div`
  background: var(--color-global-bg);

  height: 100%;
  flex: 1;
`;
let tradeData: any = {};
let depositProps: DepositProps<any, any> = {
  isNewAccount: false,
  tradeData,
  coinMap,
  walletMap,
  depositBtnStatus: TradeBtnStatus.AVAILABLE,
  onDepositClick: (tradeData: SwapTradeData<CoinType>) => {
    console.log("Swap button click", tradeData);
  },
  handlePanelEvent: async (
    props: SwitchData<any>,
    switchType: "Tomenu" | "Tobutton"
  ) => {
    return new Promise(() => {
      setTimeout(() => {
        console.log("wait 100, with props", props, switchType);
        //res();
      }, 500);
    });
  },
};
let withdrawProps: WithdrawProps<any, any> = {
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
  withdrawType: WithdrawType.Fast,
  withdrawTypes: WithdrawTypes,
  chargeFeeToken: "ETH",
  // @ts-ignore
  chargeFeeTokenList: [
    { belong: "ETH", fee: 0.001, __raw__: "" as any },
    { belong: "LRC", fee: "1", __raw__: "" as any },
  ],
  handleOnAddressChange: (value: any) => {
    console.log("handleOnAddressChange", value);
  },
  handleFeeChange(value: {
    belong: string;
    fee: number | string;
    __raw__?: any;
  }): void {
    console.log("handleWithdrawFee", value);
  },
  handleWithdrawTypeChange: (value: any) => {
    console.log(value);
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
    console.log("handleWithdrawFee", value);
  },
  chargeFeeToken: "ETH",
  // @ts-ignore
  chargeFeeTokenList: [
    { belong: "ETH", fee: 0.001, __raw__: "" as any },
    { belong: "LRC", fee: "1", __raw__: "" as any },
  ],
  handleOnAddressChange: (value: any) => {
    console.log("handleOnAddressChange", value);
  },
  handleAddressError: (_value: any) => {
    return { error: true, message: "any error" };
  },
};
let resetProps: ResetProps<any> = {
  chargeFeeTokenList: [
    { belong: "ETH", fee: 0.001, __raw__: "" as any },
    { belong: "LRC", fee: "1", __raw__: "" as any },
  ],
  handleFeeChange(value: {
    belong: string;
    fee: number | string;
    __raw__?: any;
  }): void {
    console.log("handleWithdrawFee", value);
  },
  onResetClick(): void {},
};
// resetBtnStatus: TradeBtnStatus.AVAILABLE,
//   handlePanelEvent: async (
//     props: SwitchData<any>,
//     switchType: "Tomenu" | "Tobutton"
//   ) => {
//     return new Promise((res: any) => {
//       setTimeout(() => {
//         console.log("wait 100, with props", props, switchType);
//         res();
//       }, 500);
//     });
//   },
//   fee: { count: 234, price: 123 },
let swapProps: SwapProps<IBData<string>, string, any> = {
  refreshRef: React.createRef(),
  tradeData: {
    sell: { belong: undefined },
    buy: { belong: undefined },
    slippage: "",
  } as any,
  tradeCalcData,
  onSwapClick: (tradeData) => {
    console.log("Swap button click", tradeData);
  },
  handleSwapPanelEvent: async (data: any, switchType: any) => {
    console.log(data, switchType);
  },
};
// @ts-ignore
let _ammProps: AmmProps<
  AmmJoinData<IBData<any>>,
  AmmExitData<IBData<any>>,
  any,
  AmmInData<any>
> = {
  refreshRef: React.createRef(),
  ammDepositData: {
    coinA: { belong: "ETH", balance: 0.3, tradeValue: 0 },
    coinB: { belong: "LRC", balance: 1000, tradeValue: 0 },
    slippage: "",
  },
  // @ts-ignore
  ammWithdrawData: {
    coinLP: { belong: "LP-ETH-LRC", balance: 0.3, tradeValue: 0 },
    slippage: "",
  },
  // tradeCalcData,
  ammCalcDataDeposit: ammCalcData,
  ammCalcDataWithDraw: ammCalcData,
  handleAmmAddChangeEvent: (data, type) => {
    console.log("handleAmmAddChangeEvent", data, type);
  },
  handleAmmRemoveChangeEvent: (data) => {
    return console.log("handleAmmRemoveChangeEvent", data);
  },
  onAmmRemoveClick: (data) => {
    console.log("onAmmRemoveClick", data);
  },
  onAmmAddClick: (data) => {
    console.log("onAmmAddClick", data);
  },
};

const WrapTransferPanel = (rest: any) => {
  const dispatch = useDispatch();
  dispatch(setShowTransfer({ isShow: false }));
  return (
    <>
      {" "}
      <Grid item sm={6}>
        <TransferPanel {...{ ...rest, ...transferProps }} />
      </Grid>
      <Grid item sm={6}>
        <TransferPanel {...rest} />
      </Grid>
    </>
  );
};
const WrapWithdrawPanel = (rest: any) => {
  const dispatch = useDispatch();
  dispatch(setShowDeposit({ isShow: false }));

  return (
    <>
      {" "}
      <Grid item sm={6}>
        <WithdrawPanel {...withdrawProps} {...rest}>
          {" "}
        </WithdrawPanel>
      </Grid>
      <Grid item sm={6}>
        <WithdrawPanel {...rest}> </WithdrawPanel>
      </Grid>
      <Grid item sm={12}></Grid>
    </>
  );
};
const WrapDepositPanel = (rest: any) => {
  // const [open, setOpen] = useState(false)
  const dispatch = useDispatch();
  dispatch(setShowDeposit({ isShow: false }));
  const { t } = useTranslation("common");
  return (
    <>
      {" "}
      <Grid item sm={6}>
        <DepositPanel {...{ ...rest, ...depositProps, ...{ v: true } }}>
          {" "}
        </DepositPanel>
      </Grid>
      <Grid item sm={6}>
        <DepositPanel
          {...{
            ...rest,
            ...depositProps,

            title: t("depositTitleAndActive"),
            description: "depositAndActiveDescription",
          }}
        >
          {" "}
        </DepositPanel>
      </Grid>
      <Grid item sm={12}>
        {/*<Button onClick={() => setOpen(true)}> open</Button>*/}
      </Grid>
    </>
  );
};
const WrapResetPanel = (rest: any) => {
  const dispatch = useDispatch();
  dispatch(setShowResetAccount({ isShow: false }));
  return (
    <>
      {" "}
      <Grid item sm={6}>
        <ResetPanel {...resetProps} {...rest}>
          {" "}
        </ResetPanel>
      </Grid>
      <Grid item sm={6}>
        <ResetPanel {...rest}> </ResetPanel>
      </Grid>
      <Grid item sm={12}></Grid>
    </>
  );
};
const WrapSwapPanel = (rest: any) => {
  let tradeData: any = {
    sell: { belong: undefined },
    buy: { belong: undefined },
  };
  let swapProps: SwapProps<IBData<string>, string, any> = {
    refreshRef: React.createRef(),
    tradeData: tradeData,
    tradeCalcData,
    onSwapClick: (tradeData) => {
      console.log("Swap button click", tradeData);
    },
    handleSwapPanelEvent: async (data: any, switchType: any) => {
      console.log(data, switchType);
    },
  };

  setTimeout(() => {
    // console.log('swapProps update')
    // swapProps.swapTradeData = {sell: {belong: "ETH"}, buy: {belong: "LRC"}} as any;
  }, 500);
  setTimeout(() => {
    swapProps.tradeCalcData = { ...tradeCalcData, StoB: 1.123 };
  }, 800);

  return (
    <>
      {" "}
      <Grid item sm={6}>
        <SwapPanel {...swapProps} {...rest}>
          {" "}
        </SwapPanel>
      </Grid>
      <Grid item sm={6}>
        <SwapPanel {...rest}> </SwapPanel>
      </Grid>
    </>
  );
};
const WrapAmmPanel = (rest: any) => {
  // let tradeData: any = {
  //     coinA: {belong: 'ETH', balance: 0.3, tradeValue: 0},
  //     coinB: {belong: 'LRC', balance: 1000, tradeValue: 0}
  // };
  let ammProps: AmmProps<AmmJoinData<IBData<any>>, any, AmmInData<any>, any> = {
    ..._ammProps,
    // refreshRef: React.createRef(),
    // ammDepositData: tradeData,
    // AmmExitData: {coinLP:{belong: 'ETH', balance: 0.3, tradeValue: 0}},
    // // tradeCalcData,
    // ammCalcDataDeposit: ammCalcData,
    // ammCalcDataWithDraw: ammCalcData,
    // handleAmmAddChangeEvent: (data, type) => {
    //     console.log('handleAmmAddChangeEvent', data, type);
    // },
    // handleAmmRemoveChangeEvent: (data, type) => {
    //     console.log('handleAmmRemoveChangeEvent', data, type);
    // },
    // onAmmRemoveClick: (data) => {
    //     console.log('onAmmRemoveClick', data);
    // },
    // onAmmAddClick: (data) => {
    //     console.log('onAmmAddClick', data);
    // }
  };

  return (
    <>
      {" "}
      <Grid item sm={6}>
        <AmmPanel
          {...{ ...ammProps, tabSelected: AmmPanelType.Join }}
          {...rest}
        >
          {" "}
        </AmmPanel>
      </Grid>
      <Grid item sm={6}>
        <AmmPanel
          {...{
            ...ammProps,
            tabSelected: AmmPanelType.Join,
            ammDepositBtnStatus: TradeBtnStatus.LOADING,
          }}
          {...rest}
        >
          {" "}
        </AmmPanel>
      </Grid>
      <Grid item sm={6}>
        <AmmPanel
          {...{ ...ammProps, tabSelected: AmmPanelType.Exit }}
          {...rest}
        >
          {" "}
        </AmmPanel>
      </Grid>
      <Grid item sm={6}>
        <AmmPanel
          {...{
            ...ammProps,
            tabSelected: AmmPanelType.Exit,
            ammWithdrawBtnStatus: TradeBtnStatus.DISABLED,
          }}
          {...rest}
        >
          {" "}
        </AmmPanel>
      </Grid>
    </>
  );
};

const ModalPanelWrap = () => {
  return (
    <ModalPanel
      transferProps={transferProps}
      depositProps={depositProps}
      withdrawProps={withdrawProps}
      nftTransferProps={transferProps}
      nftDepositProps={depositProps}
      nftWithdrawProps={withdrawProps}
      resetProps={resetProps}
      ammProps={_ammProps}
      swapProps={swapProps}
      assetsData={{} as any}
      exportAccountProps={{} as any}
      setExportAccountToastOpen={{} as any}
    />
  );
};

const Template: Story<any> = () => {
  const dispatch = useDispatch();
  const { t, ...rest } = useTranslation();
  const slippageArray: Array<number | string> = SlippageTolerance.concat(
    `slippage:0.8`
  ) as Array<number | string>;
  return (
    <Style>
      {" "}
      <MemoryRouter initialEntries={["/"]}>
        <Box>
          <h4>Slippage bloc</h4>
          <Grid container spacing={2}>
            <SlippagePanel
              {...{
                ...rest,
                t,
                handleChange: () => {},
                slippageList: slippageArray,
                slippage: 0.5,
              }}
            />
          </Grid>

          <h4>SwapPanel</h4>
          <Grid
            container
            spacing={2}
            alignContent={"center"}
            justifyContent={"space-around"}
          >
            <WrapSwapPanel />
          </Grid>
          <h4>DepositPanel</h4>
          <Grid
            container
            spacing={2}
            alignContent={"center"}
            justifyContent={"space-around"}
          >
            <WrapDepositPanel />
          </Grid>
          <h4>ResetPanel</h4>
          <Grid
            container
            spacing={2}
            alignContent={"center"}
            justifyContent={"space-around"}
          >
            <WrapResetPanel />
          </Grid>
          <h4>TransferPanel</h4>
          <Grid
            container
            spacing={2}
            alignContent={"center"}
            justifyContent={"space-around"}
          >
            <WrapTransferPanel />
          </Grid>
          <h4>WithdrawPanel</h4>
          <Grid
            container
            spacing={2}
            alignContent={"center"}
            justifyContent={"space-around"}
          >
            <WrapWithdrawPanel />
          </Grid>
          <h4>AmmpPanel</h4>
          <Grid
            container
            spacing={2}
            alignContent={"center"}
            justifyContent={"space-around"}
          >
            <WrapAmmPanel />
          </Grid>

          <h4>Open modal btn group</h4>
          <Grid
            container
            spacing={2}
            alignContent={"center"}
            justifyContent={"space-around"}
          >
            <Grid item xs={2}>
              <Button
                variant={"contained"}
                size={"small"}
                color={"primary"}
                onClick={() => dispatch(setShowTransfer({ isShow: true }))}
              >
                Open Transfer
              </Button>
            </Grid>
            <Grid item xs={6} display={"flex"} justifyContent={"space-around"}>
              <Button
                variant={"contained"}
                size={"small"}
                color={"primary"}
                onClick={() => dispatch(setShowDeposit({ isShow: true }))}
              >
                Open Deposit
              </Button>

              <Button
                variant={"outlined"}
                size={"small"}
                color={"primary"}
                onClick={() =>
                  dispatch(
                    setShowDeposit({
                      isShow: true,
                      props: {
                        title: t("depositTitleAndActive"),
                      },
                    })
                  )
                }
              >
                Open Deposit & active acct
              </Button>
            </Grid>
            <Grid item xs={2}>
              <Button
                variant={"contained"}
                size={"small"}
                color={"primary"}
                onClick={() => dispatch(setShowResetAccount({ isShow: true }))}
              >
                Open Rest Private key
              </Button>
            </Grid>
            <Grid item xs={2}>
              <Button
                variant={"contained"}
                size={"small"}
                color={"primary"}
                onClick={() => dispatch(setShowWithdraw({ isShow: true }))}
              >
                Open Withdraw
              </Button>
            </Grid>
            <Grid item xs={2}>
              <Button
                variant={"contained"}
                size={"small"}
                color={"primary"}
                onClick={() =>
                  dispatch(
                    setShowAmm({
                      isShow: true,
                      props: { tabSelected: AmmPanelType.Exit },
                    })
                  )
                }
              >
                Open Amm WithDraw
              </Button>
            </Grid>
            <Grid item xs={2}>
              <Button
                variant={"contained"}
                size={"small"}
                color={"primary"}
                onClick={() => dispatch(setShowAmm({ isShow: true }))}
              >
                Open Amm Deposit
              </Button>
            </Grid>
            <Grid item xs={2}>
              <Button
                variant={"contained"}
                size={"small"}
                color={"primary"}
                onClick={() => dispatch(setShowSwap({ isShow: true }))}
              >
                Open trade
              </Button>
            </Grid>
          </Grid>
          <ModalPanelWrap />
        </Box>
      </MemoryRouter>
    </Style>
  );
};

export default {
  title: "components/Swap&TradePanel",
  component: WrapSwapPanel,
  argTypes: {},
} as Meta;

export const SwapPanelStory = Template.bind({});
// SwitchPanel.args = {}
