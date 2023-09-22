import { WithTranslation, withTranslation } from 'react-i18next'
import {
  Avatar,
  Box,
  BoxProps,
  BoxTypeMap,
  Card,
  CardContent,
  Divider,
  Grid,
  Link,
  Typography,
} from '@mui/material'
import styled from '@emotion/styled'

import React from 'react'
import { useOverview } from './hook'

import { Button, useSettings, InvestOverviewTable, useToggle } from '@loopring-web/component-lib'
import { useHistory } from 'react-router-dom'
import {
  BackIcon,
  ammAdvice,
  defiAdvice,
  AccountStatus,
  RowInvestConfig,
  dualAdvice,
  myLog,
  stakeAdvice,
  SoursURL,
  leverageETHAdvice,
  Overview,
  EmptyValueTag,
} from '@loopring-web/common-resources'
import {
  useAccount,
  useAmmMap,
  useDefiMap,
  useDualMap,
  useNotify,
  useStakingMap,
} from '@loopring-web/core'
import { useTheme } from '@emotion/react'
import { MaxWidthContainer, containerColors } from '..'
import _ from 'lodash'

const WrapperStyled = styled(Box)`
  flex: 1;
  display: flex;
  flex-direction: column;
  /* background: var(--dark700); */
  border-radius: ${({ theme }) => theme.unit}px;
  width: 100%;
  overflow: hidden;
  .MuiCard-root {
    padding: ${({ theme }) => 4 * theme.unit}px;
    padding-top: ${({ theme }) => 6 * theme.unit}px;
    cursor: pointer;
    background: var(--dark700);
    border: 1px solid;
    border-color: var(--color-border);
    width: ${({ theme }) => 34 * theme.unit}px;
    .MuiCardContent-root {
      padding: 0;
    }
    box-shadow: none;
    .hover-button {
      background: var(--color-button-inactive);
      color: var(--color-text-primary);
    }
    :hover {
      /* background: var(--color-box-hover); */
      box-shadow: var(--color-shadow);
      .hover-button {
        color: var(--color-text-button);
        background: var(--color-primary);
      }
    }
  }

  .scroll-view::-webkit-scrollbar {
    display: none;
  }
  @media only screen and (max-width: 768px) {
    .MuiCard-root {
      width: 100%;
      margin-bottom: 12px;
    }
  }
`

const getAprRange = (list: number[]) => {
  const aprs = list.sort((a, b) => a - b)
  return (
    aprs.length > 0 && {
      from: aprs[0],
      to: aprs[aprs.length - 1],
    }
  )
}

