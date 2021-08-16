import { Trans, WithTranslation, withTranslation } from 'react-i18next';
import { Box, Button, Divider, Grid, Typography } from '@material-ui/core/';
import styled from '@emotion/styled';
import {
    BtnLanguage,
    OutlineSelect,
    OutlineSelectItem,

    useSettings,
    TypographyStrong
} from '../../';
import Switch from '@material-ui/core/Switch';
import React from 'react';
import { ButtonComponentsMap, Currency, DropDownIcon, headerToolBarData, LanguageKeys, UpColor } from '@loopring-web/common-resources';
import { useTheme } from '@emotion/react';



const StyledSwitch = styled(Switch)(({theme}) => ({
    "& .Mui-checked": {
        color: theme.colorBase.textPrimary,
        '& + .MuiSwitch-track.MuiSwitch-track': {
            border: `solid ${theme.colorBase.success}`,
        },
        '& .MuiSwitch-thumb': {
            backgroundColor: theme.colorBase.success,
        }
    },
    '& .MuiSwitch-track': {
        border: `solid ${theme.colorBase.error}`,
        opacity: 1
    },
    '& .MuiSwitch-thumb': {
        backgroundColor: theme.colorBase.error,
    }
}));

export const BtnCurrency = ({t, currency, label, handleChange}: any) => {
    const [state, setState] = React.useState<string>(currency ? currency : Currency.dollar);
    const _handleChange = React.useCallback((event: React.ChangeEvent<any>) => {
        setState(event.target.value);
        if (handleChange) {

            handleChange(event.target.value)
        }
    }, [handleChange])
    return <OutlineSelect aria-label={t(label)} IconComponent={DropDownIcon}
                          labelId="language-selected"
                          id="language-selected"
                          value={state} autoWidth
                          onChange={_handleChange}>
        <OutlineSelectItem value={Currency.dollar}>$ {t('labelUSDollar')}</OutlineSelectItem>
        <OutlineSelectItem value={Currency.yen}>¥ {t('labelCNYYuan')}</OutlineSelectItem>
    </OutlineSelect>
}

const StyledDivider = styled(Divider)`
  margin: ${({theme}) => theme.unit}px 0 ${({theme}) => theme.unit}px 0px;
`





