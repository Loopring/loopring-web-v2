import { Box, IconButton, Link } from '@material-ui/core';
import {
    DownloadIcon,
    DropDownIcon,
    LanguageType,
    NotificationIcon,
    ThemeDarkIcon,
    ThemeLightIcon,
    ThemeType,
} from 'static-resource';
import React from 'react';
import { QRCodePanel } from '../../modal';
import { WithTranslation } from 'react-i18next';
import { bindHover, usePopupState } from 'material-ui-popup-state/hooks';
import { bindPopper } from 'material-ui-popup-state/es';
import { OutlineSelect, OutlineSelectItem, PopoverPure } from '../../basic-lib';
import i18n from '../../../static-resource/src/i18n';
import { useSettings } from '../../../stores';


export const BtnDownload = ({
                                t,
                                url,
                                i18nTitle,
                                i18nDescription,
                                ...rest
                            }: & { i18nTitle: string, i18nDescription: string, url: string } & WithTranslation) => {
    const popupState = usePopupState({variant: 'popover', popupId: 'download-QRcode'});
    const Description = () => <Link
        href='https://apps.apple.com/us/app/loopring-smart-wallet/id1550921126'>{t(i18nDescription)}</Link>
    return <div>
        <IconButton aria-label={t('labeldownloadApp')} {...bindHover(popupState)}><DownloadIcon/></IconButton>
        <PopoverPure
            // type={PopoverType.hover}
            {...bindPopper(popupState)}
            //popupId="wallet-connect-notification"
            // popoverContent={}
            //arrowHorizon={{right: 98}}
            className={'arrow-center'}
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
    </div>
}


export const BtnNotification = ({t}: any) => <IconButton
    aria-label={t('alert message')}><NotificationIcon/></IconButton>
export const BtnTheme = ({t, handleClick}: any) => {
    const {themeMode} = useSettings()
    //const [mode, setMode] = React.useState(themeMode)
    const _handleClick = React.useCallback(() => {
        // setMode(mode === ThemeType.dark ? ThemeType.light : ThemeType.dark)
        if (handleClick) {
            handleClick(themeMode)
        }
    }, [themeMode, handleClick])
    return <IconButton aria-label={t('change theme')} onClick={_handleClick}>
        {themeMode === ThemeType.dark ? <ThemeDarkIcon/> : <ThemeLightIcon/>}</IconButton>
}


export const BtnLanguage = ({t, label, handleChange}: any) => {
    const _handleChange = React.useCallback((event: React.ChangeEvent<any>) => {
        if (handleChange) {
            handleChange(event.target.value);
        }
    }, [handleChange]);
    return <OutlineSelect aria-label={t(label)} IconComponent={DropDownIcon}
                          labelId="language-selected"
                          id="language-selected"
                          value={i18n.language} autoWidth
                          onChange={_handleChange}>
        <OutlineSelectItem value={LanguageType.en_US}>EN</OutlineSelectItem>
        <OutlineSelectItem value={LanguageType.zh_CN}>中文</OutlineSelectItem>
    </OutlineSelect>
}


export * from './Interface';
export * from './WalletConnect';