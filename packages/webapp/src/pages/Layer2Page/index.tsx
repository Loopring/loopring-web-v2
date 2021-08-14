import { useRouteMatch } from 'react-router'

import { Box, Typography } from '@material-ui/core'
import { Button, SubMenu, SubMenuList as BasicSubMenuList, useOpenModals, } from '@loopring-web/component-lib'
import { useTranslation, withTranslation } from 'react-i18next'
import styled from '@emotion/styled'
import { AccountStatus, fnType, LoadingIcon, SagaStatus, subMenuLayer2 } from '@loopring-web/common-resources'

import TxPanel from './TxPanel'
import AssetPanel from './AssetPanel'
import TradePanel from './TradePanel'
import AmmPanel from './AmmPanel'
import History from './HistoryPanel'
import OrderPanel from './OrderPanel'
import MyLiqudityPanel from './MyLiquidityPanel'
import { SettingPanel } from '../SettingPage';
// import { useModalProps } from '../../layouts/header/hook';
import React from 'react';
import { useAccount } from '../../stores/account';
import { accountStaticCallBack, btnLabel, btnClickMap } from '../../layouts/connectStatusCallback';
import { deepClone } from '../../utils/obj_tools';

import { i18n } from "@loopring-web/common-resources"


// import { useModalProps } from '../../modal';

export const subMenu = subMenuLayer2

