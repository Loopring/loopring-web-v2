import React from 'react'
import styled from '@emotion/styled'
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
import { Trans, WithTranslation, withTranslation } from 'react-i18next'
import { useDualHook } from './hook'
import {
  Button,
  CardStyleItem,
  CoinIcon,
  ConfirmInvestDualAutoRisk,
  DualTable,
  EmptyDefault,
  useOpenModals,
  useSettings,
} from '@loopring-web/component-lib'
import {
  confirmation,
  ModalDualPanel,
  useDualMap,
  useDualTrade,
  useSystem,
  useTokenMap,
} from '@loopring-web/core'
import { useHistory, useLocation } from 'react-router-dom'
import {
  BackIcon,
  DualInvestmentLogo,
  DualViewType,
  getValuePrecisionThousand,
  Info2Icon,
  LOOPRING_DOCUMENT,
  SoursURL,
} from '@loopring-web/common-resources'
import { useTheme } from '@emotion/react'
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

export const DualListPanel: any = withTranslation('common')(
  ({
    t,
    setConfirmDualInvest,
  }: WithTranslation & {
    setConfirmDualInvest: (state: any) => void
  }) => {
    const { search, pathname } = useLocation()

    const { forexMap } = useSystem()
    const [viewType, setViewType] = React.useState<DualViewType | undefined>(undefined)
    const theme = useTheme()
    const { tradeMap, marketArray, status, getDualMap } = useDualMap()
    const { tokenMap } = useTokenMap()
    const { setShowDual } = useOpenModals()
    const [confirmDualAutoInvest, setConfirmDualAutoInvest] = React.useState<boolean>(false)
    const { confirmDualAutoInvest: confirmDualAutoInvestFun } = confirmation.useConfirmation()
    const dualListProps = useDualHook({ setConfirmDualInvest, viewType })
    const {
      pairASymbol,
      pairBSymbol,
      isLoading,
      dualProducts,
      currentPrice,
      market,
      handleOnPairChange,
      onSelectStep1Token,
      // toggle,
      // whitList,
    } = dualListProps
    const { dualTradeProps, dualToastOpen, closeDualToast } = useDualTrade({
      setConfirmDualAutoInvest,
    })
    const { isMobile } = useSettings()
    const history = useHistory()
    const marketsIsLoading = status === 'PENDING'
    React.useEffect(() => {
      const searchParams = new URLSearchParams(search)
      if (!searchParams.has('viewType')) {
        setViewType(undefined)
      }
    }, [search])
    return (
      <Box display={'flex'} flexDirection={'column'} flex={1} width={'100%'}>
        <MaxWidthContainer
          display={'flex'}
          justifyContent={'space-between'}
          background={containerColors[0]}
          height={isMobile ? 60 * theme.unit : 34 * theme.unit}
          alignItems={'center'}
        >
          <Box paddingY={7}>
            <Typography marginBottom={2} fontSize={'48px'} variant={'h1'}>
              {t('labelInvestDualTitle')}
            </Typography>
            <Box display={'flex'} alignItems={'center'}>
              <Button
                onClick={() => history.push('/invest/balance')}
                sx={{ width: isMobile ? 36 * theme.unit : 18 * theme.unit }}
                variant={'contained'}
              >
                {t('labelInvestMyDual')}
              </Button>

              <Button
                onClick={() => {
                  window.open(`${LOOPRING_DOCUMENT}dual_investment_tutorial_en.md`, '_blank')
                  window.opener = null
                }}
                sx={{ marginLeft: 1.5 }}
                variant={'contained'}
              >
                {t('labelInvestDualTutorial')}
              </Button>
            </Box>
          </Box>
          {!isMobile && <DualInvestmentLogo />}
        </MaxWidthContainer>
        {viewType && (
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
                size={'large'}
                sx={{ color: 'var(--color-text-primary)' }}
                color={'inherit'}
                onClick={() => {
                  setViewType(undefined)
                  onSelectStep1Token(undefined)
                }}
              >
                {/*<BackIcon fontSize={'inherit'} />*/}
                {t(`labelDualType${viewType}`)}
              </Button>
              {[DualViewType.All, DualViewType.DualBegin].includes(viewType) && (
                <FormControlLabel
                  labelPlacement={'start'}
                  control={
                    <Switch
                      checked={viewType === DualViewType.DualBegin}
                      onChange={(_event, _checked) =>
                        setViewType(_checked ? DualViewType.DualBegin : DualViewType.All)
                      }
                    />
                  }
                  label={
                    <Typography marginLeft={1.5} variant={'h5'}>
                      {t('labelInvestDualBeginerMode')}
                    </Typography>
                  }
                />
              )}
            </MaxWidthContainer>
            <Divider />
          </>
        )}
        <MaxWidthContainer background={containerColors[1]} minHeight={'70vh'} paddingY={3}>
          {viewType ? (
            viewType !== DualViewType.All ? (
              <BeginnerMode dualListProps={dualListProps} viewType={viewType} />
            ) : marketsIsLoading ? (
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
            ) : !!marketArray?.length ? (
              <>
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
                      Reflect.ownKeys(tradeMap)
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

                  <WrapperStyled marginTop={1} flex={1} flexDirection={'column'}>
                    {pairASymbol && pairBSymbol && market && (
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
                                    height: '100%',
                                    marginRight: 2,
                                    marginBottom: isMobile ? 2 : 0,
                                  }}
                                  onClick={() => {
                                    handleOnPairChange({ pairB: item })
                                  }}
                                  key={item.toString() + index.toString()}
                                >
                                  <Typography variant={isMobile ? 'body1' : 'h5'}>
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
                                <Tooltip
                                  title={<>{t('labelDualCurrentPriceTip')}</>}
                                  placement={'top'}
                                >
                                  <Typography
                                    component={'p'}
                                    variant='body2'
                                    color={'textSecondary'}
                                    display={'inline-flex'}
                                    alignItems={'center'}
                                  >
                                    <Info2Icon
                                      fontSize={'small'}
                                      color={'inherit'}
                                      sx={{ marginX: 1 / 2 }}
                                    />
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
                                    baseSymbol: currentPrice.quote,
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
                    )}
                    <Box flex={1}>
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
                  </WrapperStyled>
                </StyleDual>
              </>
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
            )
          ) : (
            <ChooseDualType
              onSelect={(item) => {
                setViewType(item)
              }}
            />
          )}
        </MaxWidthContainer>
        <ConfirmInvestDualAutoRisk
          open={confirmDualAutoInvest}
          handleClose={(_e, isAgree) => {
            if (!isAgree) {
              dualTradeProps.onChangeEvent({
                tradeData: {
                  ...dualTradeProps.dualCalcData?.coinSell,
                  isRenew: false,
                } as any,
              })
            } else {
              dualTradeProps.onChangeEvent({
                tradeData: {
                  ...dualTradeProps.dualCalcData?.coinSell,
                  isRenew: true,
                } as any,
              })
              confirmDualAutoInvestFun()
            }
            setConfirmDualAutoInvest(false)
          }}
        />
        <ModalDualPanel
          dualTradeProps={dualTradeProps}
          dualToastOpen={dualToastOpen}
          closeDualToast={closeDualToast}
          isBeginnerMode={viewType === DualViewType.DualBegin}
        />
      </Box>
    )
  },
)
