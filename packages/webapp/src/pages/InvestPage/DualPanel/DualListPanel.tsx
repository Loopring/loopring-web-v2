import React from 'react'
import styled from '@emotion/styled'
import * as sdk from '@loopring-web/loopring-sdk'

import {
  Box,
  CardContent,
  Divider,
  FormControlLabel,
  Grid,
  Switch,
  Tabs,
  Tooltip,
  Typography,
} from '@mui/material'
import { Trans, useTranslation, WithTranslation, withTranslation } from 'react-i18next'
import { useDualHook } from './hook'
import {
  Button,
  CardStyleItem,
  CoinIcon,
  DualTable,
  EmptyDefault,
  useOpenModals,
  useSettings,
} from '@loopring-web/component-lib'
import {
  ModalDualPanel,
  useDualMap,
  useDualTrade,
  useSystem,
  useTokenMap,
} from '@loopring-web/core'
import { useHistory, useLocation } from 'react-router-dom'
import {
  BackIcon,
  DualViewType,
  getValuePrecisionThousand,
  Info2Icon,
  InvestAssetRouter,
  LOOPRING_DOCUMENT,
  RouterPath,
  SagaStatus,
  SoursURL,
} from '@loopring-web/common-resources'
import { BeginnerMode } from './BeginnerMode'
import { containerColors, MaxWidthContainer } from '..'
import { ChooseDualType } from './ChooseDualType'

const StyleDual = styled(Box)`
  position: relative;
` as typeof Box
const WrapperStyled = styled(Box)`
  flex: 1;
  display: flex;
  flex-direction: column;
  border-radius: ${({ theme }) => theme.unit}px;
`

const MainTabCardStyleItem = styled(CardStyleItem)`
  &&,
  &&.selected,
  &&:hover {
    border-radius: ${({ theme }) => theme.unit}px;
    padding-left: ${({ theme }) => 3 * theme.unit}px;
    padding-right: ${({ theme }) => 3 * theme.unit}px;
    background: transparent;
  }
`

