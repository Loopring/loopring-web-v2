import styled from '@emotion/styled'
import {
  Box,
  Divider,
  FormControlLabel,
  Grid,
  Radio,
  SelectChangeEvent,
  Switch,
  Typography,
} from '@mui/material'
import React from 'react'
import {
  CurrencyToTag,
  DropDownIcon,
  GrowIcon,
  i18n,
  LanguageType,
  PriceTag,
  ThemeType,
  UpColor,
} from '@loopring-web/common-resources'
import { OutlineSelect, OutlineSelectItem, RadioGroupStyle } from '../basic-lib'
import { Trans, WithTranslation, withTranslation } from 'react-i18next'
import { useSettings } from '../../stores'

const StyledSwitch = styled(Switch)`
  margin: 0;
`

const BoxStyle = styled(Box)`
  .MuiInputBase-root {
    background: var(--opacity);
    text-align: right;
  }
` as typeof Box

export const BtnCurrency = ({ t, currency, label, handleChange }: any) => {
  const _handleChange = React.useCallback(
    (event: SelectChangeEvent<any>) => {
      // setState(event.target.value)
      if (handleChange) {
        handleChange(event.target.value)
      }
    },
    [handleChange],
  )
  return (
    <OutlineSelect
      aria-label={t(label)}
      IconComponent={DropDownIcon}
      labelId='language-selected'
      id='language-selected'
      value={currency?.toUpperCase()}
      autoWidth
      onChange={_handleChange}
    >
      {Object.keys(CurrencyToTag).map((item) => {
        return (
          <OutlineSelectItem value={CurrencyToTag[item]} key={item}>
            {PriceTag[CurrencyToTag[item]]} {item}
          </OutlineSelectItem>
        )
      })}
      {/*<OutlineSelectItem value={Currency.cny}>¥ {t('labelCNYYuan')}</OutlineSelectItem>*/}
    </OutlineSelect>
  )
}

const StyledDivider = styled(Divider)`
  margin: 0;
`

export const BtnLanguage = ({ t, label, handleChange }: any) => {
  const _handleChange = React.useCallback(
    (event: SelectChangeEvent<any>) => {
      if (handleChange) {
        handleChange(event.target.value)
      }
    },
    [handleChange],
  )
  return (
    <OutlineSelect
      aria-label={t(label)}
      IconComponent={DropDownIcon}
      labelId='language-selected'
      id='language-selected'
      value={i18n.language}
      onChange={_handleChange}
    >
      <OutlineSelectItem value={LanguageType.en_US}>English</OutlineSelectItem>
      {/*<OutlineSelectItem value={LanguageType.zh_CN}>简体中文</OutlineSelectItem>*/}
    </OutlineSelect>
  )
}

