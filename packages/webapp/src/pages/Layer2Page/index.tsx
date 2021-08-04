import { useRouteMatch } from 'react-router'

import { Box } from '@material-ui/core'
import {
    AccountStep,
    Button,
    DepositPanel,
    SubMenu,
    SubMenuList as BasicSubMenuList,
    useOpenModals,
} from '@loopring-web/component-lib'
import { useTranslation, withTranslation } from 'react-i18next'
import styled from '@emotion/styled'
import { AccountStatus, fnType, subMenuLayer2 } from '@loopring-web/common-resources'

import TxPanel from './TxPanel'
import AssetPanel from './AssetPanel'
import TradePanel from './TradePanel'
import AmmPanel from './AmmPanel'
import { SettingPanel } from '../SettingPage';
import { useModalProps } from '../../layouts/header/hook';
import { Redirect } from 'react-router-dom'
import React from 'react';
import { useAccount } from '../../stores/account';
import { accountStaticCallBack, bntLabel, btnClickMap } from '../../layouts/connectStatusCallback';
import { deepClone } from '../../utils/obj_tools';
import store from '../../stores';
import { useCustomDCEffect } from '../../hooks/common/useCustomDCEffect';

export const subMenu = subMenuLayer2;
const BoxStyle = styled(Box)`
  ${({theme}) => `
    background-color: ${theme.colorBase.background().default};
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
    const [label,setLabel]  = React.useState(undefined);
    const { status: accountStatus} = useAccount();
    const _btnClickMap: typeof btnClickMap = Object.assign(deepClone(btnClickMap));
    useCustomDCEffect(() => {
        setLabel(accountStaticCallBack(bntLabel));
    }, [accountStatus])
    return <Button variant={'contained'} size={'large'} color={'primary'} fullWidth={true}
                   style={{maxWidth: '280px'}} onClick={()=>{accountStaticCallBack(_btnClickMap, [])}
    }>{t(label)}
    </Button>
}) as typeof Button
const SubMenuList = withTranslation(['layout', 'common'], {withRef: true})(BasicSubMenuList);
export const Layer2Page = () => {

    let match: any = useRouteMatch("/layer2/:item")
    const {account: {readyState}} = useAccount()
    const {t, ...rest} = useTranslation();
    const selected = match?.params.item ?? 'assets';
    const {depositProps} = useModalProps();

    return <>  {
        readyState === AccountStatus.UN_CONNECT
            ? <Redirect to="/"/>
            :
            readyState === AccountStatus.NO_ACCOUNT
            || readyState === AccountStatus.DEPOSITING ?
                <BoxStyle display={'flex'} flexWrap={'wrap'} alignItems={'center'} justifyContent={'center'}
                          alignContent={'flex-start'}>
                    <DepositPanel  {...{
                        ...rest, ...depositProps,
                        title: t('depositTitleAndActive'),
                        description: 'depositAndActiveDescription'
                    }} > </DepositPanel>
                </BoxStyle> : <>
                    <Box width={'200px'} display={'flex'} justifyContent={'stretch'} marginRight={3} marginBottom={2}>
                        <SubMenu>
                            <SubMenuList selected={selected} subMenu={subMenu as any}/>
                        </SubMenu>
                    </Box>
                    <Box minHeight={420} display={'flex'} alignItems={'stretch'} flexDirection={'column'} marginTop={0}
                         flex={1}>
                        {readyState === AccountStatus.LOCKED ?
                            <>
                                {
                                    selected === 'setting' ? <SettingPanel/> :
                                        <Box flex={1} display={'flex'} justifyContent={'center'} alignItems={'center'}
                                             marginTop={-10}>
                                            <BtnConnect/>
                                        </Box>

                                }
                            </> :
                            <>
                                {selected === 'assets' && <AssetPanel/>}
                                {selected === 'transactions' && <TxPanel/>}
                                {selected === 'trades' && <TradePanel/>}
                                {selected === 'ammRecords' && <AmmPanel/>}
                                {/* {selected === 'orders' && <OrderPanel />} */}
                                {selected === 'setting' && <SettingPanel/>}
                            </>

                        }


                    </Box>
                </>
    }
    </>


}