const SubTabCardStyleItem = styled(CardStyleItem)`
  &&,
  &&.selected,
  &&:hover {
    padding: ${({ theme }) => theme.unit}px ${({ theme }) => 2.5 * theme.unit}px;
    width: auto;
    border-radius: ${({ theme }) => theme.unit}px;
  }
`
export const DualListBlock = ({
  marketArray,
  tradeMap,
  dualListProps: {
    pairASymbol,
    pairBSymbol,
    isLoading,
    dualProducts,
    currentPrice,
    market,
    handleOnPairChange,
  },
}: {
  tradeMap: sdk.LoopringMap<{ tokenId: number; tokenList: string[] }>
  marketArray: string[]
  dualListProps: any
}) => {
  const { t } = useTranslation()
  const { tokenMap } = useTokenMap()
  const { forexMap } = useSystem()
  const { isMobile } = useSettings()
  const { setShowDual } = useOpenModals()

  return (
    <StyleDual flexDirection={'column'} display={'flex'} flex={1}>
      <Tabs
        value={pairASymbol}
        onChange={(_event, value) => handleOnPairChange({ pairA: value.toString() })}
        aria-label='l2-history-tabs'
        variant='scrollable'
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
        }}
      >
        {tradeMap &&
          Object.keys(tradeMap)
            .sort((a, b) => a.toString().localeCompare(b.toString()))
            .map((item, index) => {
              return (
                <Grid
                  marginBottom={2}
                  marginLeft={2}
                  item
                  xs={6}
                  md={3}
                  lg={2}
                  key={item.toString() + index.toString()}
                >
                  <MainTabCardStyleItem
                    className={
                      item.toString().toLowerCase() === pairASymbol.toLowerCase()
                        ? 'btnCard dualInvestCard selected'
                        : 'btnCard dualInvestCard '
                    }
                    sx={{ height: '100%' }}
                    onClick={() => handleOnPairChange({ pairA: item.toString() })}
                  >
                    <CardContent sx={{ alignItems: 'center' }}>
                      <Typography component={'span'} display={'inline-flex'}>
                        <CoinIcon symbol={item.toString()} size={28} />
                      </Typography>
                      <Typography variant={'h5'} paddingLeft={1}>
                        {t('labelDualInvest', {
                          symbol: item.toString(),
                        })}
                      </Typography>
                    </CardContent>
                  </MainTabCardStyleItem>
                </Grid>
              )
            })}
      </Tabs>

      <WrapperStyled
        display={'flex'}
        marginTop={1}
        flex={1}
        flexDirection={'column'}
        className={'dualList'}
      >
        {pairASymbol && pairBSymbol && market && (
          <>
            <Box
              display={'flex'}
              flexDirection={'row'}
              paddingTop={1}
              paddingX={2}
              justifyContent={'space-between'}
              alignItems={'center'}
            >
              <Box display={'flex'} flexWrap={'wrap'}>
                {pairASymbol &&
                  tradeMap[pairASymbol]?.tokenList?.map((item, index) => {
                    const _index = marketArray.findIndex((_item) =>
                      new RegExp(pairASymbol + '-' + item.toString(), 'ig').test(_item),
                    )
                    return (
                      <SubTabCardStyleItem
                        className={
                          item.toString().toLowerCase() === pairBSymbol.toLowerCase()
                            ? 'btnCard dualInvestCard selected'
                            : 'btnCard dualInvestCard '
                        }
                        sx={{
                          marginRight: 2,
                          marginBottom: isMobile ? 2 : 0,
                        }}
                        onClick={() => {
                          handleOnPairChange({ pairB: item })
                        }}
                        key={item.toString() + index.toString()}
                      >
                        <Typography variant={isMobile ? 'body1' : 'h5'} padding={2}>
                          {_index !== -1
                            ? t('labelDualBase', {
                                symbol: item.toString(),
                              })
                            : t('labelDualQuote', {
                                symbol: item.toString(),
                              })}
                        </Typography>
                      </SubTabCardStyleItem>
                    )
                  })}
              </Box>
              <Typography
                component={'span'}
                display={isMobile ? 'flex' : 'inline-flex'}
                color={'textSecondary'}
                variant={'body2'}
                flexDirection={isMobile ? 'column' : 'row'}
                alignItems={'center'}
                whiteSpace={'pre-wrap'}
              >
                {currentPrice &&
                  (!isMobile ? (
                    <>
                      <Tooltip title={<>{t('labelDualCurrentPriceTip')}</>} placement={'top'}>
                        <Typography
                          component={'p'}
                          variant='body2'
                          color={'textSecondary'}
                          display={'inline-flex'}
                          alignItems={'center'}
                        >
                          <Info2Icon fontSize={'small'} color={'inherit'} sx={{ marginX: 1 / 2 }} />
                        </Typography>
                      </Tooltip>
                      <Trans
                        i18nKey={'labelDualCurrentPrice'}
                        tOptions={{
                          price:
                            // PriceTag[CurrencyToTag[currency]] +
                            getValuePrecisionThousand(
                              currentPrice.currentPrice,
                              currentPrice.precisionForPrice
                                ? currentPrice.precisionForPrice
                                : tokenMap[currentPrice.quote].precisionForOrder,
                              currentPrice.precisionForPrice
                                ? currentPrice.precisionForPrice
                                : tokenMap[currentPrice.quote].precisionForOrder,
                              currentPrice.precisionForPrice
                                ? currentPrice.precisionForPrice
                                : tokenMap[currentPrice.quote].precisionForOrder,
                              true,
                              { floor: true },
                            ),
                          symbol: currentPrice.base,
                          baseSymbol: /USD/gi.test(currentPrice.quoteUnit ?? '')
                            ? 'USDT'
                            : currentPrice.quoteUnit, //currentPrice.quote,
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
                    </>
                  ) : (
                    <>
                      <Typography
                        component={'span'}
                        color={'textSecondary'}
                        variant={'body2'}
                        textAlign={'right'}
                      >
                        {t('labelDualMobilePrice', {
                          symbol: currentPrice.base,
                        })}
                      </Typography>
                      <Typography
                        textAlign={'right'}
                        component={'span'}
                        display={'inline-flex'}
                        color={'textPrimary'}
                        paddingLeft={1}
                      >
                        {getValuePrecisionThousand(
                          currentPrice.currentPrice,
                          currentPrice.precisionForPrice
                            ? currentPrice.precisionForPrice
                            : tokenMap[currentPrice.quote].precisionForOrder,
                          currentPrice.precisionForPrice
                            ? currentPrice.precisionForPrice
                            : tokenMap[currentPrice.quote].precisionForOrder,
                          currentPrice.precisionForPrice
                            ? currentPrice.precisionForPrice
                            : tokenMap[currentPrice.quote].precisionForOrder,
                          true,
                          { floor: true },
                        )}
                      </Typography>
                    </>
                  ))}
              </Typography>
            </Box>
            <Box flex={1} display={'flex'}>
              <DualTable
                rawData={dualProducts ?? []}
                showloading={isLoading}
                forexMap={forexMap as any}
                onItemClick={(item) => {
                  setShowDual({
                    isShow: true,
                    dualInfo: {
                      ...item,
                      sellSymbol: pairASymbol,
                      buySymbol: pairBSymbol,
                    },
                  })
                }}
              />
            </Box>
          </>
        )}
      </WrapperStyled>
    </StyleDual>
  )
}