export const SettingPanel = withTranslation(['common', 'layout'], {
  withRef: true,
})(({ t, ...rest }: WithTranslation) => {
  // const theme = useTheme();
  const { setUpColor, setCurrency, setLanguage, currency, upColor, setTheme, themeMode, isMobile } =
    useSettings()

  const handleOnLanguageChange = React.useCallback(
    (value: any) => {
      setLanguage(value)
    },
    [setLanguage],
  )
  const handleOnCurrencyChange = React.useCallback(
    (value: any) => {
      setCurrency(value)
    },
    [setCurrency],
  )
  const handleColorChange = React.useCallback(
    (_e: any, value: any) => {
      setUpColor(value)
    },
    [setUpColor],
  )
  //const [mode, setMode] = React.useState(themeMode)
  const handleThemeClick = React.useCallback(
    (e: any) => {
      if (e.target.checked) {
        setTheme(ThemeType.dark)
      } else {
        setTheme(ThemeType.light)
      }
    },
    [themeMode],
  )
  const updown = React.useCallback(
    ({ key }: any) => {
      return (
        <>
          <Typography component={'span'} variant={'body2'} color={'textPrimary'}>
            <Trans
              i18nKey='whichColorIsUp'
              tOptions={{
                up: key === UpColor.green ? t('labelgreen') : t('labelred'),
                down: key === UpColor.green ? t('labelred') : t('labelgreen'),
              }}
            >
              <Typography
                component={'span'}
                variant={'body2'}
                color={'textPrimary'}
                style={{
                  textTransform: 'capitalize',
                  // color: key === UpColor.green ? theme.colorBase.success : theme.colorBase.error
                }}
              >
                color up
              </Typography>
              and
              <Typography
                component={'span'}
                variant={'body2'}
                color={'textPrimary'}
                style={{
                  textTransform: 'capitalize',
                  // color: key === UpColor.green ? theme.colorBase.error : theme.colorBase.success
                }}
              >
                color down
              </Typography>
            </Trans>
          </Typography>
          <Typography
            component={'span'}
            style={{ verticalAlign: '-webkit-baseline-middle' }}
            color={key === UpColor.green ? 'var(--color-success)' : 'var(--color-error)'}
          >
            <GrowIcon fontSize={'medium'} color={'inherit'} />
          </Typography>
        </>
      )
    },
    [UpColor],
  )
  const styles = isMobile ? { flex: 1 } : { width: 'var(--swap-box-width)' }
  return (
    <BoxStyle component={'section'} display={'flex'} flexDirection={'column'} style={styles}>
      {/*<Typography variant={'h6'} component={'h4'} paddingX={2}>{t('labelTitleLayout')}</Typography>*/}
      <Grid
        container
        display={'flex'}
        flexDirection={'row'}
        justifyContent={'stretch'}
        alignItems={'center'}
        paddingX={2}
        marginY={2}
      >
        <Grid item xs={4} display={'flex'} flexDirection={'column'}>
          <Typography variant={'body1'} component={'p'} color={'textSecondary'}>
            {t('labelLanguage')}
          </Typography>
        </Grid>
        <Grid
          item
          xs={8}
          display={'flex'}
          flexDirection={'column'}
          justifyContent={'space-evenly'}
          alignItems={'flex-end'}
          alignSelf={'stretch'}
        >
          <Grid item>
            <BtnLanguage
              {...{
                t,
                ...rest,
                handleChange: handleOnLanguageChange,
              }}
            />
          </Grid>
        </Grid>
      </Grid>
      <StyledDivider />

      <Grid
        container
        display={'flex'}
        flexDirection={'row'}
        justifyContent={'stretch'}
        alignItems={'center'}
        paddingX={2}
        marginY={2}
      >
        <Grid item xs={4} display={'flex'} flexDirection={'column'}>
          <Typography variant={'body1'} component={'p'} color={'textSecondary'}>
            {t('labelCurrency')}
          </Typography>
        </Grid>
        <Grid
          item
          xs={8}
          display={'flex'}
          flexDirection={'column'}
          justifyContent={'space-evenly'}
          alignItems={'flex-end'}
          alignSelf={'stretch'}
        >
          <Grid item>
            <BtnCurrency
              {...{
                t,
                ...rest,
                currency,
                label: 'currencySetting',
                handleChange: handleOnCurrencyChange,
              }}
            />
          </Grid>
        </Grid>
      </Grid>
      <StyledDivider />
      <Grid
        container
        display={'flex'}
        flexDirection={'row'}
        justifyContent={'stretch'}
        alignItems={'center'}
        paddingX={2}
        marginY={1}
      >
        <Grid item xs={4} display={'flex'} flexDirection={'column'}>
          <Typography variant={'body1'} component={'p'} color={'textSecondary'}>
            {t('labelColors')}
          </Typography>
        </Grid>
        <Grid
          item
          xs={8}
          display={'flex'}
          flexDirection={'column'}
          justifyContent={'center'}
          alignItems={'flex-end'}
          alignSelf={'stretch'}
        >
          <RadioGroupStyle
            row={false}
            aria-label='withdraw'
            name='withdraw'
            value={upColor}
            onChange={handleColorChange}
          >
            {Object.keys(UpColor).map((key) => {
              return (
                <React.Fragment key={key}>
                  <FormControlLabel value={key} control={<Radio />} label={updown({ key })} />
                </React.Fragment>
              )
            })}
          </RadioGroupStyle>
        </Grid>
      </Grid>
      <StyledDivider />
      <Grid
        container
        display={'flex'}
        flexDirection={'row'}
        justifyContent={'stretch'}
        alignItems={'center'}
        paddingX={2}
        marginY={2}
      >
        <Grid item xs={4} display={'flex'} flexDirection={'column'}>
          <Typography variant={'body1'} component={'p'} color={'textSecondary'}>
            {t('labelTheme')}
          </Typography>
        </Grid>
        <Grid
          item
          xs={8}
          display={'flex'}
          flexDirection={'column'}
          justifyContent={'center'}
          alignItems={'flex-end'}
          alignSelf={'stretch'}
        >
          <StyledSwitch
            checked={themeMode === ThemeType.dark}
            aria-label={t('change theme')}
            onClick={handleThemeClick}
          />
        </Grid>
      </Grid>
    </BoxStyle>
  )
})
