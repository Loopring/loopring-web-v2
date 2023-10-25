import styled from '@emotion/styled'
import { Avatar, Box, CardContent, Typography } from '@mui/material'
import { Trans, WithTranslation, withTranslation } from 'react-i18next'
import {
  CoinIcon,
  CoinIcons,
  DualTable,
  useOpenModals,
  useSettings,
  TickCardStyleItem,
} from '@loopring-web/component-lib'
import { useDualMap, useSystem, useTokenMap } from '@loopring-web/core'
import {
  DualGain,
  DualDip,
  DualBegin,
  DualViewType,
  getValuePrecisionThousand,
  SoursURL,
  TokenType,
  DualBTC,
} from '@loopring-web/common-resources'
import * as sdk from '@loopring-web/loopring-sdk'
import { DUAL_TYPE } from '@loopring-web/loopring-sdk'
import { useTheme } from '@emotion/react'
import React from 'react'
import _ from 'lodash'

const WrapperStyled = styled(Box)`
  flex: 1;
  display: flex;
  flex-direction: column;
  background: var(--color-box);
  border-radius: ${({ theme }) => theme.unit}px;
`
export const ViewStepType = {
  [DualViewType.DualGain]: DualGain,
  [DualViewType.DualDip]: DualDip,
  [DualViewType.DualBegin]: DualBegin,
  [DualViewType.DualBTC]: DualBTC,
}

