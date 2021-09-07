import styled from '@emotion/styled';
import Switch from '@material-ui/core/Switch';
import { Box, Divider, FormControlLabel, Grid, Radio, RadioGroup, Typography } from '@material-ui/core';
import React from 'react';
import {
    Currency,
    DropDownIcon,
    i18n,
    LanguageType,
    ThemeType,
    UpColor
} from '@loopring-web/common-resources';
import { OutlineSelect, OutlineSelectItem } from '../basic-lib';
import { Trans, WithTranslation, withTranslation } from 'react-i18next';
import { useSettings } from '../../stores';

// const StyledSwitchColor = styled(Switch)(({theme}) => ({
//
//     "& .Mui-checked": {
//         color: theme.colorBase.textPrimary,
//         '& + .MuiSwitch-track.MuiSwitch-track': {
//             border: `solid ${theme.colorBase.success}`,
//         },
//         '& .MuiSwitch-thumb': {
//             backgroundColor: theme.colorBase.success,
//         }
//     },
//     '& .MuiSwitch-track': {
//         border: `solid ${theme.colorBase.error}`,
//         opacity: 1
//     },
//     '& .MuiSwitch-thumb': {
//         backgroundColor: theme.colorBase.error,
//     }
// }));
const StyledSwitch = styled(Switch)`
  margin:0;  
`;

const BoxStyle = styled(Box)(() => ({
    " .MuiInput-root":{
        background: 'var(--opacity)',
        textAlign: 'right',
    },
})) as typeof Box


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
  margin: 0;
`
const RadioGroupStyle = styled(RadioGroup)`
  margin: 0;
  .MuiFormControlLabel-root {
        margin-right: 0;
  }
