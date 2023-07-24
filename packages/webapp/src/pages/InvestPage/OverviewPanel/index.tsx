import { WithTranslation, withTranslation } from 'react-i18next'
import { Avatar, Box, Card, CardContent, Divider, Grid, Link, Typography } from '@mui/material'
import styled from '@emotion/styled'

import React from 'react'
import { useOverview } from './hook'

import { Button, useSettings, InvestOverviewTable } from '@loopring-web/component-lib'
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
} from '@loopring-web/common-resources'
import { useAccount, useNotify } from '@loopring-web/core'
import { useTheme } from '@emotion/react'

const WrapperStyled = styled(Box)`
  flex: 1;
  display: flex;
  flex-direction: column;
  background: var(--color-box);
  border-radius: ${({ theme }) => theme.unit}px;
  .MuiCard-root {
    padding: ${({ theme }) => 2 * theme.unit}px;
    cursor: pointer;
    background: var(--color-pop-bg);
    .MuiCardContent-root {
      padding: 0;
    }
    :hover {
      background: var(--color-box-hover);
    }
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
  const investAdviceList = [
    { ...ammAdvice, ...notifyMap?.invest?.investAdvice[0] },
    { ...defiAdvice, ...notifyMap?.invest?.investAdvice[1] },
    { ...dualAdvice, ...notifyMap?.invest?.investAdvice[2] },
    { ...stakeAdvice, ...notifyMap?.invest?.investAdvice[3] },
  ]
  const theme = useTheme()
  return (
    <>
      <WrapperStyled marginBottom={3}>
        <Typography marginBottom={2} fontSize={"48px"} variant={"h1"}>
          Loopring Earn
        </Typography>
        <Typography marginBottom={3} color={"var(--color-text-third)"} variant={"h4"}>
          Earn stable profits with professional asset management
        </Typography>
        <Button sx={{width: 18 * theme.unit}} variant={"contained"}>My Investment</Button>
        <Grid container spacing={2} padding={3}>
          {investAdviceList.map((item, index) => {
            return (
              <Grid item xs={12} md={4} lg={3} key={item.type + index}>
                <Card onClick={() => history.push(item.router)}>
                  <CardContent>
                    <Box display={'flex'} flexDirection={'row'} alignItems={'center'}>
                      <Avatar
                        variant='circular'
                        style={{
                          height: 'var(--svg-size-huge)',
                          width: 'var(--svg-size-huge)',
                        }}
                        src={item.banner}
                      />
                      <Box flex={1} display={'flex'} flexDirection={'column'} paddingLeft={1}>
                        <Typography variant={'h5'}>
                          {t(item.titleI18n, { ns: 'layout' })}
                        </Typography>
                        <Typography
                          variant={'body2'}
                          textOverflow={'ellipsis'}
                          whiteSpace={'pre'}
                          overflow={'hidden'}
                          color={'var(--color-text-third)'}
                        >
                          {t(item.desI18n, { ns: 'layout' })}
                        </Typography>
                      </Box>
                      <BackIcon
                        fontSize={'small'}
                        htmlColor={'var(--color-text-third)'}
                        sx={{
                          transform: 'rotate(180deg)',
                        }}
                      />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            )
          })}
        </Grid>
        {!!(account.readyState === AccountStatus.ACTIVATED) && (
          <>
            <Box display={'flex'} flexDirection={'column'}>
              <Typography variant={'h5'} marginBottom={1} marginX={3}>
                {t('labelTitleMyInvestAvailable', { ns: 'common' })}
              </Typography>
              <InvestOverviewTable
                showLoading={myMapLoading}
                coinJson={coinJson}
                rawData={myRawData}
                rowConfig={RowInvestConfig}
              />
            </Box>
            <Box marginTop={3} marginBottom={2} marginX={2}>
              <Divider />
            </Box>
          </>
        )}

        <Box display={'flex'} flex={1} marginBottom={1} flexDirection={'column'}>
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
      </WrapperStyled>
    </>
  )
})
