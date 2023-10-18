import styled from '@emotion/styled'
import { SwapPanel } from './Swap'
import { Meta, Story } from '@storybook/react'
import { MemoryRouter } from 'react-router-dom'
import { Box, Grid } from '@mui/material'
import {
  AccountStatus,
  AmmExitData,
  AmmInData,
  AmmJoinData,
  IBData,
  SlippageTolerance,
  TRADE_TYPE,
  TradeBtnStatus,
  AmmPanelType,
} from '@loopring-web/common-resources'
import {
  ammCalcData,
  coinMap,
  CoinType,
  DUALCALCDATA,
  TOKEN_INFO,
  tradeCalcData,
  walletMap,
} from '../../static'
import { Button } from '../basic-lib'
import { ResetPanel } from './Reset'
import { useTranslation } from 'react-i18next'
import {
  AmmPanel,
  AmmProps,
  DepositProps,
  DualWrap,
  DualWrapProps,
  ResetProps,
  SwapProps,
  SwapTradeData,
  SwitchData,
  TransferProps,
  WithdrawProps,
} from './index'

import { DepositPanel, TransferPanel, WithdrawPanel } from '../modal'

import { useDispatch } from 'react-redux'
import {
  setShowAmm,
  setShowDeposit,
  setShowResetAccount,
  setShowSwap,
  setShowTransfer,
  setShowWithdraw,
} from '../../stores'
import { SlippagePanel } from './components'
import React from 'react'
import * as sdk from '@loopring-web/loopring-sdk'
import { boxLiner } from '../styled'

