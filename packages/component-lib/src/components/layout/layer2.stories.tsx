import styled from '@emotion/styled';
import { Meta, Story } from '@storybook/react/types-6-0';
import { MemoryRouter } from 'react-router-dom';
import { Box, Collapse, Container, GlobalStyles, Grid, IconButton, Paper, Toolbar, } from '@material-ui/core';
import { Header, HideOnScroll } from '../header/Header'
import { css, Theme, useTheme } from '@emotion/react';
import { Button, SubMenu, SubMenuList as BasicSubMenuList } from '../basic-lib';
import {
    AmmData,
    AmmInData,
    ButtonComponentsMap,
    globalCss,
    headerMenuData,
    headerToolBarData,
    HideIcon,
    IBData,
    LanguageKeys,
    NavListIndex,
    PriceTag,
    subMenuLayer2,
    ViewIcon,
    WithdrawType,
    WithdrawTypes
} from 'static-resource';
import { useTranslation, withTranslation } from 'react-i18next';
import { OrderHistoryTable as OrderHistoryTableUI } from '../tableList/orderHistoryTable'
import { AccountInfo, AccountInfoProps, AssetTitleProps } from '../block';
import React from 'react';
import { AssetTitle } from '../block/AssetTitle';
import {
    AmmProps,
    DepositProps,
    ModalPanel,
    ResetProps,
    SwapProps,
    SwapTradeData,
    SwitchData,
    TradeBtnStatus,
    TransferProps,
    WithdrawProps
} from '../';
import { setShowDeposit, setShowTransfer, setShowWithdraw, useSettings } from '../../stores';
import { ammCalcData, coinMap, CoinType, tradeCalcData, walletMap } from '../../static';
import { useDispatch } from 'react-redux';
import { Typography } from '@material-ui/core/';

const Style = styled.div`
  color: #fff;
`
const SubMenuList = withTranslation('layout', {withRef: true})(BasicSubMenuList);
const OrderHistoryTable = withTranslation('common', {withRef: true})(OrderHistoryTableUI);

