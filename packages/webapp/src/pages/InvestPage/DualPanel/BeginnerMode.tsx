import styled from '@emotion/styled'
import { Avatar, Box, Card, CardContent, CardProps, Typography } from '@mui/material'
import { Trans, WithTranslation, withTranslation } from 'react-i18next'
import { useDualHook } from './hook'
import {
  CoinIcon,
  CoinIcons,
  DualTable,
  useOpenModals,
  useSettings,
  TickCardStyleItem,
} from '@loopring-web/component-lib'
import { useDualMap, useSystem, useTokenMap } from '@loopring-web/core'
import { getValuePrecisionThousand, SoursURL, TokenType } from '@loopring-web/common-resources'
import * as sdk from '@loopring-web/loopring-sdk'
import { DUAL_TYPE } from '@loopring-web/loopring-sdk'
import { useTheme } from '@emotion/react'
import { maxBy, minBy, values } from 'lodash'

const WhiteCircleText = styled(Box)`
  justify-content: center;
  align-items: center;
  display: flex;
  height: ${({ theme }) => theme.unit * 3}px;
  width: ${({ theme }) => theme.unit * 3}px;
  border-radius: ${({ theme }) => theme.unit * 1.5}px;
  border: ${({ theme }) => `2px solid ${theme.colorBase.textPrimary}`};
  border-color: ${({ theme }) => theme.colorBase.textPrimary};
`

const WrapperStyled = styled(Box)`
  flex: 1;
  display: flex;
  flex-direction: column;
  background: var(--color-box);
  border-radius: ${({ theme }) => theme.unit}px;
`

