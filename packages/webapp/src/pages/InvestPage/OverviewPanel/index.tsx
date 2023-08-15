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
} from '@loopring-web/common-resources'
import { useAccount, useNotify } from '@loopring-web/core'
import { useTheme } from '@emotion/react'
import { MaxWidthContainer } from '..'

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
    cursor: pointer;
    background: var(--dark700);
    border: 1px solid;
    border-color: var(--color-border);
    width: ${({ theme }) => 35 * theme.unit}px;
    .MuiCardContent-root {
      padding: 0;
    }
    box-shadow: none;
    .hover-button {
      background: var(--color-button-inactive);
      color: var(--color-text-primary);
    }
    :hover {
      background: var(--color-box-hover);
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
`


export const OverviewPanel = withTranslation('common')(({ t }: WithTranslation & {}) => {
  const { filteredData, filterValue, getFilteredData, rawData, myMapLoading, myRawData } =
    useOverview()
  const { coinJson } = useSettings()
  const { account } = useAccount()
  const { notifyMap } = useNotify()
  const showLoading = filteredData && !filteredData.length
  const history = useHistory()
  const {
    toggle: { CIETHInvest },
  } = useToggle()
  const investAdviceList = [
    { ...ammAdvice, ...notifyMap?.invest?.investAdvice[0] },
    { ...defiAdvice, ...notifyMap?.invest?.investAdvice[1] },
    { ...dualAdvice, ...notifyMap?.invest?.investAdvice[2] },
    { ...stakeAdvice, ...notifyMap?.invest?.investAdvice[3] },
    ...(!CIETHInvest.enable && CIETHInvest.reason === 'no view'
      ? []
      : [{ ...leverageETHAdvice, ...notifyMap?.invest?.investAdvice[4] }]),
  ]
  const theme = useTheme()

  
  return (
    <>
      <WrapperStyled >
        <MaxWidthContainer
          display={'flex'}
          justifyContent={'space-between'}
          background={'var(--color-box)'}
        >
          <Box paddingY={7}>
            <Typography
              color={'var(--color-text-primary)'}
              marginBottom={2}
              fontSize={'48px'}
              variant={'h1'}
            >
              {t("labelInvestLoopringEarn")}
            </Typography>
            <Typography marginBottom={3} color={'var(--color-text-secondary)'} variant={'h4'}>
              {t("labelInvestLoopringEarnDes")}
            </Typography>
            <Button
              onClick={() => history.push('/invest/balance')}
              sx={{ width: 18 * theme.unit }}
              variant={'contained'}
            >
              {t("labelAssetInvests")}
            </Button>
          </Box>
          <Box marginRight={5}>
            <img
              src={
                SoursURL +
                (theme.mode === 'dark'
                  ? 'images/earn-page-title.svg'
                  : 'images/earn-page-title-light.svg')
              }
            />
          </Box>
        </MaxWidthContainer>
        <MaxWidthContainer marginTop={5} minHeight={'80vh'} background={'var(--color-box-secondary)'}>
          <Box
            sx={{
              width: '100%',
              overflowX: 'scroll',
              maxWidth: 'lg',
              paddingY: 3,
            }}
            className={'scroll-view'}
          >
            <Box sx={{ display: 'flex', width: 'fit-content' }}>
              {investAdviceList.map((item, index) => {
                return (
                  <Card key={item.type} onClick={() => history.push(item.router)} sx={{ marginRight: 2.5 }}>
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
                        <Typography variant={'h5'}>
                          {t(item.titleI18n, { ns: 'layout' })}
                        </Typography>

                        <Typography variant={'h3'} marginTop={5} >
                          21.2%-102.38%
                        </Typography>
                        <Typography>{t("labelAPR")}</Typography>
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
