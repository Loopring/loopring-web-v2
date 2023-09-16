import {
  BtnPercentage,
  ButtonStyle,
  CoinIcons,
  DualDetailProps,
  TickCardStyleItem,
  useSettings,
} from '@loopring-web/component-lib'
import React from 'react'
import { Box, Divider, Grid, Typography } from '@mui/material'
import * as sdk from '@loopring-web/loopring-sdk'
import { Mark } from '@mui/base/SliderUnstyled/SliderUnstyledProps'
import { Trans, useTranslation } from 'react-i18next'
import { getValuePrecisionThousand, TokenType } from '@loopring-web/common-resources'
// import { DUAL_TYPE } from '@loopring-web/loopring-sdk'

export const ModifyParameter = ({
  dualViewInfo,
  coinSell,
  onClose,
  onChange,
  isPriceEditable,
  // dualProducts,
  // getProduct,
  maxDuration = 11,
}: DualDetailProps & { maxDuration?: number; onClose: () => void }) => {
  const { t } = useTranslation()
  const { coinJson } = useSettings()
  const {
    stepLength,
    strike,
    currentPrice: { currentPrice, precisionForPrice, base, quote },
  } = dualViewInfo
  // const priceList = []
  const stepEle = React.useMemo(() => {
    const listELE: JSX.Element[] = []

    let method = sdk
      .toBig(currentPrice ?? 0)
      .minus(strike ?? 0)
      .gte(0)
      ? 'minus'
      : 'plus'
    let start = sdk.toBig(stepLength).times(
      sdk
        .toBig(currentPrice ?? 0)
        .div(stepLength)
        .toFixed(0),
    )
    // if(strike)
    if (method === 'minus' && start.gt(currentPrice ?? 0)) {
      start = sdk.toBig(start).minus(stepLength)
    } else if (method === 'plus' && start.lt(currentPrice ?? 0)) {
      start = sdk.toBig(start).plus(stepLength)
    }
    for (let index = 0, item = start; index < 12; index++) {
      if (dualViewInfo.dualType == sdk.DUAL_TYPE.DUAL_BASE) {
        item = method === 'minus' ? item.minus(stepLength) : item.plus(stepLength)
      }
      listELE.push(
        <Grid item key={index} xs={3}>
          <TickCardStyleItem
            className={
              item.eq(coinSell.renewTargetPrice ?? 0)
                ? 'btnCard dualInvestCard selected'
                : 'btnCard dualInvestCard '
            }
            // selected={coinSell.renewTargetPrice ?? 0}
            onClick={() =>
              onChange({
                ...coinSell,
                renewTargetPrice: item.toString(),
              })
            }
          >
            {item.toString()}
          </TickCardStyleItem>
        </Grid>,
      )
    }

    return listELE.map((item) => item)
  }, [])
  // const theme = useTheme()
  // const handleDuration = (item) => {}
  return (
    <Box marginTop={-4}>
      <Typography
        component={'header'}
        height={'var(--toolbar-row-height)'}
        display={'flex'}
        paddingX={3}
        flexDirection={'row'}
        alignItems={'center'}
      >
        <Typography component={'span'} display={'inline-flex'}>
          {/* eslint-disable-next-line react/jsx-no-undef */}
          <CoinIcons
            type={TokenType.dual}
            size={32}
            tokenIcon={[coinJson[dualViewInfo.sellSymbol], coinJson[dualViewInfo.buySymbol]]}
          />
        </Typography>
        <Typography component={'span'} display={'inline-flex'} color={'textPrimary'}>
          {t('labelDualModifyParameter')}
        </Typography>
      </Typography>
      <Divider sx={{ marginX: 2 }} />
      {isPriceEditable && (
        <>
          <Typography component={'span'} display={'inline-flex'} color={'textPrimary'}>
            <Trans
              i18nKey={'labelDualCurrentPrice'}
              tOptions={{
                price:
                  // PriceTag[CurrencyToTag[currency]] +
                  getValuePrecisionThousand(
                    currentPrice,
                    precisionForPrice,
                    precisionForPrice,
                    undefined,
                  ),
                symbol: base,
                baseSymbol: quote,
              }}
            >
              LRC Current price:
              <Typography
                component={'span'}
                display={'inline-flex'}
                color={'textPrimary'}
                paddingLeft={1}
              >
                price
              </Typography>
              :
            </Trans>
          </Typography>
          <Grid container spacing={2}>
            {stepEle}
            {/*{priceList.map((item, index) => {*/}
            {/*  return (*/}
            {/*    <Grid item key={index}>*/}
            {/*      {}*/}
            {/*    </Grid>*/}
            {/*  )*/}
            {/*})}*/}
          </Grid>
        </>
      )}
      <Box padding={4}>
        <BtnPercentage
          selected={Number(coinSell.renewDuration ?? 7)}
          handleChanged={(value) => {
            onChange({
              ...coinSell,
              renewDuration: value,
            })
          }}
          anchors={
            Array.from({ length: maxDuration }, (_, index) => ({
              value: index + 1,
              label:
                (index + 1) % 4 == 0 || index == 0 || index == maxDuration - 1
                  ? t('labelDayDisplay', { item: index + 1 })
                  : '',
            })) as Mark[]
          }
          min={1}
          max={maxDuration}
          valueLabelDisplay='on'
          valuetext={(item) => t('labelDayDisplay', { item })}
          step={1}
        />
      </Box>
      <Grid item xs={12}>
        <Box paddingX={2} marginY={2}>
          <ButtonStyle
            fullWidth
            variant={'contained'}
            size={'medium'}
            color={'primary'}
            onClick={onClose}
          >
            {t('labelDualModifyConfirm')}
          </ButtonStyle>
        </Box>
      </Grid>
    </Box>
  )
}