export const DualListPanel: any = withTranslation('common')(({ t }: WithTranslation) => {
  const { search, pathname } = useLocation()
  const searchParams = new URLSearchParams(search)
  const viewType = new URLSearchParams(search).get('viewType')
  const { forexMap } = useSystem()
  const history = useHistory()
  const { status: dualStatus, getDualMap } = useDualMap()
  const [confirmDualAutoInvest, setConfirmDualAutoInvest] = React.useState(false)
  const dualListProps = useDualHook()
  const { dualTradeProps, dualToastOpen, closeDualToast } = useDualTrade({
    setConfirmDualAutoInvest,
  })
  const { onSelectStep1Token } = dualListProps
  React.useEffect(() => {
    if (dualStatus === SagaStatus.ERROR) {
      getDualMap()
    }
  }, [dualStatus])

  return (
    <Box display={'flex'} flexDirection={'column'} flex={1} width={'100%'}>
      {viewType ? (
        <>
          <MaxWidthContainer
            background={containerColors[1]}
            display={'flex'}
            justifyContent={'space-between'}
            paddingY={2}
          >
            <Button
              startIcon={<BackIcon fontSize={'small'} />}
              variant={'text'}
              sx={{ color: 'var(--color-text-primary)' }}
              color={'inherit'}
              onClick={() => {
                searchParams.set('viewType', '')
                // history.goBack()
                history.push(pathname + '?' + searchParams.toString())
                onSelectStep1Token(undefined)
              }}
            >
              {t('labelBack')}
            </Button>
            <Button
              variant={'text'}
              sx={{ color: 'var(--color-text-primary)' }}
              color={'inherit'}
              endIcon={<BackIcon fontSize={'small'} sx={{ transform: 'rotate(180deg)' }} />}
              onClick={() => history.push('/invest/balance')}
            >
              {t('labelInvestMyDual')}
            </Button>
          </MaxWidthContainer>
          <Divider />
          <MaxWidthContainer
            containerProps={{
              sx: {
                background: containerColors[1],
                display: 'flex',
                flex: 1,
                flexDirection: 'column',
                justifyContent: 'flex-start',
                alignItems: 'center',
              },
            }}
            sx={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <Box display={'flex'} justifyContent={'space-between'} alignItems={'center'}>
              <Box display={'flex'} alignItems={'center'} marginY={3}>
                <Typography component={'h4'} variant={'h4'}>
                  {t(`labelDualType${viewType}`)}
                </Typography>
                <Button
                  onClick={() => {
                    window.open(`${LOOPRING_DOCUMENT}dual_investment_tutorial_en.md`, '_blank')
                    window.opener = null
                  }}
                  size={'small'}
                  sx={{ marginLeft: 1.5 }}
                  variant={'outlined'}
                >
                  {t('labelInvestDualTutorial')}
                </Button>
              </Box>
              {[DualViewType.All, DualViewType.DualBegin].includes(viewType as any) && (
                <FormControlLabel
                  labelPlacement={'start'}
                  control={
                    <Switch
                      checked={viewType === DualViewType.DualBegin}
                      onChange={(_event, _checked) => {
                        searchParams.set(
                          'viewType',
                          _checked ? DualViewType.DualBegin : DualViewType.All,
                        )
                        history.push(pathname + '?' + searchParams.toString())
                      }}
                    />
                  }
                  label={
                    <Typography marginLeft={1.5} variant={'h5'}>
                      {t('labelInvestDualBeginerMode')}
                    </Typography>
                  }
                />
              )}
            </Box>
            <>
              {![DualViewType.All, DualViewType.DualBTC].includes(viewType as any) ? (
                <BeginnerMode dualListProps={dualListProps} viewType={viewType} />
              ) : dualStatus == SagaStatus.PENDING ? (
                <Box
                  key={'loading'}
                  flexDirection={'column'}
                  display={'flex'}
                  justifyContent={'center'}
                  height={'100%'}
                  alignItems={'center'}
                  flex={1}
                >
                  <img alt={'loading'} width='36' src={`${SoursURL}images/loading-line.gif`} />
                </Box>
              ) : !!dualListProps?.marketArray?.length ? (
                <DualListBlock
                  tradeMap={dualListProps.tradeMap}
                  marketArray={dualListProps.marketArray}
                  dualListProps={dualListProps}
                />
              ) : (
                <Box
                  key={'empty'}
                  flexDirection={'column'}
                  display={'flex'}
                  justifyContent={'center'}
                  height={'100%'}
                  flex={1}
                  alignItems={'center'}
                >
                  <EmptyDefault
                    height={'calc(100% - 35px)'}
                    message={() => {
                      return (
                        <Trans i18nKey='labelNoContent'>
                          <Button onClick={getDualMap} variant={'contained'}>
                            {t('labelDualRefresh')}
                          </Button>
                        </Trans>
                      )
                    }}
                  />
                </Box>
              )}
            </>
          </MaxWidthContainer>
        </>
      ) : (
        <ChooseDualType
          chooseDualTypeContent={dualListProps.chooseDualTypeContent}
          onSelect={(item) => {
            searchParams.set('viewType', item)

            history.push(
              `${RouterPath.invest}/${InvestAssetRouter.DUAL}/${
                item === DualViewType.DualBTC ? 'ETH-WBTC' : 'ETH-USDC'
              }?${searchParams.toString()}`,
            )
          }}
        />
      )}

      <ModalDualPanel
        confirmDualAutoInvest={confirmDualAutoInvest}
        setConfirmDualAutoInvest={setConfirmDualAutoInvest}
        viewType={viewType as any}
        dualTradeProps={{ ...dualTradeProps }}
        dualToastOpen={dualToastOpen}
        closeDualToast={closeDualToast}
        isBeginnerMode={viewType === DualViewType.DualBegin}
      />
    </Box>
  )
})
