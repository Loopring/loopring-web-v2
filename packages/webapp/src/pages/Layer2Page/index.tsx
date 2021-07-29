import { useRouteMatch } from 'react-router'

import { Box, Paper } from '@material-ui/core'
import {
    DepositPanel,
    SubMenu,
    Button,
    SubMenuList as BasicSubMenuList, setShowAccountInfo, useOpenModals,
} from '@loopring-web/component-lib'
import { useTranslation, withTranslation } from 'react-i18next'
import styled from '@emotion/styled'
import { subMenuLayer2 } from '@loopring-web/common-resources'

import TxPanel from './TxPanel'
import AssetPanel from './AssetPanel'
import TradePanel from './TradePanel'
import AmmPanel from './AmmPanel'
import { SettingPanel } from '../SettingPage';
// import { AccountStatus } from '../../state_machine/account_machine_spec';
import { useModalProps } from '../../layouts/header/hook';
import { Redirect } from 'react-router-dom'
import React from 'react';
import { AccountStatus, useAccount } from '../../stores/account';

export const subMenu = subMenuLayer2;
const BoxStyle = styled(Box)`
  ${({theme})=>`
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
const BtnConnect = withTranslation(['common'], { withRef: true })( ({t}:any)=>{
    const {setShowAccountInfo} = useOpenModals();
    const showAccountInfo = React.useCallback(()=>{
        setShowAccountInfo({isShow: true})
     
    },[setShowAccountInfo])
    return <Button  variant={'contained'} size={'large'} color={'primary'} fullWidth={true}
                   style={{maxWidth:'280px'}} onClick={ showAccountInfo }>{t(`labelUnlockAccount`) }
    </Button>
}) as typeof Button
const SubMenuList = withTranslation(['layout','common'], { withRef: true })(BasicSubMenuList);
export const Layer2Page = () => {

    let match: any = useRouteMatch("/layer2/:item")
    const {account:{readyState}} = useAccount()
    const {t,...rest} = useTranslation();
    const selected = match?.params.item ?? 'assets';
    const {depositProps} = useModalProps();

    return <>  {
        readyState === AccountStatus.RESET  || readyState === AccountStatus.UN_CONNECT
            ? <Redirect to="/" />
            :
            readyState === AccountStatus.NO_ACCOUNT
    || readyState === AccountStatus.DEPOSITING?
        <BoxStyle display={'flex'} flexWrap={'wrap'} alignItems={'center'} justifyContent={'center'} alignContent={'flex-start'}>
            <DepositPanel  {...{
                ...rest, ...depositProps,
                title: t('depositTitleAndActive'),
                description: 'depositAndActiveDescription'
            }} > </DepositPanel>
        </BoxStyle>: <>
            <Box width={'200px'} display={'flex'} justifyContent={'stretch'} marginRight={3} marginBottom={2}>
                <SubMenu>
                    <SubMenuList selected={selected} subMenu={subMenu as any} />
                </SubMenu>
            </Box>
            <Box minHeight={420} display={'flex'} alignItems={'stretch'} flexDirection={'column'} marginTop={0} flex={1}>
                {readyState === AccountStatus.LOCKED ?
                <>
                    {
                        selected === 'setting' ? <SettingPanel /> :
                            <Box flex={1} display={'flex'} justifyContent={'center'} alignItems={'center'} marginTop={-10}>
                                <BtnConnect  />
                            </Box>

                    }
                </> :
                <>
                    {selected === 'assets' && <AssetPanel />}
                    {selected === 'transactions' && <TxPanel />}
                    {selected === 'trades' && <TradePanel />}
                    {selected === 'ammRecords' && <AmmPanel />}
                    {/* {selected === 'orders' && <OrderPanel />} */}
                    {selected === 'setting' && <SettingPanel />}
                </>

                }



            </Box>
        </>
    }
        </>



}