`


export const BtnLanguage = ({t, label, handleChange}: any) => {
    const _handleChange = React.useCallback((event: React.ChangeEvent<any>) => {
        if (handleChange) {
            handleChange(event.target.value);
        }
    }, [handleChange]);
    return <OutlineSelect aria-label={t(label)} IconComponent={DropDownIcon}
                          labelId="language-selected"
                          id="language-selected"
                          value={i18n.language} 
                          onChange={_handleChange}>
        <OutlineSelectItem value={LanguageType.en_US}>English</OutlineSelectItem>
        <OutlineSelectItem value={LanguageType.zh_CN}>简体中文</OutlineSelectItem>
    </OutlineSelect>
}


export const SettingPanel = withTranslation(['common', 'layout'],{withRef:true})(({t, ...rest}: & WithTranslation) => {
    // const theme = useTheme();
    const {setUpColor, setCurrency, setLanguage, currency, upColor, setTheme, themeMode} = useSettings()

    const handleOnLanguageChange =React.useCallback( (value: any) => {

        setLanguage(value)
    } ,[setLanguage])
    const handleOnCurrencyChange =React.useCallback( (value: any) => {
        setCurrency(value);
    } ,[setCurrency])
    const handleColorChange = React.useCallback((_e: any,value) => {
        setUpColor(value);
    } ,[setUpColor])
    //const [mode, setMode] = React.useState(themeMode)
    const handleThemeClick = React.useCallback((e:any) => {

        if (e.target.checked) {
            setTheme(ThemeType.dark);
        } else {
            setTheme(ThemeType.light);
        }
    }, [themeMode])
    const updown = React.useCallback(({key})=>{
      return    <Typography component={'span'} variant={'body2'}><Trans i18nKey="whichColorIsUp" tOptions={{
          up: (key === UpColor.green ? t('labelgreen') : t('labelred')),
          down: (key === UpColor.green ? t('labelred') : t('labelgreen'))
      }} >
            <Typography component={'span'} variant={'body2'} style={{
                textTransform: 'capitalize',
                // color: key === UpColor.green ? theme.colorBase.success : theme.colorBase.error
            }}>color up</Typography>
            and <Typography component={'span'} variant={'body2'} style={{
            textTransform: 'capitalize',
            // color: key === UpColor.green ? theme.colorBase.error : theme.colorBase.success
        }}>color down</Typography>
      </Trans></Typography>
    },[UpColor])

    return         <BoxStyle component={'section'} display={'flex'} flexDirection={'column'} width={'var(--swap-box-width)'}>
        {/*<Typography variant={'h6'} component={'h4'} paddingX={2}>{t('labelTitleLayout')}</Typography>*/}
        <Grid container display={'flex'} flexDirection={'row'} justifyContent={'stretch'}
              alignItems={'center'} paddingX={2} marginY={2}>
            <Grid item xs={4} display={'flex'} flexDirection={'column'}>
                <Typography variant={'body1'} component={'p'} color={'textSecondary'}>{t('labelLanguage')}</Typography>
            </Grid>
            <Grid item xs={8} display={'flex'} flexDirection={'column'} justifyContent={'space-evenly'}
                  alignItems={'flex-end'} alignSelf={'stretch'}>
                <Grid item>
                    <BtnLanguage {...{
                        t,
                        ...rest,
                        handleChange: handleOnLanguageChange
                    }}></BtnLanguage>
                </Grid>
            </Grid>
        </Grid>
        <StyledDivider/>

        <Grid container display={'flex'} flexDirection={'row'} justifyContent={'stretch'}
              alignItems={'center'} paddingX={2} marginY={2}>
            <Grid item xs={4} display={'flex'} flexDirection={'column'}>
                <Typography variant={'body1'} component={'p'} color={'textSecondary'}>{t('labelCurrency')}</Typography>
            </Grid>
            <Grid item xs={8} display={'flex'} flexDirection={'column'} justifyContent={'space-evenly'}
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
              alignItems={'center'} paddingX={2} marginY={1}>
            <Grid item xs={4} display={'flex'} flexDirection={'column'}>
                <Typography variant={'body1'} component={'p'} color={'textSecondary'}>{t('labelColors')}</Typography>
            </Grid>
            <Grid item xs={8} display={'flex'} flexDirection={'column'} justifyContent={'center'}
                  alignItems={'flex-end'} alignSelf={'stretch'}>
                {/*<Typography variant={'body2'} component={'span'} paddingX={2} >*/}
                {/*    */}
                {/*</Typography>*/}
                {/*<Typography >*/}
                    <RadioGroupStyle row={false}  aria-label="withdraw" name="withdraw" value={upColor}
                                onChange={handleColorChange}>
                        {Object.keys(UpColor).map((key) => {
                            return <FormControlLabel key={key} value={key} control={<Radio/>}
                                                     label={updown({key})}/>
                        })}
                    </RadioGroupStyle>
                    {/*<ToggleButtonGroup exclusive {...{*/}
                    {/*    ...rest,*/}
                    {/*    t,*/}
                    {/*    tgItemJSXs: [*/}
                    {/*        {value: UpColor.green, JSX:<>UP</>,tlabel: 'green up'},*/}
                    {/*        {value: UpColor.red, JSX:<>Down</>,tlabel: 'red up'}],*/}
                    {/*    value: upColor,*/}
                    {/*    handleChange:handleColorChange,*/}
                    {/*    size: 'small'*/}
                    {/*}}/>*/}
                {/*</Typography>*/}

                {/*<StyledSwitchColor checked={upColor === UpColor.green} color="default"*/}
                {/*                   onChange={handleColorChange}/>*/}
            </Grid>

        </Grid>
        <StyledDivider/>
        <Grid container display={'flex'} flexDirection={'row'} justifyContent={'stretch'}
              alignItems={'center'} paddingX={2} marginY={2}>
            <Grid item xs={4} display={'flex'} flexDirection={'column'}>
                <Typography variant={'body1'} component={'p'} color={'textSecondary'}>{t('labelTheme')}</Typography>
            </Grid>
            <Grid item xs={8} display={'flex'} flexDirection={'column'} justifyContent={'center'}
                  alignItems={'flex-end'} alignSelf={'stretch'} >
                <StyledSwitch checked={themeMode === ThemeType.dark } aria-label={t('change theme')}  onClick={handleThemeClick}></StyledSwitch>
            </Grid>
        </Grid>
    </BoxStyle>

})