const Style = styled.div`
  background: var(--color-global-bg);

  height: 100%;
  flex: 1;
`
const BoxLinear = styled(Box)`
  && {
    ${({ theme }) => boxLiner({ theme })};
  }
`
let tradeData: any = {}
// @ts-ignore
let depositProps: DepositProps<any, any> = {
  toIsAddressCheckLoading: false,
  referIsLoopringAddress: false,
  referIsAddressCheckLoading: false,
  type: TRADE_TYPE.NFT,
  isNewAccount: false,
  tradeData,
  coinMap,
  walletMap,
  depositBtnStatus: TradeBtnStatus.AVAILABLE,
  onDepositClick: (tradeData: SwapTradeData<CoinType>) => {
    console.log('Swap button click', tradeData)
  },
  handlePanelEvent: async (props: SwitchData<any>, switchType: 'Tomenu' | 'Tobutton') => {
    return new Promise(() => {
      setTimeout(() => {
        console.log('wait 100, with props', props, switchType)
        //res();
      }, 500)
    })
  },
}
let withdrawProps: Partial<WithdrawProps<any, any>> = {
  disabled: false,
  type: TRADE_TYPE.TOKEN,
  isContractAddress: false,
  isFeeNotEnough: {
    isFeeNotEnough: false,
    isOnLoading: false,
  },
  isAddressCheckLoading: false,
  isCFAddress: false,
  tradeData,
  coinMap,
  walletMap,
  withdrawBtnStatus: TradeBtnStatus.AVAILABLE,

  onWithdrawClick: (tradeData: SwapTradeData<CoinType>) => {
    console.log('Swap button click', tradeData)
  },
  handlePanelEvent: async (props: SwitchData<any>, switchType: 'Tomenu' | 'Tobutton') => {
    return new Promise((res: any) => {
      setTimeout(() => {
        console.log('wait 100, with props', props, switchType)
        res()
      }, 500)
    })
  },
  withdrawType: sdk.OffchainFeeReqType.OFFCHAIN_WITHDRAWAL,
  withdrawTypes: {
    // [sdk.OffchainFeeReqType.FAST_OFFCHAIN_WITHDRAWAL]: "Fast",
    [sdk.OffchainFeeReqType.OFFCHAIN_WITHDRAWAL]: 'Standard',
  },
  feeInfo: { belong: 'ETH', fee: 0.001, __raw__: '' as any },
  // @ts-ignore
  chargeFeeTokenList: [
    { belong: 'ETH', fee: 0.001, __raw__: '' as any },
    { belong: 'LRC', fee: '1', __raw__: '' as any },
  ],
  handleOnAddressChange: (value: any) => {
    console.log('handleOnAddressChange', value)
  },
  handleFeeChange(value: { belong: string; fee: number | string; __raw__?: any }): void {
    console.log('handleWithdrawFee', value)
  },
  handleWithdrawTypeChange: (value: any) => {
    console.log(value)
  },
}
let transferProps: Partial<TransferProps<any, any>> = {
  isFeeNotEnough: {
    isFeeNotEnough: false,
    isOnLoading: false,
  },
  tradeData,
  coinMap,
  walletMap,
  transferBtnStatus: TradeBtnStatus.AVAILABLE,
  onTransferClick: async (tradeData: any) => {
    console.log('Swap button click', tradeData)
  },
  handlePanelEvent: async (props: SwitchData<any>, switchType: 'Tomenu' | 'Tobutton') => {
    return new Promise((res: any) => {
      setTimeout(() => {
        console.log('wait 100, with props', props, switchType)
        res()
      }, 500)
    })
  },
  handleFeeChange(value: { belong: string; fee: number | string; __raw__?: any }): void {
    console.log('handleWithdrawFee', value)
  },
  feeInfo: { belong: 'ETH', fee: 0.001, __raw__: '' as any },
  // @ts-ignore
  chargeFeeTokenList: [
    { belong: 'ETH', fee: 0.001, __raw__: '' as any },
    { belong: 'LRC', fee: '1', __raw__: '' as any },
  ],
  handleOnAddressChange: (value: any) => {
    console.log('handleOnAddressChange', value)
  },
}
let resetProps: ResetProps<any> = {
  isFeeNotEnough: {
    isFeeNotEnough: false,
    isOnLoading: false,
  },
  chargeFeeTokenList: [
    { belong: 'ETH', fee: 0.001, __raw__: '' as any },
    { belong: 'LRC', fee: '1', __raw__: '' as any },
  ],
  feeInfo: { belong: 'ETH', fee: 0.001, __raw__: '' as any },
  handleFeeChange(value: { belong: string; fee: number | string; __raw__?: any }): void {
    console.log('handleWithdrawFee', value)
  },
  onResetClick({}): void {},
}
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
// @ts-ignore
let _ammProps: AmmProps<AmmJoinData<IBData<any>>, AmmExitData<IBData<any>>, any, AmmInData<any>> = {
  refreshRef: React.createRef(),
  // @ts-ignore
  ammDepositData: {
    coinA: { belong: 'ETH', balance: 0.3, tradeValue: 0 },
    coinB: { belong: 'LRC', balance: 1000, tradeValue: 0 },
    slippage: '',
  },
  // @ts-ignore
  ammWithdrawData: {
    coinLP: { belong: 'LP-ETH-LRC', balance: 0.3, tradeValue: 0 },
    slippage: '',
  },
  // tradeCalcData,
  ammCalcDataDeposit: ammCalcData,
  ammCalcDataWithDraw: ammCalcData,
  handleAmmAddChangeEvent: (data, type) => {
    console.log('handleAmmAddChangeEvent', data, type)
  },
  handleAmmRemoveChangeEvent: (data) => {
    return console.log('handleAmmRemoveChangeEvent', data)
  },
  onAmmRemoveClick: (data) => {
    console.log('onAmmRemoveClick', data)
  },
  onAmmAddClick: (data) => {
    console.log('onAmmAddClick', data)
  },
}