let tradeData: any = {};
let depositProps: DepositProps<any, any> = {
    tradeData,
    coinMap,
    walletMap,
    depositBtnStatus: TradeBtnStatus.AVAILABLE,
    onDepositClick: (tradeData: SwapTradeData<CoinType>) => {
        console.log('Swap button click', tradeData);
    },
    handlePanelEvent: async (props: SwitchData<any>, switchType: 'Tomenu' | 'Tobutton') => {
        return new Promise((res) => {
            setTimeout(() => {
                console.log('wait 100, with props', props, switchType);
                res();
            }, 500)
        })
    },
}
let withdrawProps: WithdrawProps<any, any> = {
    handleFeeChange(value: { belong: string; fee: number | string; __raw__?: any }): void {
        console.log(value)
    },
    handleWithdrawTypeChange(value: keyof typeof WithdrawType): void {
        console.log(value)
    },
    tradeData,
    coinMap,
    walletMap,
    withdrawBtnStatus: TradeBtnStatus.AVAILABLE,
    onWithdrawClick: (tradeData: SwapTradeData<CoinType>) => {
        console.log('Swap button click', tradeData);
    },

    handlePanelEvent: async (props: SwitchData<any>, switchType: 'Tomenu' | 'Tobutton') => {
        return new Promise((res: any) => {
            setTimeout(() => {
                console.log('wait 100, with props', props, switchType);
                res();
            }, 500)
        })
    },
    withdrawType: WithdrawType.Fast,
    withdrawTypes: WithdrawTypes,
    chargeFeeToken: 'ETH',
    chargeFeeTokenList: [{belong: 'ETH', fee: 0.001}, {belong: 'LRC', fee: '1'}],
    handleOnAddressChange: (value: any) => {
        console.log('handleOnAddressChange', value);
    },
    handleAddressError: (_value: any) => {
        return {error: true, message: 'any error'}
    }
}
let transferProps: TransferProps<any, any> = {

    tradeData,
    coinMap,
    walletMap,
    transferBtnStatus: TradeBtnStatus.AVAILABLE,
    onTransferClick: (tradeData: any) => {
        console.log('Swap button click', tradeData);
    },
    handlePanelEvent: async (props: SwitchData<any>, switchType: 'Tomenu' | 'Tobutton') => {
        return new Promise((res: any) => {
            setTimeout(() => {
                console.log('wait 100, with props', props, switchType);
                res();
            }, 500)
        })
    },
    handleFeeChange(value: { belong: string; fee: number | string; __raw__?: any }): void {
        console.log(value)
    },
    chargeFeeToken: 'ETH',
    chargeFeeTokenList: [{belong: 'ETH', fee: 0.001}, {belong: 'LRC', fee: '1'}],
    handleOnAddressChange: (value: any) => {
        console.log('handleOnAddressChange', value);
    },
    handleAddressError: (_value: any) => {
        return {error: true, message: 'any error'}
    }
}
let resetProps: ResetProps<any, any> = {
    tradeData,
    coinMap,
    walletMap,
    resetBtnStatus: TradeBtnStatus.AVAILABLE,
    onResetClick: (tradeData: SwapTradeData<CoinType>) => {
        console.log('Swap button click', tradeData);
    },
    handlePanelEvent: async (props: SwitchData<any>, switchType: 'Tomenu' | 'Tobutton') => {
        return new Promise((res) => {
            setTimeout(() => {
                console.log('wait 100, with props', props, switchType);
                res();
            }, 500)
        })
    },
    fee: {count: 234, price: 123}
}
let swapProps: SwapProps<IBData<string>, string, any> = {
    tradeData:  {sell: {belong: undefined}, buy: {belong: undefined}, slippage: ''} as any,
    tradeCalcData,
    onSwapClick: (tradeData) => {
        console.log('Swap button click', tradeData);
    },
    handleSwapPanelEvent: async (data: any, switchType: any) => {
        console.log(data, switchType)
    }
};
let ammProps: AmmProps<AmmData<IBData<any>>, any, AmmInData<any>> = {
    ammDepositData: {
        coinA: {belong: 'ETH', balance: 0.3, tradeValue: 0},
        coinB: {belong: 'LRC', balance: 1000, tradeValue: 0},
        slippage: '',
    },
    ammWithdrawData: {
        coinA: {belong: 'ETH', balance: 0.3, tradeValue: 0},
        coinB: {belong: 'LRC', balance: 1000, tradeValue: 0},
        slippage: '',
    },
    // tradeCalcData,
    ammCalcData: ammCalcData,
    handleAmmAddChangeEvent: (data, type) => {
        console.log('handleAmmAddChangeEvent', data, type);
    },
    handleAmmRemoveChangeEvent: (data, type) => {
        console.log('handleAmmRemoveChangeEvent', data, type);
    },
    onAmmRemoveClick: (data) => {
        console.log('onAmmRemoveClick', data);
    },
    onAmmAddClick: (data) => {
        console.log('onAmmAddClick', data);
    }
}

const ModalPanelWrap = () => {
    return <ModalPanel transferProps={transferProps} withDrawProps={withdrawProps} depositProps={depositProps}
                       resetProps={resetProps} ammProps={ammProps} swapProps={swapProps}/>
}

const AssetTitleWrap = (rest: any) => {
    const dispatch = useDispatch();
    // const [isTransferShow,setIsTransferShow] = React.useState(false)
    // const [isDepositShow, setIsDepositShow] = React.useState(false)
    // const [isWithdrawShow, setIsWithdrawShow] = React.useState(false)
    const AssetTitleProps: AssetTitleProps = {
        assetInfo: {
            totalAsset: 123456.789,
            priceTag: PriceTag.Dollar,
        },
        onShowWithdraw: () => dispatch(setShowDeposit({
            isShow: true, props: {
                title: 'Demo change title props'
            }
        })),
        onShowTransfer: () => dispatch(setShowTransfer({isShow: true})),
        onShowDeposit: () => dispatch(setShowWithdraw({isShow: true})),
    }
    return <>
        <Grid item xs={12}>
            <AssetTitle  {...{
                ...rest,
                ...AssetTitleProps
            }} />
        </Grid>
    </>
}

