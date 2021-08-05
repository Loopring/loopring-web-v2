import { WalletConnectBtnProps } from './Interface';
import { useTranslation } from 'react-i18next';
import React, { useEffect } from 'react';
import { AccountStatus, EmbarIcon, getShortAddr, LoadingIcon, LockIcon, } from '@loopring-web/common-resources';
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

  // .icon-build{
    //   color: ${({theme}) => theme.colorBase.secondary};
  // }
  .icon-no-network {
    color: ${({theme}) => theme.colorBase.error};
  }

  .icon-pending, .icon-progressing {
    color: ${({theme}) => theme.colorBase.secondary};
  }

  .icon-error, .icon-no-account {
    color: ${({theme}) => theme.colorBase.error};
  }


  .icon-success {
    color: ${({theme}) => theme.colorBase.success};
  }

`
const TestNetworkStyle = styled(Typography)`
  position: relative;
  padding-right: ${({theme}) => theme.unit}px;
  color: ${({theme}) => theme.colorBase.secondary};
  cursor:initial;
  &:after {
    position: absolute;
    z-index: -1;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    opacity: .1;
    background: ${({theme}) => theme.colorBase.secondary}px;
    ${({theme}) => theme.border.defaultFrame({d_W: 0, d_R: 1 / 2, c_key: theme.colorBase.backgroundBox})};
  } ${({theme}) => theme.border.defaultFrame({d_W: 0, d_R: 1 / 2, c_key: theme.colorBase.backgroundBox})};

` as typeof Typography
// const ListStyled = styled(List)`
//   margin: 0;
//   width: 240px;
// `

export const WalletConnectBtn = ({
                                     accountState,
                                     handleClick,
                                 }: WalletConnectBtnProps ) => {
    const {t,i18n} = useTranslation(['layout','common']);
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
                    setLabel('labelConnectWallet');
                    break
                case AccountStatus.LOCKED:
                    setBtnClassname('locked')
                    setIcon(<LockIcon/>)
                    break
                case AccountStatus.ACTIVATED:
                    setBtnClassname('unlocked')
                    setIcon(undefined)
                    break
                case AccountStatus.NO_ACCOUNT:
                    setBtnClassname('no-account')
                    setIcon(<EmbarIcon color={'secondary'} style={{transform:'rotate(58deg)'}}/>)
                    break
                case AccountStatus.DEPOSITING:
                    setBtnClassname('no-depositing')
                    setIcon(<LoadingIcon/>)
                    break
                case AccountStatus.ERROR_NETWORK:
                    setBtnClassname('wrong-network')
                    setLabel('labelWrongNetwork')
                    setIcon(<EmbarIcon color={'error'} style={{transform:'rotate(58deg)'}}/>)
                    break
                default:
            }
            if (account && account._chainId === 5) {
                setNetworkLabel('Görli')
            } else if (account && account._chainId !== 1) {
                setBtnClassname('wrong-network')
                setNetworkLabel(undefined)
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
        {networkLabel ? <TestNetworkStyle component={'span'}>{networkLabel}</TestNetworkStyle> : <></>}
        <WalletConnectBtnStyled variant={'outlined'} size={'medium'} color={'primary'}
                                className={`wallet-btn ${btnClassname}`}
                                onClick={_handleClick} {...bindHover(popupState)} >
            <Typography component={'i'} paddingRight={1}>{icon}</Typography>
            <Typography component={'span'}> {t(label)}  </Typography>
        </WalletConnectBtnStyled>
    </>

}