import { WalletConnectBtnProps } from './Interface';
import { useTranslation } from 'react-i18next';
import React, { useEffect } from 'react';
import { AccountStatus, getShortAddr, LoadingIcon, LockIcon, UnConnectIcon, } from '@loopring-web/common-resources';
// import { debounce } from 'lodash';
import { Typography } from '@material-ui/core';

// import loadingSvg from '@loopring-web/common-resources/assets/svg/loading.svg';
import styled from '@emotion/styled';
import { Button } from '../../basic-lib';
import { bindHover, usePopupState } from 'material-ui-popup-state/hooks';
// import { getShortAddr } from '@loopring-web/webapp/src/utils/web3_tools';
// import Popover from 'material-ui-popup-state/HoverPopover';
const WalletConnectBtnStyled = styled(Button)`
  text-transform: none;
  min-width: 120px;

  &.wallet-btn {
    //width:;
    width: var(--walletconnect-width);
  }

  i {
    padding-right: ${({theme}) => theme.unit}px;
    display: flex;
    justify-content: center;
    align-content: space-between;

    svg {
      height: auto;
      font-size: ${({theme}) => theme.fontDefault.h5};
    }
  }

  &.no-account {
    &:after {
      position: absolute;
      content: "\u25CF";
      color: var(--color-error);
      display: flex;
      left: 0;
      padding-left: ${({theme}) => theme.unit * 2}px;
      align-items: center;
      font-size: ${({theme}) => theme.fontDefault.h5};
    }
  }

  &.unlocked {
    &:after {
      position: absolute;
      content: "\u25CF";
      color: var(--color-success);
      display: flex;
      left: 0;
      padding-left: ${({theme}) => theme.unit * 2}px;
      align-items: center;
      font-size: ${({theme}) => theme.fontDefault.h5};
    }
  }

  &.wrong-network {
    background: var(--color-error);
    color: var(--color-text-primary);
  }

  // .icon-build{
  //   color: var(--color-secoundary);
  // }
  // .icon-no-network {
  //   color: var(--color-error);
  // }
  //
  // .icon-pending, .icon-progressing {
  //   color: var(--color-secoundary);
  // }
  //
  // .icon-error, .icon-no-account {
  //   color: var(--color-error);
  // }
  //
  //
  // .icon-success {
  //   color: var(--color-success);
  // }

`
const TestNetworkStyle = styled(Typography)`
  // display: inline-flex;
  position: relative;
    // padding-right: ${({theme}) => theme.unit}px;
  // cursor: initial;
  height: 3rem;

  &:after {
    content: '';
    position: absolute;
    z-index: -1;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: var(--network-bg);
    ${({theme}) => theme.border.defaultFrame({d_W: 0, d_R: 1 / 2, c_key: 'var(--opacity)'})};
  }

  ${({theme}) => theme.border.defaultFrame({d_W: 0, d_R: 1 / 2, c_key: 'var(--opacity)'})};

` as typeof Typography
// const ListStyled = styled(List)`
//   margin: 0;
//   width: 240px;
// `

export const WalletConnectBtn = ({
                                     accountState,
                                     handleClick,
                                 }: WalletConnectBtnProps) => {
    const {t, i18n} = useTranslation(['layout', 'common']);
    const [label, setLabel] = React.useState<string>(t('labelConnectWallet'))
    const [networkLabel, setNetworkLabel] = React.useState<string | undefined>(undefined)
    const [btnClassname, setBtnClassname] = React.useState<string | undefined>('');
    const [icon, setIcon] = React.useState<JSX.Element | undefined>();

    useEffect(() => {
        if (accountState) {// && accountState.status === 'UNSET'){
            const {account} = accountState;
            const addressShort = account.accAddress ? getShortAddr(account?.accAddress) : undefined;
            if (addressShort) {
                setLabel(addressShort);
            }
            setIcon(undefined)
            switch (account.readyState) {
                case AccountStatus.UN_CONNECT:
                    setBtnClassname('un-connect')
                    setLabel('labelConnectWallet');
                    break
                case AccountStatus.LOCKED:
                    setBtnClassname('locked')
                    setIcon(<LockIcon color={'error'} style={{width:16,height:16}}/>)
                    break
                case AccountStatus.ACTIVATED:
                    setBtnClassname('unlocked')
                    // setIcon(undefined)
                    break
                case AccountStatus.NO_ACCOUNT:
                    setBtnClassname('no-account')
                    // setIcon(<EmbarIcon color={'secondary'} style={{transform: 'rotate(58deg)'}}/>)
                    break
                case AccountStatus.DEPOSITING:
                    setBtnClassname('depositing')
                    setIcon(<LoadingIcon color={'primary'} style={{width: 18, height: 18}}/>)
                    break
                case AccountStatus.ERROR_NETWORK:
                    setBtnClassname('wrong-network')
                    setLabel('labelWrongNetwork')
                    setIcon(<UnConnectIcon style={{width:16,height:16}}/>)
                    break
                default:
            }
            if (account && account._chainId === 5) {
                setNetworkLabel('Görli')
            } else {
                setNetworkLabel('')
            }
        } else {
            setLabel('labelConnectWallet')
        }

    }, [accountState, i18n])


    const _handleClick = (event: React.MouseEvent) => {
        // debounceCount(event)
        handleClick(event)
    }

    const popupState = usePopupState({variant: 'popover', popupId: `popupId: 'wallet-connect-notification'`});
    return <>
        {networkLabel ?
            <TestNetworkStyle display={'inline-flex'} alignItems={'center'} justifyContent={'center'} paddingX={1}
                              component={'span'} color={'var(--vip-text)'}
                              marginRight={1}>{networkLabel}</TestNetworkStyle> : <></>}
        <WalletConnectBtnStyled
            variant={['un-connect', 'wrong-network'].findIndex(ele => btnClassname === ele) !== -1 ? 'contained' : 'outlined'}
            size={['un-connect', 'wrong-network'].findIndex(ele => btnClassname === ele) !== -1 ? 'small' : 'medium'}
            color={'primary'}
            className={`wallet-btn ${btnClassname}`}
            onClick={_handleClick} {...bindHover(popupState)} >
            {icon ? <Typography component={'i'} paddingRight={1}>{icon}</Typography> : <></>}
            <Typography component={'span'} variant={'body1'} lineHeight={1}> {t(label)}  </Typography>
        </WalletConnectBtnStyled>
    </>

}