const BoxStyle = styled(Box)`
  ${({theme}) => `
    background: var(--color-box);
    width: 100%;
    min-width:auto;
    ${theme.border.defaultFrame({c_key: 'blur'})};
    & > div{
      background-color:initial;
      border:0;
      width:auto;
      min-width: var(--swap-box-width);
      max-width: 520px;
    }
    `
  }

` as typeof Box
const BtnConnect = withTranslation(['common'], {withRef: true})(({t}: any) => {
    const { status: accountStatus} = useAccount();
    // const {setShowAccount} = useOpenModals();
    const [label, setLabel] = React.useState(undefined);

    const _btnLabel = Object.assign(deepClone(btnLabel), {
        [ fnType.NO_ACCOUNT ]: [
            function () {
                return `depositTitleAndActive`
            }
        ],
        [ fnType.ERROR_NETWORK ]: [
            function () {
                return `depositTitleAndActive`
            }
        ],
    });

    React.useEffect(() => {
        if (accountStatus === SagaStatus.UNSET) {
            setLabel(accountStaticCallBack(_btnLabel));
        }
    }, [accountStatus, i18n.language])

    const _btnClickMap = Object.assign(deepClone(btnClickMap), {});

    return <Button variant={'contained'} size={'large'} color={'primary'} fullWidth={true}
                   style={{maxWidth: '280px'}} onClick={() => {
        accountStaticCallBack(_btnClickMap, [])
    }
    }>{t(label)}</Button>
}) as typeof Button
const SubMenuList = withTranslation(['layout', 'common'], {withRef: true})(BasicSubMenuList);
export const Layer2Page = () => {

    let match: any = useRouteMatch("/layer2/:item")
    const {
        account,
        // updateAccount,
        // resetAccount,
        // setShouldShow,
        // status: accountStatus,
        // statusUnset: accountStatusUnset
    } = useAccount();

    const {t, ...rest} = useTranslation();
    const selected = match?.params.item ?? 'assets';
    // const {depositProps} = useDeposit()

    const viewTemplate = React.useMemo(() => {
        switch (account.readyState) {
            case AccountStatus.UN_CONNECT:
                return <Box flex={1} display={'flex'} justifyContent={'center'} flexDirection={'column'} alignItems={'center'}
                >
                    <Typography marginY={3} variant={'h1'}>{t('describeTitleConnectToWallet')}</Typography>
                    <BtnConnect/>
                </Box>
                break
            case AccountStatus.LOCKED:
                return <Box flex={1} display={'flex'} justifyContent={'center'} flexDirection={'column'} alignItems={'center'}>
                    <Typography marginY={3} variant={'h1'}>{t('describeTitleLocked')}</Typography>
                    <BtnConnect/>
                </Box>
                break
            case AccountStatus.NO_ACCOUNT:
                return <Box flex={1} display={'flex'} justifyContent={'center'} flexDirection={'column'} alignItems={'center'}>
                    <Typography marginY={3} variant={'h1'}>{t('describeTitleNoAccount')}</Typography>
                    <BtnConnect/>
                </Box>
                break
            case AccountStatus.DEPOSITING:
                return <Box flex={1} display={'flex'} justifyContent={'center'} flexDirection={'column'} alignItems={'center'}
                >
                    <LoadingIcon color={'primary'} style={{width: 60, height: 60}}/>
                    <Typography marginY={3} variant={'h1'}>{t('describeTitleOpenAccounting')}</Typography>
                    {/*<BtnConnect/>*/}
                </Box>
                break
            case AccountStatus.ERROR_NETWORK:
                return <Box flex={1} display={'flex'} justifyContent={'center'} flexDirection={'column'} alignItems={'center'}
                >
                    <Typography marginY={3}
                                variant={'h1'}>{t('describeTitleOnErrorNetwork', {connectName: account.connectName})}</Typography>
                    {/*<BtnConnect/>*/}
                </Box>
                break
            case AccountStatus.ACTIVATED:
                return <>
                    <Box width={'200px'} display={'flex'} justifyContent={'stretch'} marginRight={3}
                        marginBottom={2}>
                        <SubMenu>
                            <SubMenuList selected={selected} subMenu={subMenu as any}/>
                        </SubMenu>
                    </Box>
                    <Box minHeight={420} display={'flex'} alignItems={'stretch'} flexDirection={'column'} marginTop={0}
                        flex={1}>

                        {selected === 'assets' && <AssetPanel/>}
                        {selected === 'my-liquidity' && <MyLiqudityPanel/>}
                        {selected === 'history' && <History/>}
                        {selected === 'transactions' && <TxPanel/>}
                        {selected === 'trades' && <TradePanel/>}
                        {selected === 'ammRecords' && <AmmPanel/>}
                        {selected === 'order' && <OrderPanel />}
                        {selected === 'setting' && <SettingPanel/>}
                    </Box>
                </>
            default:
                break
        }
    }, [t, account.readyState, selected])

    return <>
        {viewTemplate}
        {/*    {*/}

        {/*   */}
        {/*    readyState === AccountStatus.UN_CONNECT*/}
        {/*        ? <Redirect to="/"/>*/}
        {/*        :*/}
        {/*        readyState === AccountStatus.NO_ACCOUNT*/}
        {/*        || readyState === AccountStatus.DEPOSITING ?*/}
        {/*            <BoxStyle display={'flex'} flexWrap={'wrap'} alignItems={'center'} justifyContent={'center'}*/}
        {/*                      alignContent={'flex-start'}>*/}
        {/*                <DepositPanel  {...{*/}
        {/*                    ...rest, ...depositProps,*/}
        {/*                    title: t('depositTitleAndActive'),*/}
        {/*                    description: 'depositAndActiveDescription'*/}
        {/*                }} > </DepositPanel>*/}
        {/*            </BoxStyle> : <>*/}
        {/*                <Box width={'200px'} display={'flex'} justifyContent={'stretch'} marginRight={3} marginBottom={2}>*/}
        {/*                    <SubMenu>*/}
        {/*                        <SubMenuList selected={selected} subMenu={subMenu as any}/>*/}
        {/*                    </SubMenu>*/}
        {/*                </Box>*/}
        {/*                <Box minHeight={420} display={'flex'} alignItems={'stretch'} flexDirection={'column'} marginTop={0}*/}
        {/*                     flex={1}>*/}
        {/*                    {readyState === AccountStatus.LOCKED ?*/}
        {/*                        <>*/}
        {/*                            {*/}
        {/*                                selected === 'setting' ? <SettingPanel/> :*/}
        {/*                                    <Box flex={1} display={'flex'} justifyContent={'center'} alignItems={'center'}*/}
        {/*                                         marginTop={-10}>*/}
        {/*                                        <BtnConnect/>*/}
        {/*                                    </Box>*/}

        {/*                            }*/}
        {/*                        </> :*/}
        {/*                       */}

        {/*                    }*/}


        {/*                </Box>*/}
        {/*            </>*/}
        {/*}*/}
    </>


}