export const BeginnerMode: any = withTranslation('common')(
  ({
    t,
    setConfirmDualInvest,
  }: WithTranslation & {
    setConfirmDualInvest: (state: any) => void
  }) => {
    const { tradeMap, marketMap } = useDualMap()
    const { coinJson } = useSettings()
    const { forexMap } = useSystem()
    const { tokenMap, idIndex } = useTokenMap()
    const { setShowDual } = useOpenModals()
    const {
      pairASymbol,
      pairBSymbol,
      isLoading,
      dualProducts,
      currentPrice,
      market,

      step1SelectedToken,
      step2BuyOrSell,
      step3Token,
      onSelectStep1Token,
      onSelectStep2BuyOrSell,
      onSelectStep3Token,
      isDualBalanceSufficient,
    } = useDualHook({ setConfirmDualInvest })
    const { isMobile } = useSettings()

    const dualType =
      step2BuyOrSell === 'Sell' ? sdk.DUAL_TYPE.DUAL_BASE : sdk.DUAL_TYPE.DUAL_CURRENCY
    const tokenList = Reflect.ownKeys(tradeMap ?? {})
      .filter(
        (tokenName) => tokenName !== 'USDT' && tokenName !== 'USDC' && tokenName !== 'OLDUSDC',
      )
      .sort((a, b) => a.toString().localeCompare(b.toString()))
      .map((tokenName) => {
        const list = values(marketMap)
          .flatMap((x) => {
            const baseToken = idIndex[x.baseTokenId]
            const quoteToken = idIndex[x.quoteTokenId]
            return [
              {
                token: baseToken,
                // @ts-ignore
                apyInfo: x.baseTokenApy,
              },
              {
                token: quoteToken,
                // @ts-ignore
                apyInfo: x.quoteTokenApy,
              },
            ]
          })
          .filter((x) => x.token === tokenName.toString())
        const min = minBy(list, (x) => {
          return Number(x.apyInfo && x.apyInfo.min)
        })
        const max = maxBy(list, (x) => {
          return Number(x.apyInfo && x.apyInfo.max)
        })
        return {
          tokenName,
          minAPY: min?.apyInfo.min,
          maxAPY: max?.apyInfo.max,
          logo: 'https://www.baidu.com/img/PCtm_d9c8750bed0b3c7d089fa7d55720d6cf.png',
        }
      })
    // marketMap[]
    const step3Tokens = step1SelectedToken ? tradeMap[step1SelectedToken].tokenList : []
    const theme = useTheme()
    const showStep2 = step1SelectedToken !== undefined
    const showStep3 = step2BuyOrSell !== undefined
    const showTable = step3Token !== undefined
    return (
      <Box display={'flex'} flexDirection={'column'} flex={1} marginBottom={2}>
        <Box marginBottom={5}>
          <Typography marginBottom={2} display={'flex'} variant={'h2'}>
            {t('labelDualBeginnerStep1Title')}
          </Typography>
          <Box display={'flex'} flexDirection={'row'}>
            {tokenList.map(({ tokenName, minAPY, maxAPY, logo }) => {
              const selected = step1SelectedToken === tokenName
              return (
                <Box marginRight={2} key={logo}>
                  <TickCardStyleItem
                    className={
                      selected ? 'btnCard dualInvestCard selected' : 'btnCard dualInvestCard '
                    }
                    selected={selected}
                    onClick={() => onSelectStep1Token(tokenName.toString())}
                  >
                    <CardContent sx={{ alignItems: 'center' }}>
                      <Typography component={'span'} display={'inline-flex'}>
                        <CoinIcon
                          size={32}
                          symbol={typeof tokenName === 'string' ? tokenName : ''}
                        />
                      </Typography>
                      <Typography paddingLeft={1}>
                        <Typography
                          color={
                            selected ? theme.colorBase.textPrimary : theme.colorBase.textSecondary
                          }
                        >
                          {tokenName.toString()}
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

        {showStep2 && (
          <Box marginBottom={5}>
            <Typography marginBottom={2} display={'flex'} variant={'h2'}>
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
                  onClick={() => onSelectStep2BuyOrSell('Sell')}
                >
                  <CardContent sx={{ alignItems: 'center' }}>
                    <Typography component={'span'} display={'inline-flex'}>
                      <Avatar alt={'sell-high'} src={SoursURL + '/svg/sell-high.svg'} />
                    </Typography>
                    <Typography paddingLeft={1}>
                      <Typography
                        color={
                          step2BuyOrSell === 'Sell'
                            ? theme.colorBase.textPrimary
                            : theme.colorBase.textSecondary
                        }
                      >
                        {t('labelDualBeginnerSellHigh', {
                          token: step1SelectedToken,
                        })}
                      </Typography>
                      <Typography variant={'body2'} color={theme.colorBase.textSecondary}>
                        {t('labelDualBeginnerReceiveStable')}
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
                  onClick={() => onSelectStep2BuyOrSell('Buy')}
                >
                  <CardContent sx={{ alignItems: 'center' }}>
                    <Typography component={'span'} display={'inline-flex'}>
                      <Avatar alt={'buy-low'} src={SoursURL + '/svg/buy-low.svg'} />
                    </Typography>
                    <Typography paddingLeft={1}>
                      <Typography
                        color={
                          step2BuyOrSell === 'Buy'
                            ? theme.colorBase.textPrimary
                            : theme.colorBase.textSecondary
                        }
                      >
                        {t('labelDualBeginnerBuyLow', {
                          token: step1SelectedToken,
                        })}
                      </Typography>
                      <Typography variant={'body2'} color={theme.colorBase.textSecondary}>
                        {t('labelDualBeginnerInvestStable')}
                      </Typography>
                    </Typography>
                  </CardContent>
                </TickCardStyleItem>
              </Box>
            </Box>
          </Box>
        )}

        {showStep3 && (
          <Box marginBottom={2}>
            <Typography marginBottom={2} display={'flex'} variant={'h2'}>
              {t('labelDualBeginnerStep3Title')}
            </Typography>
            <Box display={'flex'} flexDirection={'row'}>
              {step3Tokens.map((token) => {
                return (
                  <Box marginRight={2} key={token}>
                    <TickCardStyleItem
                      className={
                        step3Token === token
                          ? 'btnCard dualInvestCard selected'
                          : 'btnCard dualInvestCard '
                      }
                      selected={step3Token === token}
                      onClick={() => onSelectStep3Token(token)}
                    >
                      <CardContent sx={{ alignItems: 'center' }}>
                        <Typography component={'span'} display={'inline-flex'}>
                          <CoinIcon size={20} symbol={token} />
                        </Typography>
                        <Typography paddingLeft={1}>
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
        {showTable && (
          <WrapperStyled marginTop={1} flex={1} flexDirection={'column'}>
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
                        </Typography>{' '}
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