export const OverviewPanel = withTranslation('common')(({ t }: WithTranslation & {}) => {
  const { filteredData, filterValue, getFilteredData, rawData, myMapLoading, myRawData } =
    useOverview()
  const { coinJson, isMobile } = useSettings()
  const { account } = useAccount()
  const { notifyMap } = useNotify()
  const { ammMap } = useAmmMap()
  const { marketMap, marketLeverageMap } = useDefiMap()
  const { marketMap: dualMarketMap } = useDualMap()
  const { marketMap: LRCMarketMap } = useStakingMap()

  const ammApr = React.useMemo(() => {
    return getAprRange(
      _.values(ammMap)
        .filter((amm) => amm && amm.APR)
        .map((amm) => amm.APR!),
    )
  }, [ammMap])
  const defiApr = React.useMemo(() => {
    return getAprRange(
      _.values(marketMap)
        .filter((defi) => defi && defi.apy)
        .map((defi) => Number(defi.apy)),
    )
  }, [marketMap])
  const dualApr = React.useMemo(() => {
    return getAprRange(
      _.values(dualMarketMap)
        .flatMap((dual: any) => [
          dual.quoteTokenApy?.max as string,
          dual.quoteTokenApy?.min as string,
        ])
        .filter((apy) => apy)
        .map((apy) => Number(apy)),
    )
  }, [dualMarketMap])
  const lrcApr = React.useMemo(() => {
    return getAprRange(
      _.values(LRCMarketMap)
        .filter((lrc) => lrc.apr)
        .map((lrc) => Number(lrc.apr)),
    )
  }, [LRCMarketMap])
  const leverageApr = React.useMemo(() => {
    return getAprRange(
      _.values(marketLeverageMap)
        .filter((leverage) => leverage.apy)
        .map((leverage) => Number(leverage.apy)),
    )
  }, [marketLeverageMap])

  const showLoading = filteredData && !filteredData.length
  const history = useHistory()
  const {
    toggle: { CIETHInvest },
  } = useToggle()
  const investAdviceList = [
    { ...ammAdvice, ...notifyMap?.invest?.investAdvice[0], apyRange: ammApr },
    { ...defiAdvice, ...notifyMap?.invest?.investAdvice[1], apyRange: defiApr },
    { ...dualAdvice, ...notifyMap?.invest?.investAdvice[2], apyRange: dualApr },
    { ...stakeAdvice, ...notifyMap?.invest?.investAdvice[3], apyRange: lrcApr },
    ...(!CIETHInvest.enable && CIETHInvest.reason === 'no view'
      ? []
      : [{ ...leverageETHAdvice, ...notifyMap?.invest?.investAdvice[4], apyRange: leverageApr }]),
  ]
  const theme = useTheme()

  return (
    <>
      <WrapperStyled>
        <MaxWidthContainer
          display={'flex'}
          justifyContent={'space-between'}
          background={containerColors[0]}
          height={isMobile ? 60 * theme.unit : 34 * theme.unit}
          alignItems={'center'}
        >
          <Box paddingY={7}>
            <Typography
              color={'var(--color-text-primary)'}
              marginBottom={2}
              fontSize={'48px'}
              variant={'h1'}
            >
              {t('labelInvestLoopringEarn')}
            </Typography>
            <Typography marginBottom={3} color={'var(--color-text-secondary)'} variant={'h4'}>
              {t('labelInvestLoopringEarnDes')}
            </Typography>
            <Button
              onClick={() => history.push('/invest/balance')}
              sx={{ width: isMobile ? 36 * theme.unit : 18 * theme.unit }}
              variant={'contained'}
            >
              {t('labelAssetInvests')}
            </Button>
          </Box>
          <Box marginRight={5}>{!isMobile && <Overview />}</Box>
        </MaxWidthContainer>
        <MaxWidthContainer marginTop={5} minHeight={'80vh'} background={containerColors[1]}>
          <Box
            sx={{
              width: '100%',
              overflowX: 'scroll',
              maxWidth: 'lg',
              paddingY: 3,
            }}
            className={'scroll-view'}
          >
            <Box
              sx={{
                display: 'flex',
                width: isMobile ? '100%' : 'fit-content',
                flexDirection: isMobile ? 'column' : 'row',
              }}
            >
              {investAdviceList.map((item, index) => {
                return (
                  <Card
                    key={item.type}
                    onClick={() => history.push(item.router)}
                    sx={{ marginRight: 2.5 }}
                  >
                    <CardContent>
                      <Box display={'flex'} flexDirection={'column'} alignItems={'center'}>
                        <Avatar
                          variant='circular'
                          style={{
                            height: 'var(--svg-size-huge)',
                            width: 'var(--svg-size-huge)',
                          }}
                          src={item.banner}
                        />
                        <Typography marginTop={0.5} variant={'h5'}>
                          {t(item.titleI18n, { ns: 'layout' })}
                        </Typography>

                        <Typography variant={'h3'} marginTop={5}>
                          {item.apyRange
                            ? `${item.apyRange.from}%-${item.apyRange.to}%`
                            : EmptyValueTag}
                        </Typography>
                        <Typography>{t('labelAPR')}</Typography>
                        <Button
                          className={'hover-button'}
                          sx={{ marginTop: 2 }}
                          fullWidth
                          variant={'contained'}
                        >
                          {t('labelLiquidityDeposit')}
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                )
              })}
            </Box>
          </Box>
          <Box marginTop={5} display={'flex'} flex={1} marginBottom={1} flexDirection={'column'}>
            <InvestOverviewTable
              showLoading={showLoading}
              showFilter={true}
              filterValue={filterValue}
              getFilteredData={getFilteredData}
              coinJson={coinJson}
              rawData={filteredData}
              rowConfig={RowInvestConfig}
            />
            {rawData.length !== filteredData.length && (
              <Link
                variant={'body1'}
                marginY={1}
                textAlign={'center'}
                display={'inline-flex'}
                justifyContent={'center'}
                onClick={() => {
                  getFilteredData('')
                }}
              >
                {t('labelViewMore')}
              </Link>
            )}
          </Box>
        </MaxWidthContainer>
      </WrapperStyled>
    </>
  )
})