const Layer2Wrap = () => {
    // const _headerMenuData: List<HeaderMenuItemInterface> = headerMenuData as List<HeaderMenuItemInterface>;
    // const _headerToolBarData: List<HeaderToolBarInterface> = headerToolBarData as List<HeaderToolBarInterface>;
    //TODO: checkRouter
    const selected = 'assets';
    const StylePaper = styled(Box)`
      width: 100%;
      height: 100%;
      flex: 1;
      background-color: ${({theme}) => theme.colorBase.background().default};
      border-radius: ${({theme}) => theme.unit}px;
      padding: ${({theme}) => theme.unit * 3}px;


      .tableWrapper {
        ${({theme}) => theme.border.defaultFrame({c_key: 'default', d_R: 1})};
          // margin-top:  ${({theme}) => theme.unit * 3}px;
        // border: 1px solid #252842;
          // border-radius: ${({theme}) => theme.unit}px;
        // padding: 26px;
      }
    ` as typeof Paper;
    const accountInfoProps: AccountInfoProps = {
        addressShort:'0x123...8784',
        address: '0x123567243o24o242423098784',
        level: 'VIP 1',
        connectBy:  'MetaMask',
        etherscanLink: 'https://material-ui.com/components/material-icons/',
        mainBtn: <Button variant={'contained'} size={'small'} color={'primary'} onClick={() => console.log('my event')}>My
            button</Button>
    }
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
    }
    const {t} = useTranslation('common');
    const {setLanguage} = useSettings()
    headerMenuData[ NavListIndex.layer2 ].extender = hasAccount ? <IconButton disabled={!hasAccount}
                                                                              onClick={handleClick}
                                                                              aria-label={t('labelShowAccountInfo')}
                                                                              color="primary">
        {showAccountInfo ? <HideIcon/> : <ViewIcon/>}
    </IconButton> : undefined
    const onLangBtnClick = (lang: LanguageKeys) => {
        //i18n.changeLanguage(lang);
        setLanguage(lang);
    }
    headerToolBarData[ ButtonComponentsMap.Language ] = {
        ...headerToolBarData[ ButtonComponentsMap.Language ],
        handleChange: onLangBtnClick
    }


    return <>
        <HideOnScroll>
            <Header headerMenuData={headerMenuData} headerToolBarData={headerToolBarData}
                    selected={'markets'}></Header>
        </HideOnScroll>
        <Toolbar/>
        <ModalPanelWrap/>
        {hasAccount ?
            <Collapse in={showAccountInfo}>
                <Container maxWidth="lg">
                    <Box marginTop={3}>
                        <AccountInfo  {...accountInfoProps}></AccountInfo>
                    </Box>
                </Container>
            </Collapse> : undefined}
        <Container maxWidth="lg">
            {/*style={{height: '100%' }}*/}
            <Box flex={1} display={'flex'} alignItems={'stretch'} flexDirection="row" marginTop={3} minWidth={800}>
                <Box width={200} display={'flex'} justifyContent={'stretch'}>
                    <SubMenu>
                        <SubMenuList selected={selected} subMenu={subMenuLayer2 as any}/>
                    </SubMenu>
                </Box>
                <Box flex={1} marginLeft={4} height={1600} flexDirection="column">
                    <Box marginBottom={3}>
                        <AssetTitleWrap/>
                    </Box>
                    <StylePaper>
                        <Typography variant={'h4'} component={'h3'}>Orders</Typography>
                        <Box marginTop={2} className="tableWrapper">
                            <OrderHistoryTable rawData={[]}/>
                        </Box>
                    </StylePaper>
                </Box>
            </Box>
        </Container>
        {/*<Footer></Footer>*/}
    </>
}

const Template: Story<any> = () => {
    const theme: Theme = useTheme();
    console.log(theme.mode)
    return <> <MemoryRouter initialEntries={['/']}><GlobalStyles styles={css`
      ${globalCss({theme})};

      body:before {
        ${theme.mode === 'dark' ? `
            color: ${theme.colorBase.textPrimary};        
            background: #191C30;
            background: ${theme.colorBase.background().bg};
       ` : ''}
      }
    }
    `}></GlobalStyles>
        <Style>
            <Layer2Wrap/>
        </Style>
    </MemoryRouter>
    </>
};

export default {
    title: 'components/Layout/Layer2',
    component: Layer2Wrap,
    argTypes: {},
} as Meta

export const Layer2Story = Template.bind({});
// SwitchPanel.args = {}