const WrapTransferPanel = (rest: any) => {
  const dispatch = useDispatch()
  dispatch(setShowTransfer({ isShow: false }))
  return (
    <>
      <Grid item sm={6}>
        <TransferPanel {...{ ...rest, ...transferProps }} />
      </Grid>
      <Grid item sm={6}>
        <TransferPanel {...rest} />
      </Grid>
    </>
  )
}
const WrapWithdrawPanel = (rest: any) => {
  const dispatch = useDispatch()
  dispatch(setShowDeposit({ isShow: false }))

  return (
    <>
      <Grid item sm={6}>
        <WithdrawPanel {...withdrawProps} {...rest} />
      </Grid>
      <Grid item sm={6}>
        <WithdrawPanel {...rest}> </WithdrawPanel>
      </Grid>
    </>
  )
}
const WrapDepositPanel = (rest: any) => {
  // const [open, setOpen] = useState(false)
  const dispatch = useDispatch()
  dispatch(setShowDeposit({ isShow: false }))
  const { t } = useTranslation('common')
  return (
    <>
      <Grid item sm={6}>
        <DepositPanel {...{ ...rest, ...depositProps }} />
      </Grid>
      <Grid item sm={6}>
        <DepositPanel
          {...{
            ...rest,
            ...depositProps,

            title: t('labelDepositTitleAndActive'),
            description: 'labelDepositAndActiveDescription',
          }}
        />
      </Grid>
      <Grid item sm={12}>
        {/*<Button onClick={() => setOpen(true)}> open</Button>*/}
      </Grid>
    </>
  )
}
const WrapResetPanel = (rest: any) => {
  const dispatch = useDispatch()
  dispatch(setShowResetAccount({ isShow: false }))
  return (
    <>
      <Grid item sm={6}>
        <ResetPanel {...resetProps} {...rest} />
      </Grid>
      <Grid item sm={6}>
        <ResetPanel {...rest}> </ResetPanel>
      </Grid>
      <Grid item sm={12} />
    </>
  )
}
const WrapSwapPanel = (rest: any) => {
  let tradeData: any = {
    sell: { belong: undefined },
    buy: { belong: undefined },
  }
  let swapProps: SwapProps<IBData<string>, string, any> = {
    refreshRef: React.createRef(),
    campaignTagConfig: {
      SWAP: [],
      ORDERBOOK: [],
      MARKET: [],
      AMM: [],
      FIAT: [],
    } as any,
    tradeData: tradeData,
    isStob: true,
    tradeCalcData,
    onSwapClick: () => {
      console.log('Swap button click', tradeData)
    },
    handleSwapPanelEvent: async (data: any, switchType: any) => {
      console.log(data, switchType)
    },
  }

  setTimeout(() => {
    // console.log('swapProps update')
    // swapProps.swapTradeData = {sell: {belong: "ETH"}, buy: {belong: "LRC"}} as any;
  }, 500)
  setTimeout(() => {
    swapProps.tradeCalcData = { ...tradeCalcData, StoB: 1.123 }
  }, 800)

  return (
    <>
      <Grid item sm={6}>
        <SwapPanel {...swapProps} {...rest} />
      </Grid>
    </>
  )
}
const WrapDualPanel = (rest: any) => {
  const dualWrapProps: DualWrapProps<any, any, any> = {
    refreshRef: React.createRef(),
    disabled: false,
    btnInfo: undefined,
    tokenMap: TOKEN_INFO.tokenMap as any,
    isLoading: false,
    onRefreshData: () => undefined,
    onSubmitClick: () => undefined,
    onChangeEvent: (item) => {
      console.log(item)
    },

    dualCalcData: DUALCALCDATA,
    tokenSell: TOKEN_INFO.tokenMap['LRC'],
    btnStatus: TradeBtnStatus.AVAILABLE,
    accStatus: AccountStatus.ACTIVATED,
  }
  return (
    <>
      <BoxLinear width={'80%'} padding={3} sx={{ background: 'var(--color-box-linear)' }}>
        <DualWrap {...dualWrapProps} {...rest} />
      </BoxLinear>
    </>
  )
}
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
  }

  return (
    <>
      <Grid item sm={6}>
        <AmmPanel {...{ ...ammProps, tabSelected: AmmPanelType.Join }} {...rest} />
      </Grid>
      <Grid item sm={6}>
        <AmmPanel
          {...{
            ...ammProps,
            tabSelected: AmmPanelType.Join,
            ammDepositBtnStatus: TradeBtnStatus.LOADING,
          }}
          {...rest}
        />
      </Grid>
      <Grid item sm={6}>
        <AmmPanel {...{ ...ammProps, tabSelected: AmmPanelType.Exit }} {...rest} />
      </Grid>
      <Grid item sm={6}>
        <AmmPanel
          {...{
            ...ammProps,
            tabSelected: AmmPanelType.Exit,
            ammWithdrawBtnStatus: TradeBtnStatus.DISABLED,
          }}
          {...rest}
        />
      </Grid>
    </>
  )
}

const ModalPanelWrap = () => {
  return (
    <></>
    // <ModalPanel
    //   depositProps={depositProps as DepositProps<any, any>}
    //   transferProps={transferProps as TransferProps<any, any>}
    //   withdrawProps={withdrawProps as WithdrawProps<any, any>}
    //   nftTransferProps={transferProps as TransferProps<any, any>}
    //   nftWithdrawProps={withdrawProps as WithdrawProps<any, any>}
    //   resetProps={resetProps}
    //   assetsData={{} as any}
    //   exportAccountProps={{} as any}
    //   setExportAccountToastOpen={{} as any}
    //   activeAccountProps={{} as any}
    //   // nftMintAdvanceProps={{} as any}
    //   nftDeployProps={{} as any}
    //   account={{} as any}
    //   baseURL={""}
    //   collectionAdvanceProps={{} as any}
    //   dualTradeProps={{} as any}
    // />
  )
}