export const BeginnerMode: any = withTranslation('common')(
  ({
    t,
    dualListProps,
    viewType,
    r,
  }: // setConfirmDualInvest,
  WithTranslation & {
    dualListProps: any
    viewType: DualViewType
    // setConfirmDualInvest: (state: any) => void
  }) => {
    // const viewType ===
    const viewStepType = ViewStepType[viewType]

    const theme = useTheme()
    const { tradeMap } = useDualMap()
    const { coinJson } = useSettings()
    const { forexMap } = useSystem()
    const { tokenMap } = useTokenMap()
    const { setShowDual } = useOpenModals()
    const {
      pairASymbol,
      pairBSymbol,
      isLoading,
      dualProducts,
      currentPrice,
      market,
      baseTokenList,
      step1SelectedToken,
      step2BuyOrSell,
      step3Token,
      onSelectStep1Token,
      onSelectStep2BuyOrSell,
      onSelectStep3Token,
      isDualBalanceSufficient,
    } = dualListProps
    const { isMobile } = useSettings()
    const { marketArray } = useDualMap()
    const tokenList: any[] = Object.values(baseTokenList ?? {})?.sort((a: any, b: any) =>
      a?.tokenName?.toString().localeCompare(b?.tokenName?.toString()),
    )
    const dualType =
      step2BuyOrSell === 'Sell' ? sdk.DUAL_TYPE.DUAL_BASE : sdk.DUAL_TYPE.DUAL_CURRENCY
    const step3Ref = React.useRef(null)
    const tableRef = React.useRef(null)
    const quoteList = _.cloneDeep(tradeMap[step1SelectedToken ?? '']?.tokenList ?? [])
    // const last = quoteList.pop()
    const scroolStep3ToMiddle = () => {
      setTimeout(() => {
        const element = step3Ref.current as any
        const elementRect = element.getBoundingClientRect()
        const absoluteElementTop = elementRect.top + window.pageYOffset
        const middle = absoluteElementTop - window.innerHeight / 2
        window.scrollTo(0, middle)
      }, 100)
    }
    const scroolTableToMiddle = () => {
      setTimeout(() => {
        const element = tableRef.current as any
        const elementRect = element.getBoundingClientRect()
        const absoluteElementTop = elementRect.top + window.pageYOffset
        const middle = absoluteElementTop - window.innerHeight / 2
        window.scrollTo(0, middle)
      }, 100)
    }
    return (
      <Box display={'flex'} flexDirection={'column'} flex={1} marginBottom={2}>
        <Box marginBottom={5}>
          <Typography marginBottom={2} display={'flex'} variant={'h4'}>
            {t(viewStepType[0].labelKey)}
          </Typography>
          <Box display={'flex'} flexDirection={'row'}>
            {tokenList?.map(({ tokenName, minAPY, maxAPY }: any) => {
              const selected = step1SelectedToken === tokenName
              return (
                <Box marginRight={2} key={tokenName.toString()}>
                  <TickCardStyleItem
                    className={
                      selected ? 'btnCard dualInvestCard selected' : 'btnCard dualInvestCard '
                    }
                    selected={selected}
                    onClick={() => onSelectStep1Token(tokenName.toString())}
                    width={'280px'}
                  >
                    <CardContent
                    // sx={{
                    //   alignItems: 'center',
                    //   // paddingX: 3,
                    //   // paddingY: 2,
                    //   '&:last-child': { paddingY: 2 },
                    // }}
                    >
                      <Typography component={'span'} display={'inline-flex'}>
                        <CoinIcon
                          size={32}
                          symbol={typeof tokenName === 'string' ? tokenName : ''}
                        />
                      </Typography>
                      <Typography paddingLeft={1}>
                        <Typography
                          color={
                            selected ? theme.colorBase.textPrimary : theme.colorBase.textPrimary
                          }
                          variant={'subtitle1'}
                        >
                          {tokenName?.toString()}
                        </Typography>
                        <Typography variant={'body2'} color={theme.colorBase.textSecondary}>
                          {t('labelDualBeginnerAPR', {
                            APR:
                              !minAPY && !maxAPY
                                ? '--'
                                : minAPY === maxAPY || !minAPY || !maxAPY
                                ? `${getValuePrecisionThousand(
                                    Number(minAPY) * 100,
                                    2,
                                    2,
                                    2,
                                    true,
                                  )}%`
                                : `${getValuePrecisionThousand(
                                    Number(minAPY) * 100,
                                    2,
                                    2,
                                    2,
                                    true,
                                  )}% - ${getValuePrecisionThousand(
                                    Number(maxAPY) * 100,
                                    2,
                                    2,
                                    2,
                                    true,
                                  )}%`,
                          })}
                        </Typography>
                      </Typography>
                    </CardContent>
                  </TickCardStyleItem>
                </Box>
              )
            })}
          </Box>
        </Box>

        {step1SelectedToken !== undefined && viewType === DualViewType.DualBegin && (
          <Box marginBottom={5}>
            <Typography marginBottom={2} display={'flex'} variant={'h4'}>
              {t('labelDualBeginnerStep2Title')}
            </Typography>
            <Box display={'flex'} flexDirection={'row'}>
              <Box marginRight={2}>
                <TickCardStyleItem
                  className={
                    step2BuyOrSell === 'Sell'
                      ? 'btnCard dualInvestCard selected'
                      : 'btnCard dualInvestCard '
                  }
                  selected={step2BuyOrSell === 'Sell'}
                  onClick={() => {
                    onSelectStep2BuyOrSell('Sell')
                    scroolStep3ToMiddle()
                  }}
                  width={'310px'}
                >
                  <CardContent
                  // sx={{
                  //   alignItems: 'center',
                  //   // paddingX: 3,
                  //   // paddingY: 2,
                  //   // '&:last-child': { paddingY: 2 },
                  // }}
                  >
                    <Typography component={'span'} display={'inline-flex'}>
                      <Avatar alt={'sell-high'} src={SoursURL + '/svg/sell-high.svg'} />
                    </Typography>
                    <Typography paddingLeft={1}>
                      <Typography color={theme.colorBase.textPrimary} variant={'subtitle1'}>
                        {t('labelDualBeginnerSellHigh', {
                          token: step1SelectedToken,
                        })}
                      </Typography>
                      <Typography variant={'body2'} color={theme.colorBase.textSecondary}>
                        {t('labelDualBeginnerReceiveStable', {
                          ...(quoteList?.length > 1
                            ? {
                                last: t('labelDualBeginnerLast', {
                                  last: quoteList[quoteList.length - 1],
                                }),
                                list: [...quoteList.slice(0, quoteList.length - 1)].join(', '),
                              }
                            : {
                                last: '',
                                list: [...quoteList].join(', '),
                              }),
                        })}
                      </Typography>
                    </Typography>
                  </CardContent>
                </TickCardStyleItem>
              </Box>
              <Box marginLeft={2}>
                <TickCardStyleItem
                  className={
                    step2BuyOrSell === 'Buy'
                      ? 'btnCard dualInvestCard selected'
                      : 'btnCard dualInvestCard '
                  }
                  selected={step2BuyOrSell === 'Buy'}
                  onClick={() => {
                    onSelectStep2BuyOrSell('Buy')
                    scroolStep3ToMiddle()
                  }}
                  width={'310px'}
                >
                  <CardContent
                  // sx={{
                  //   alignItems: 'center',
                  //   // paddingX: 3,
                  //   // paddingY: 2,
                  //   // '&:last-child': { paddingY: 2 },
                  // }}
                  >
                    <Typography component={'span'} display={'inline-flex'}>
                      <Avatar alt={'buy-low'} src={SoursURL + '/svg/buy-low.svg'} />
                    </Typography>
                    <Typography paddingLeft={1}>
                      <Typography color={theme.colorBase.textPrimary} variant={'subtitle1'}>
                        {t('labelDualBeginnerBuyLow', {
                          token: step1SelectedToken,
                        })}
                      </Typography>
                      <Typography variant={'body2'} color={theme.colorBase.textSecondary}>
                        {t('labelDualBeginnerInvestStable', {
                          ...(quoteList?.length > 1
                            ? {
                                last: t('labelDualBeginnerLast', {
                                  last: quoteList[quoteList.length - 1],
                                }),
                                list: [...quoteList.slice(0, quoteList.length - 1)].join(', '),
                              }
                            : {
                                last: '',
                                list: [...quoteList].join(', '),
                              }),
                        })}
                      </Typography>
                    </Typography>
                  </CardContent>
                </TickCardStyleItem>
              </Box>
            </Box>
          </Box>
        )}

        {step1SelectedToken !== undefined && step2BuyOrSell !== undefined && (
          <Box ref={step3Ref} marginBottom={2}>
            <Typography marginBottom={2} display={'flex'} variant={'h4'}>
              {t(viewStepType[2].labelKey)}
            </Typography>
            <Box display={'flex'} flexDirection={'row'}>
              {tradeMap[step1SelectedToken ?? '']?.tokenList?.map((token) => {
                return (
                  <Box marginRight={2} key={token}>
                    <TickCardStyleItem
                      className={
                        step3Token === token
                          ? 'btnCard dualInvestCard selected'
                          : 'btnCard dualInvestCard '
                      }
                      selected={step3Token === token}
                      onClick={() => {
                        onSelectStep3Token(token)
                        scroolTableToMiddle()
                      }}
                      width={'280px'}
                    >
                      <CardContent
                        sx={{
                          alignItems: 'center',
                          paddingX: 3,
                          paddingY: 2,
                          '&:last-child': { paddingY: 2 },
                        }}
                      >
                        <Typography component={'span'} display={'inline-flex'}>
                          <CoinIcon size={32} symbol={token} />
                        </Typography>
                        <Typography
                          color={theme.colorBase.textPrimary}
                          variant={'subtitle1'}
                          paddingLeft={1}
                        >
                          {step2BuyOrSell === 'Buy'
                            ? t('labelDualBeginnerBuyLowWith', { token: token })
                            : t('labelDualBeginnerSellHighFor', {
                                token: token,
                              })}
                        </Typography>
                      </CardContent>
                    </TickCardStyleItem>
                  </Box>
                )
              })}
            </Box>
          </Box>
        )}
        {step3Token !== undefined && step1SelectedToken !== undefined && (
          <WrapperStyled ref={tableRef} marginTop={1} flex={1} flexDirection={'column'}>
            {pairASymbol && pairBSymbol && market && (
              <Box
                display={'flex'}
                flexDirection={'row'}
                paddingTop={3}
                paddingX={3}
                justifyContent={'space-between'}
                alignItems={'center'}
              >
                <Box component={'h3'} display={'flex'} flexDirection={'row'} alignItems={'center'}>
                  <Typography component={'span'} display={'inline-flex'}>
                    {/* eslint-disable-next-line react/jsx-no-undef */}
                    <CoinIcons
                      type={TokenType.dual}
                      size={32}
                      tokenIcon={[coinJson[pairASymbol], coinJson[pairBSymbol]]}
                    />
                  </Typography>
                  <Typography component={'span'} flexDirection={'column'} display={'flex'}>
                    <Typography component={'span'} display={'inline-flex'} color={'textPrimary'}>
                      {t(
                        dualType === DUAL_TYPE.DUAL_BASE
                          ? 'labelDualInvestBaseTitle'
                          : 'labelDualInvestQuoteTitle',
                        {
                          symbolA: pairASymbol,
                          symbolB: pairBSymbol,
                        },
                      )}
                    </Typography>
                    {isDualBalanceSufficient === undefined ? (
                      <Typography
                        component={'span'}
                        display={'inline-flex'}
                        color={'textSecondary'}
                        variant={'body2'}
                      >
                        &nbsp;
                      </Typography>
                    ) : isDualBalanceSufficient === true ? (
                      <Typography
                        component={'span'}
                        display={'inline-flex'}
                        color={'textSecondary'}
                        variant={'body2'}
                      >
                        {t('labelDualInvestDes', {
                          symbolA: pairASymbol,
                          symbolB: pairBSymbol,
                        })}
                      </Typography>
                    ) : (
                      <Typography
                        component={'span'}
                        display={'inline-flex'}
                        color={'var(--color-warning)'}
                        variant={'body2'}
                      >
                        {t('labelDualInvestDesInsufficient')}
                      </Typography>
                    )}
                  </Typography>
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
                          baseSymbol: /USD/gi.test(currentPrice.quote ?? '')
                            ? 'USDT'
                            : currentPrice.quote,
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
                      sellSymbol: pairASymbol!,
                      buySymbol: pairBSymbol!,
                    },
                  })
                }}
              />
            </Box>
          </WrapperStyled>
        )}
      </Box>
    )
  },
)
