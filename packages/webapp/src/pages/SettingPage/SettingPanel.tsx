import styled from '@emotion/styled';
import { Box, Button, Divider, Grid, Switch, Typography } from '@material-ui/core';
import React from 'react';
import { UpColor, Currency, DropDownIcon } from '@loopring-web/common-resources';
import {
    BtnLanguage,
    OutlineSelect,
    OutlineSelectItem, QRCodePanel,
    TypographyStrong, useSettings
} from '@loopring-web/component-lib';
import { Trans, useTranslation, WithTranslation, withTranslation } from 'react-i18next';
import { useTheme } from '@emotion/react';
import { LanguageKeys } from '@loopring-web/common-resources';

// const MuiModalStyled = styled(MuiModal)`
//   //background: ${({theme}) => theme.colorBase.background().secondary};
//   // .MuiBackdrop-root{
//   //   z-index: -1;
//   //   background-color: ${({theme}) => theme.colorBase.background().outline};
//   // }
//   display: flex;
//   align-items: center;
//   justify-content: center;
// ` as typeof MuiModal;
// const BlockStyled = styled(Box)`
//   ${({theme}) => theme.border.defaultFrame({c_key: 'blur', d_R: 1})};
//   background: ${({theme}) => theme.colorBase.background().secondary};
//   max-height: var(--panel-setting-height);
//   max-width: var(--panel-setting-width);
//   display: flex;
//   justify-content: space-around;
//   align-items: center;
//   overflow: scroll;
//   padding: ${({theme}) => theme.unit*8}px
// `;

const StyledPaper = styled(Grid)`
  width: 100%;
  height: 100%;
  background-color: ${({theme}) => theme.colorBase.background().default};
  border-radius: ${({ theme }) => theme.unit}px;
`
//${({theme}) => theme.border.defaultFrame({c_key: 'blur', d_R: 1})};

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
const DividerBlock = styled(Divider)`
  margin: 0;
  flex: 1;
  width: 1px;
  height: ${({theme}) => theme.unit * 3}px;
  background: ${({theme}) => theme.colorBase.focus};
`



export const SettingPanel = withTranslation(['common', 'layout'])(({t,i18n, ...rest}: & WithTranslation) => {
    const theme = useTheme();
    const {setUpColor,setLanguage,setCurrency,currency,upColor} = useSettings()
    const language = i18n.language;
    const handleOnLanguageChange = (lang: LanguageKeys) => {
        setLanguage(lang);
        i18n.changeLanguage(lang);
    }
    const handleOnCurrencyChange = (value: any) => {
        setCurrency(value);
    }
    const handleColorChange = (e:any) => {
        if(e.target.checked){
            setUpColor(UpColor.green) ;
        }else{
            setUpColor(UpColor.red);
        }
    }
    return <Grid container direction={'column'} justifyContent={'space-between'} alignItems={'stretch'} flexWrap={'nowrap'}>
        <Typography variant={'h4'} component={'h3'} paddingLeft={2}>{t('labelTitleSecurity')}</Typography>
        <StyledPaper item xs={12} display={'flex'} flexDirection={'column'} marginY={2}  paddingY={3}>
            <Box component={'section'} display={'flex'} flexDirection={'column'} marginBottom={1}>
                <Typography variant={'h5'} component={'h4'} paddingX={3}  marginBottom={1}>{t('labelTitleResetL2Keypair')}</Typography>
                {/*<StyledDivider/>*/}
                <Grid container display={'flex'} flexDirection={'row'} justifyContent={'stretch'}
                      alignItems={'flex-start'} paddingX={3} >
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
                        <Button variant={'outlined'} size={'medium'} color={'primary'} disabled={true}>{t('labelBtnReset')}</Button>
                    </Grid>
                    <Grid item xs={12} display={'flex'} flexDirection={'row'} justifyContent={'flex-end'}
                          alignItems={'center'} alignSelf={'stretch'}>
                        <Typography variant={'body2'} component={'p'}
                                    paddingTop={1}>{t('labelHadChangPassword', {passDay: '14 hours'})}</Typography>
                    </Grid>

                </Grid>
            </Box>
            <StyledDivider/>
            <Box component={'section'} display={'flex'} flexDirection={'column'}>
                <Typography variant={'h5'} component={'h4'} paddingX={3} marginY={1}>{t('labelTitleExportAccount')}</Typography>

                <Grid container display={'flex'} flexDirection={'row'} justifyContent={'stretch'}
                      alignItems={'flex-start'} paddingX={3} marginBottom={2}>
                    <Grid item xs={7} display={'flex'} flexDirection={'column'}>
                        <Typography variant={'body1'} component={'p'}>{t('descriptionExportAccount')}</Typography>
                    </Grid>
                    <Grid item xs={5} display={'flex'} flexDirection={'column'} justifyContent={'space-evenly'}
                          alignItems={'flex-end'} alignSelf={'stretch'}>
                        <Grid item> <Button variant={'outlined'} size={'medium'}
                                            color={'primary'} disabled={true}>{t('labelBtnExportAccount')}</Button></Grid>
                    </Grid>
                </Grid>
            </Box>
        </StyledPaper>

        <Typography variant={'h4'} component={'h3'} paddingLeft={2}>{t('labelTitlePreferences')}</Typography>
        <StyledPaper item xs={12} display={'flex'} flexDirection={'column'} marginY={2} paddingY={3}>
            <Box component={'section'} display={'flex'} flexDirection={'column'}>
                {/*<Typography variant={'h5'} component={'h4'} paddingX={2}>{t('labelTitleLayout')}</Typography>*/}
                {/*<StyledDivider/>*/}
                <Grid container display={'flex'} flexDirection={'row'} justifyContent={'stretch'}
                      alignItems={'flex-start'} paddingX={3} marginBottom={2}>
                    <Grid item xs={7} display={'flex'} flexDirection={'column'}>
                        <Typography variant={'body1'} component={'p'}>{t('labelLanguage')}</Typography>
                    </Grid>
                    <Grid item xs={5} display={'flex'} flexDirection={'column'} justifyContent={'space-evenly'}
                          alignItems={'flex-end'} alignSelf={'stretch'}>
                        <Grid item>
                            <BtnLanguage {...{
                                t, ...rest,
                                language,
                                label: 'languageSetting',
                                handleChange: handleOnLanguageChange
                            }}></BtnLanguage>
                        </Grid>
                    </Grid>
                </Grid>
                <StyledDivider/>
                <Grid container display={'flex'} flexDirection={'row'} justifyContent={'stretch'}
                      alignItems={'flex-start'} paddingX={3} marginY={2}>
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
                <StyledDivider/>
                <Grid container display={'flex'} flexDirection={'row'} justifyContent={'stretch'}
                      alignItems={'flex-start'} paddingX={3} marginTop={2}>
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

        </StyledPaper>

    </Grid>
})

// export const SettingPage = ({open,onClose}: { open:boolean, onClose:(e:any)=>void})=>{
//     return  <MuiModalStyled
//         open={open}
//         onClose={onClose}
//         aria-labelledby="modal-modal-title"
//         aria-describedby="modal-modal-description"
//     >
//         <BlockStyled >
//            <SettingPanel/>
//         </BlockStyled>
//     </MuiModalStyled>
// }