const Template: Story<any> = () => {
  const dispatch = useDispatch()
  const { t, ...rest } = useTranslation()
  const slippageArray: Array<number | string> = SlippageTolerance.concat(`slippage:0.8`) as Array<
    number | string
  >
  return (
    <Style>
      <MemoryRouter initialEntries={['/']}>
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
          <Grid container spacing={2} alignContent={'center'} justifyContent={'space-around'}>
            <WrapSwapPanel />
          </Grid>
          <h4>DualPanel</h4>
          <Grid container spacing={2} alignContent={'center'} justifyContent={'space-around'}>
            <WrapDualPanel />
          </Grid>

          <h4>DepositPanel</h4>
          <Grid container spacing={2} alignContent={'center'} justifyContent={'space-around'}>
            <WrapDepositPanel />
          </Grid>
          <h4>ResetPanel</h4>
          <Grid container spacing={2} alignContent={'center'} justifyContent={'space-around'}>
            <WrapResetPanel />
          </Grid>
          <h4>TransferPanel</h4>
          <Grid container spacing={2} alignContent={'center'} justifyContent={'space-around'}>
            <WrapTransferPanel />
          </Grid>
          <h4>WithdrawPanel</h4>
          <Grid container spacing={2} alignContent={'center'} justifyContent={'space-around'}>
            <WrapWithdrawPanel />
          </Grid>
          <h4>AmmPanel</h4>
          <Grid container spacing={2} alignContent={'center'} justifyContent={'space-around'}>
            <WrapAmmPanel />
          </Grid>

          <h4>Open modal btn group</h4>
          <Grid container spacing={2} alignContent={'center'} justifyContent={'space-around'}>
            <Grid item xs={2}>
              <Button
                variant={'contained'}
                size={'small'}
                color={'primary'}
                onClick={() => dispatch(setShowTransfer({ isShow: true }))}
              >
                Open Transfer
              </Button>
            </Grid>
            <Grid item xs={6} display={'flex'} justifyContent={'space-around'}>
              <Button
                variant={'contained'}
                size={'small'}
                color={'primary'}
                onClick={() => dispatch(setShowDeposit({ isShow: true }))}
              >
                Open Deposit
              </Button>

              <Button
                variant={'outlined'}
                size={'small'}
                color={'primary'}
                onClick={() =>
                  dispatch(
                    setShowDeposit({
                      isShow: true,
                      props: {
                        title: t('depositTitleAndActive'),
                      },
                    }),
                  )
                }
              >
                Open Deposit & active acct
              </Button>
            </Grid>
            <Grid item xs={2}>
              <Button
                variant={'contained'}
                size={'small'}
                color={'primary'}
                onClick={() => dispatch(setShowResetAccount({ isShow: true }))}
              >
                Open Rest Private key
              </Button>
            </Grid>
            <Grid item xs={2}>
              <Button
                variant={'contained'}
                size={'small'}
                color={'primary'}
                onClick={() => dispatch(setShowWithdraw({ isShow: true }))}
              >
                Open Withdraw
              </Button>
            </Grid>
            <Grid item xs={2}>
              <Button
                variant={'contained'}
                size={'small'}
                color={'primary'}
                onClick={() =>
                  dispatch(
                    setShowAmm({
                      isShow: true,
                      type: AmmPanelType.Exit,
                    }),
                  )
                }
              >
                Open Amm WithDraw
              </Button>
            </Grid>
            <Grid item xs={2}>
              <Button
                variant={'contained'}
                size={'small'}
                color={'primary'}
                onClick={() => dispatch(setShowAmm({ isShow: true, type: AmmPanelType.Join }))}
              >
                Open Amm Deposit
              </Button>
            </Grid>
            <Grid item xs={2}>
              <Button
                variant={'contained'}
                size={'small'}
                color={'primary'}
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
  )
}

export default {
  title: 'components/Swap&TradePanel',
  component: WrapSwapPanel,
  argTypes: {},
} as Meta

export const SwapPanelStory = Template.bind({})
// SwitchPanel.args = {}
