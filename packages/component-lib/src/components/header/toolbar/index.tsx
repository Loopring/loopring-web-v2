import { Box, IconButton, Link, } from '@mui/material';
import {
    DownloadIcon,
    // DropDownIcon,
    // i18n,
    // LanguageType,
    NotificationIcon, SettingIcon,
    // ThemeDarkIcon,
    // ThemeLightIcon,
    // ThemeType,
} from '@loopring-web/common-resources';
// import React from 'react';
import { WithTranslation } from 'react-i18next';
import { bindHover, usePopupState } from 'material-ui-popup-state/hooks';
import { bindPopper } from 'material-ui-popup-state/es';
import {
    // OutlineSelect,
    // OutlineSelectItem,
    PopoverPure } from '../../basic-lib';
import { SettingPanel } from '../../block/SettingPanel';
import { QRCodePanel } from '../../modal';
// import { useSettings } from '../../../stores';
import { myLog } from '@loopring-web/common-resources'

export const BtnDownload = ({
                                t,
                                url,
                                i18nTitle,
                                i18nDescription,
                                ...rest
                            }: & { i18nTitle: string, i18nDescription: string, url: string } & WithTranslation) => {
    const popupState = usePopupState({variant: 'popover', popupId: 'download-QRcode'});
    const Description = () => <Link target={'_blank'} href='https://loopring.pro'>{t(i18nDescription)}</Link>

    myLog('BtnDownload url:', url)
    return <Box>
        <IconButton aria-label={t('labeldownloadApp')} {...bindHover(popupState)}><DownloadIcon/></IconButton>
        <PopoverPure
            // type={PopoverType.hover}
            {...bindPopper(popupState)}
            //popupId="wallet-connect-notification"
            // popoverContent={}
            //arrowHorizon={{right: 98}}
            // className={'arrow-center'}
            anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'center',
            }}
            transformOrigin={{
                vertical: 'top',
                horizontal: 'center',
            }}
        >
            <Box margin={3}><QRCodePanel {...{
                ...rest, title: t(i18nTitle), description: <Description/>,
                url, t
            }} /></Box>
        </PopoverPure>
    </Box>
}


export const BtnNotification = ({t}: any) => <IconButton
    aria-label={t('alert message')}><NotificationIcon/></IconButton>


export const BtnSetting = ({t, label}: any) => {
    const popupState = usePopupState({variant: 'popover', popupId: 'settingPop'});
    return<Box>
            <IconButton aria-label={t(label)} {...bindHover(popupState)}><SettingIcon/></IconButton>
            <PopoverPure
                // type={PopoverType.hover}
                {...bindPopper(popupState)}

                //popupId="wallet-connect-notification"
                // popoverContent={}
                //arrowHorizon={{right: 98}}
                // className={'arrow-center'}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'center',
                }}
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'center',
                }}
            >
                {/*<ClickAwayListener onClickAway={()=>{popupState.setOpen(false)}}>*/}
                   <Box margin={2}> <SettingPanel/>  </Box>
                {/*</ClickAwayListener>*/}
            </PopoverPure>
        </Box>
}


export * from './Interface';
export * from './WalletConnect';