export const SettingPanel = withTranslation(['common', 'layout'])(({t, ...rest}: & WithTranslation) => {
    const theme = useTheme();
    const {setUpColor, setCurrency, setLanguage, currency, upColor} = useSettings()

    // const handleOnLanguageChange = (value: any) => {
    //
    //     setLanguage(value)
    // }
    const handleOnCurrencyChange = (value: any) => {
        setCurrency(value);
    }
    const handleColorChange = (e: any) => {
        if (e.target.checked) {
            setUpColor(UpColor.green);
        } else {
            setUpColor(UpColor.red);
        }
    }


    return <Box display={'flex'} flexDirection={'column'} justifyContent={'space-between'} alignItems={'stretch'}>
        {/*<Typography variant={'h5'} component={'h3'} marginY={1}>{t('labelTitleSecurity')}</Typography>*/}
        <Box component={'section'} display={'flex'} flexDirection={'column'}>
            <Typography variant={'h6'} component={'h4'} paddingX={2}>{t('labelTitleResetL2Keypair')}</Typography>
            <StyledDivider/>
            <Grid container display={'flex'} flexDirection={'row'} justifyContent={'stretch'}
                  alignItems={'flex-start'} paddingX={2} marginBottom={2}>
                <Grid item xs={8} display={'flex'} flexDirection={'column'}>
                    <Typography variant={'body1'} component={'p'}>
                        <Trans i18nKey="resetDescription">
                            Create a new signing key for layer-2 authentication (no backup needed). This will
                            <TypographyStrong component={'span'}>cancel all your pending orders</TypographyStrong>.
                        </Trans>
                    </Typography>
                </Grid>
                <Grid item xs={4} display={'flex'} flexDirection={'column'} justifyContent={'space-evenly'}
                      alignItems={'flex-end'} alignSelf={'stretch'}>
                    <Button variant={'outlined'} size={'medium'} color={'primary'}>{t('labelBtnReset')}</Button>
                    <Typography variant={'body1'} component={'p'}
                                paddingTop={1}>{t('labelHadChangPassword', {passDay: '14 hours'})}</Typography>
                </Grid>
            </Grid>
        </Box>


        <Box component={'section'} display={'flex'} flexDirection={'column'}>
            <Typography variant={'h6'} component={'h4'} paddingX={2}>{t('labelTitleExportAccount')}</Typography>
            <StyledDivider/>
            <Grid container display={'flex'} flexDirection={'row'} justifyContent={'stretch'}
                  alignItems={'flex-start'} paddingX={2} marginBottom={2}>
                <Grid item xs={7} display={'flex'} flexDirection={'column'}>
                    <Typography variant={'body1'} component={'p'}>{t('descriptionExportAccount')}</Typography>
                </Grid>
                <Grid item xs={5} display={'flex'} flexDirection={'column'} justifyContent={'space-evenly'}
                      alignItems={'flex-end'} alignSelf={'stretch'}>
                    <Grid item> <Button variant={'outlined'} size={'medium'}
                                        color={'primary'}>{t('labelBtnExportAccount')}</Button></Grid>
                </Grid>
            </Grid>
        </Box>
        <Box component={'section'} display={'flex'} flexDirection={'column'}>
            <Typography variant={'h6'} component={'h4'} paddingX={2}>{t('labelTitleLayout')}</Typography>
            <StyledDivider/>
            <Grid container display={'flex'} flexDirection={'row'} justifyContent={'stretch'}
                  alignItems={'flex-start'} paddingX={2} marginBottom={2}>
                <Grid item xs={7} display={'flex'} flexDirection={'column'}>
                    <Typography variant={'body1'} component={'p'}>{t('labelLanguage')}</Typography>
                </Grid>
                <Grid item xs={5} display={'flex'} flexDirection={'column'} justifyContent={'space-evenly'}
                      alignItems={'flex-end'} alignSelf={'stretch'}>
                    <Grid item>
                        <BtnLanguage {...{
                            t,
                            ...rest,
                            ...headerToolBarData[ ButtonComponentsMap.Language ],
                            handleChange: (language: LanguageKeys) => {
                                setLanguage(language)
                            }
                        }}></BtnLanguage>
                    </Grid>
                </Grid>
            </Grid>
            <Grid container display={'flex'} flexDirection={'row'} justifyContent={'stretch'}
                  alignItems={'flex-start'} paddingX={2} marginBottom={2}>
                <Grid item xs={7} display={'flex'} flexDirection={'column'}>
                    <Typography variant={'body1'} component={'p'}>{t('labelCurrency')}</Typography>
                </Grid>
                <Grid item xs={5} display={'flex'} flexDirection={'column'} justifyContent={'space-evenly'}
                      alignItems={'flex-end'} alignSelf={'stretch'}>
                    <Grid item>
                        <BtnCurrency {...{
                            t, ...rest,
                            currency,
                            label: 'currencySetting',
                            handleChange: handleOnCurrencyChange
                        }}></BtnCurrency>

                    </Grid>
                </Grid>
            </Grid>
            <Grid container display={'flex'} flexDirection={'row'} justifyContent={'stretch'}
                  alignItems={'flex-start'} paddingX={2}>
                <Grid item xs={7} display={'flex'} flexDirection={'column'}>
                    <Typography variant={'body1'} component={'p'}>{t('labelColors')}</Typography>
                </Grid>
                <Grid item xs={5} display={'flex'} flexDirection={'row'} justifyContent={'flex-end'}
                      alignItems={'center'} alignSelf={'stretch'}>
                    <Typography variant={'body1'} component={'span'} paddingX={2}>
                        <Trans i18nKey="whichColorIsUp">
                                <span style={{
                                    textTransform: 'capitalize',
                                    color: upColor === UpColor.green ? theme.colorBase.success : theme.colorBase.error
                                }}>{{up: upColor === UpColor.green ? t('labelgreen') : t('labelred')}} up</span>
                            and <span style={{
                            textTransform: 'capitalize',
                            color: upColor === UpColor.green ? theme.colorBase.error : theme.colorBase.success
                        }}>{{down: upColor === UpColor.green ? t('labelred') : t('labelgreen')}} down</span>
                        </Trans>
                    </Typography>
                    <StyledSwitch checked={upColor === UpColor.green} color="default"
                                  onChange={handleColorChange}/>

                </Grid>
            </Grid>
        </Box>
        {/*<Typography variant={'h5'} component={'h3'} marginY={1}>{t('labelTitlePreferences')}</Typography>*/}

            {/*<Box component={'section'} display={'flex'} flexDirection={'column'}>*/}
            {/*    <Typography variant={'h6'} component={'h4'} paddingX={2}>{t('labelTitleNotification')}</Typography>*/}
            {/*    <StyledDivider/>*/}
            {/*    <Grid container display={'flex'} flexDirection={'row'} justifyContent={'stretch'}*/}
            {/*          alignItems={'flex-start'} paddingX={2} marginBottom={2}>*/}
            {/*        <Grid item xs={8} display={'flex'} flexDirection={'column'}>*/}
            {/*            <Typography variant={'body1'} component={'p'}>{t('labelLanguage')}</Typography>*/}
            {/*        </Grid>*/}
            {/*        <Grid item xs={4} display={'flex'} flexDirection={'column'} justifyContent={'space-evenly'}*/}
            {/*              alignItems={'flex-end'} alignSelf={'stretch'}>*/}
            {/*            <Grid item> <Button variant={'outlined'} size={'medium'}*/}
            {/*                                color={'primary'}>{t('labelBtnExportAccount')}</Button></Grid>*/}
            {/*        </Grid>*/}
            {/*    </Grid>*/}
            {/*</Box>*/}


    </Box>
})



