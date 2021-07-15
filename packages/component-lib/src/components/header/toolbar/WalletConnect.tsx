import { WalletConnectBtnProps } from './Interface';
import { WithTranslation } from 'react-i18next';
import React from 'react';
import { globalSetup, LockIcon, NoNetWorkIcon, WalletStatus } from '@loopring-web/common-resources';
import { debounce } from 'lodash';
import { Typography } from '@material-ui/core';

import loadingSvg from '@loopring-web/common-resources/assets/svg/loading.svg';
import styled from '@emotion/styled';
import { Button } from '../../basic-lib';
import { bindHover, usePopupState } from 'material-ui-popup-state/hooks';
// import Popover from 'material-ui-popup-state/HoverPopover';
const BtnWalletConnectStyled = styled(Button)`
  text-transform: none;

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
// const ListStyled = styled(List)`
//   margin: 0;
//   width: 240px;
// `

export const BtnWalletConnect = ({
                                     t,
                                     label,
                                     status = undefined,
                                     // notificationList,
                                     wait = globalSetup.wait,
                                     handleClick,
                                 }: WalletConnectBtnProps & WithTranslation) => {
    let disabled = undefined, loading = undefined, connect = false, accountPending = false, unlock = false,
        noAccount = false, noNetwork = false;
    // const [notificationStatus, setNotificationStatus] = React.useState(WalletNotificationStatus.none)
    switch (status) {
        case WalletStatus.disabled:
            disabled = true;
            break;
        case WalletStatus.loading:
            loading = true;
            break;
        case WalletStatus.noAccount:
            noAccount = true;
            break;
        case WalletStatus.accountPending:
            accountPending = true;
            break;
        case WalletStatus.unlock:
            unlock = true;
            break;
        case WalletStatus.noNetwork:
            noNetwork = true;
            break;
        default:
            connect = false;
            break;
    }
    const debounceCount = React.useCallback(debounce(({...props}: any) => {
        if (handleClick) {
            handleClick(props)
        }
    }, wait), [handleClick])
    const _handleClick = (event: React.MouseEvent) => {
        debounceCount(event)
    }
    // const notificationRender = React.useMemo(() => {
    //     let error = 0, pending = 0, success = 0;
    //     const jsx = notificationList.map(({status, message, handleClick}: WalletNotificationInterface, index) => {
    //         let startIcon: { iconItem: any, className: any } = {iconItem: undefined, className: ''};
    //         switch (status) {
    //             case 'error':
    //                 error++;
    //                 startIcon = {
    //                     iconItem: <AlertIcon/>,
    //                     className: 'alert-error error',
    //                 }
    //
    //                 break;
    //             case 'pending':
    //                 pending++;
    //                 startIcon = {
    //                     iconItem: <PendingIcon/>,
    //                     className: 'alert-pending pending',
    //                 }
    //
    //                 break;
    //             case 'success':
    //                 success++;
    //                 startIcon = {
    //                     iconItem: <CheckIcon/>,
    //                     className: 'alert-success success',
    //                 }
    //                 break;
    //             default:
    //                 break
    //         }
    //         return <WalletNotificationListItem  {...{
    //             ...rest,
    //             t,
    //             handleClick,
    //             startIcon: startIcon,
    //             label: {id: message}
    //         }} key={index}></WalletNotificationListItem>
    //
    //
    //     })
    //
    //     setNotificationStatus(error ? WalletNotificationStatus.error : pending ?
    //         WalletNotificationStatus.pending : success ? WalletNotificationStatus.success : WalletNotificationStatus.none)
    //     return jsx;
    // }, [notificationList, setNotificationStatus, t])
    const popupState = usePopupState({variant: 'popover', popupId: `popupId: 'wallet-connect-notification'`});
    return <>
        <BtnWalletConnectStyled variant={'outlined'} size={'medium'} color={'primary'}
                                className={'wallet-btn'}
                                disabled={disabled} onClick={_handleClick} {...bindHover(popupState)} >

            {noNetwork ? <Typography component={'i'} height={20}
                                     className={'icon-no-network icon-error'}><NoNetWorkIcon/></Typography> :
                loading ? <Typography component={'i'} height={20}><img width={20} height={20} src={loadingSvg}
                                                                       alt={'loading'}/></Typography>
                    : unlock ? <></>
                    // <Typography component={'i'} height={20}
                    //                        className={`icon-notification icon-success`}></Typography>
                    : connect || accountPending || noAccount ? <Typography component={'i'} height={20}
                        // icon-${notificationStatus}
                                                                           className={`icon-notification icon-error`}><LockIcon/></Typography> : ''
            }

            <Typography component={'span'}> {t(label)}  </Typography>
        </BtnWalletConnectStyled>
    </>

}