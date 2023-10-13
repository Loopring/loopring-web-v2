import styled from '@emotion/styled'
import { Meta, Story } from '@storybook/react/types-6-0'
import { MemoryRouter } from 'react-router-dom'
import {
  Box,
  Breadcrumbs,
  Container,
  GlobalStyles,
  Grid,
  Hidden,
  Link,
  Toolbar,
  Typography,
} from '@mui/material'

import { css, Theme, useTheme } from '@emotion/react'
import {
  AmmDetailExtendProps,
  AmmInData,
  AmmPanelType,
  CoinInfo,
  EmptyValueTag,
  FloatTag,
  globalCss,
  headerMenuData,
  headerToolBarData,
  LinkedIcon,
  MyAmmLP,
  PriceTag,
  YEAR_DAY_FORMAT,
} from '@loopring-web/common-resources'

import { account, ammCalcData, coinMap, tradeCalcData } from '../../static'
import { withTranslation } from 'react-i18next'
import { useSettings } from '../../stores'
import moment from 'moment'
import { TradeTitle } from '../block'
import { Header } from '../header'
import React from 'react'
import { AmmPanel, AmmProps } from '../tradePanel'
import { Currency } from '@loopring-web/loopring-sdk'

const Style = styled.div``
const tradeData: any = {
  coinA: { belong: 'ETH', balance: 0.3, tradeValue: 0 },
  coinB: { belong: 'LRC', balance: 1000, tradeValue: 0 },
}

const titleInfo: AmmDetailExtendProps<AmmInData<any>, any> = {
  // tradeCalcData:,
  ammCalcData: ammCalcData,
  activity: {
    ruleType: 'SWAP_VOLUME_RANKING',
    market: 'LRC-ETH',
    status: 'NotStarted' as any,
    totalRewards: 1232141,
    myRewards: 122,
    rewardToken: coinMap['USDT'] as CoinInfo<any>,
    duration: {
      from: new Date('2021-1-1'),
      to: new Date(),
    },
  },
  coinAInfo: coinMap[ammCalcData.myCoinA.belong] as CoinInfo<any>,
  coinBInfo: coinMap[ammCalcData.myCoinB.belong] as CoinInfo<any>,
  tradeFloat: {
    change: 1000,
    timeUnit: '24h',
    priceU: 1.23123,
    floatTag: FloatTag.increase,
    // tagNew: false,
  },
  amountU: 197764.89,
  totalLPToken: 12132131,
  totalA: 0.002,
  totalB: 12344,
  totalAU: 0.002,
  totalBU: 12344,
  rewardToken: 'LRC',
  rewardA: 13,
  feeA: 121,
  feeB: 1232,
  isNew: true,
  isActivity: false,
  APR: 56,
}
const myAmm: MyAmmLP<any> = {
  feeA: 122,
  feeB: 21,
  feeU: 0.0012,
  reward: 123,
  rewardToken: coinMap.DPR as CoinInfo<any>,
  balanceA: 12131,
  balanceB: 0.0012,
  balanceU: 232,
}
const AmmDetailWrap = withTranslation('common')(({ t, ...rest }: any) => {
  const ammProps: AmmProps<any, any, any, any> = {
    ammCalcDataDeposit: ammCalcData,
    ammCalcDataWithDraw: ammCalcData,
    refreshRef: React.createRef(),
    ammDepositData: tradeData,
    ammWithdrawData: tradeData,
    // tradeCalcData,
    handleAmmAddChangeEvent: (data, type) => {
      console.log('handleAmmAddChangeEvent', data, type)
    },
    handleAmmRemoveChangeEvent: (data) => {
      console.log('handleAmmRemoveChangeEvent', data)
    },
    onAmmRemoveClick: (data) => {
      console.log('onAmmRemoveClick', data)
    },
    onAmmAddClick: (data) => {
      console.log('onAmmAddClick', data)
    },
  }

  const WrapAmmPanel = (rest: any) => {
    return <AmmPanel {...{ ...ammProps, tabSelected: AmmPanelType.Join }} {...rest} />
  }

  const BoxStyled = styled(Box)`
    ${({ theme }) => theme.border.defaultFrame({ c_key: '' })};
    background-color: var(--color-box);
  `
  const { currency } = useSettings()

  return (
    <>
      <Header
        account={account}
        headerMenuData={headerMenuData}
        headerToolBarData={headerToolBarData}
        selected={'markets'}
        notification={undefined}
        allowTrade={{
          register: {
            enable: false,
            reason: undefined,
          },
          order: {
            enable: false,
            reason: undefined,
          },
          joinAmm: {
            enable: false,
            reason: undefined,
          },
          dAppTrade: {
            enable: false,
            reason: undefined,
          },
          raw_data: {
            enable: false,
            reason: undefined,
          },
        }}
        isMobile={false}
      />
      <Toolbar />
      <Container maxWidth='lg'>
        {/*style={{height: '100%' }}*/}
        <Grid container marginTop={3}>
          <Grid item xs={8}>
            <Breadcrumbs aria-label='breadcrumb'>
              <Link color='textSecondary' href='/'>
                {t('labelAmmList')}
              </Link>
              <Typography
                color={'textSecondary'}
                display={'flex'}
                alignItems={'center'}
                justifyContent={'center'}
              >
                {tradeData.coinA.belong}
                <LinkedIcon />
                {tradeData.coinB.belong}
              </Typography>
            </Breadcrumbs>
          </Grid>
          <Grid item xs={4} alignItems={'center'} justifyContent={'flex-end'} display={'flex'}>
            <Link href={''} variant={'h6'}>
              {t('labelBack')}
            </Link>
          </Grid>
        </Grid>
        <Grid container marginTop={3}>
          <Grid item xs={7}>
            <TradeTitle
              accoun={account}
              {...{
                t,
                ...rest,
                tReady: rest.ready,
                tradeCalcData,
                tradeFloat: {
                  priceU: +123,
                  change: '+15%',
                  timeUnit: '24h',
                },
              }}
            />
          </Grid>
          {/*<ButtonListRightStyled item xs={5} minWidth={'328'} display={'flex'} flexDirection={'row'}*/}
          {/*                       justifyContent={'flex-end'} alignItems={'flex-end'}>*/}
          {/*    <Button variant={'contained'} size={'small'} color={'primary'}*/}
          {/*            loading={btnShowTradeStatus === TradeBtnStatus.LOADING ? 'true' : 'false'}*/}
          {/*            disabled={btnShowTradeStatus === TradeBtnStatus.DISABLED}*/}
          {/*            onClick={onShowTrade}>{t('labelTrade')}</Button>*/}

          {/*</ButtonListRightStyled>*/}
        </Grid>

        <Box flex={1} display={'flex'} alignItems={'stretch'} flexDirection='row' marginTop={3}>
          <Box flex={1} display={'flex'}>
            <Grid container spacing={2} wrap={'nowrap'}>
              <Grid
                item
                md={5}
                xs={12}
                paddingRight={2}
                display={'flex'}
                flexDirection={'column'}
                alignItems={'stretch'}
                justifyContent={'space-between'}
              >
                <BoxStyled
                  paddingY={3}
                  paddingX={(1 / 2) * 5}
                  display={'flex'}
                  flexDirection={'column'}
                >
                  <Typography
                    component={'p'}
                    color={'textSecondary'}
                    display={'flex'}
                    justifyContent={'space-between'}
                  >
                    <Typography component={'span'} style={{ textTransform: 'capitalize' }}>
                      {t('labelLiquidity')}
                    </Typography>
                    <Typography component={'span'} style={{ textTransform: 'uppercase' }}>
                      {t('labelAPR')}
                    </Typography>
                  </Typography>
                  <Typography
                    component={'p'}
                    color={'textPrimary'}
                    display={'flex'}
                    justifyContent={'space-between'}
                    marginTop={1}
                  >
                    <>
                      <Typography component={'span'}>
                        {' '}
                        {typeof titleInfo.amountU === 'undefined'
                          ? EmptyValueTag
                          : currency === Currency.usd
                          ? PriceTag.Dollar + titleInfo.amountU
                          : 0}
                      </Typography>
                      <Typography component={'span'}>
                        {' '}
                        {titleInfo.APR ? titleInfo.APR : EmptyValueTag}%
                      </Typography>
                    </>
                  </Typography>

                  <Typography
                    component={'p'}
                    color={'textSecondary'}
                    display={'flex'}
                    justifyContent={'space-between'}
                    marginTop={2}
                  >
                    <Typography component={'span'} color={'textSecondary'}>
                      <Hidden mdDown>{t('labelLPTotal')}</Hidden>
                      {t('labelLPTokens')}
                    </Typography>
                    <Typography component={'span'} color={'textSecondary'}>
                      {titleInfo.totalLPToken}
                    </Typography>
                  </Typography>
                  <Typography
                    component={'p'}
                    color={'textSecondary'}
                    display={'flex'}
                    justifyContent={'space-between'}
                    marginTop={1}
                  >
                    <Typography component={'span'} color={'textSecondary'}>
                      <Hidden mdDown>{t('labelLPTotal')}</Hidden>
                      {titleInfo.ammCalcData?.myCoinA.belong}
                    </Typography>

                    <Typography component={'span'} color={'textSecondary'}>
                      {titleInfo.totalA}
                    </Typography>
                  </Typography>
                  <Typography
                    component={'p'}
                    color={'textSecondary'}
                    display={'flex'}
                    justifyContent={'space-between'}
                    marginTop={1}
                  >
                    <Typography component={'span'} color={'textSecondary'}>
                      <Hidden mdDown>{t('labelLPTotal')}</Hidden>
                      {titleInfo.ammCalcData?.myCoinB.belong}
                    </Typography>
                    <Typography component={'span'} color={'textSecondary'}>
                      {titleInfo.totalB}
                    </Typography>
                  </Typography>
                </BoxStyled>
                <BoxStyled
                  paddingY={3}
                  paddingX={(1 / 2) * 5}
                  display={'flex'}
                  flexDirection={'column'}
                >
                  <Typography
                    component={'p'}
                    color={'textSecondary'}
                    display={'flex'}
                    justifyContent={'space-between'}
                    alignItems={'center'}
                  >
                    <Typography component={'span'} color={'textSecondary'} variant={'body2'}>
                      {titleInfo.tradeFloat.timeUnit} {t('labelVolume')}
                    </Typography>
                    <Typography component={'span'} color={'textSecondary'}>
                      {t('labelFee')} {/* ' : '*/}
                    </Typography>
                  </Typography>
                  <Typography
                    component={'p'}
                    color={'textSecondary'}
                    display={'flex'}
                    justifyContent={'space-between'}
                    marginTop={1}
                    alignItems={'center'}
                  >
                    <Typography component={'span'} variant={'h5'} color={'textPrimary'}>
                      {PriceTag.Dollar + titleInfo.tradeFloat.priceU}
                    </Typography>
                    <Typography
                      noWrap
                      textAlign={'center'}
                      component={'span'}
                      color={'textSecondary'}
                      variant={'body2'}
                      textOverflow={'ellipsis'}
                      display={'flex'}
                      alignItems={'center'}
                    >
                      <Typography
                        component={'span'}
                        color={'inherit'}
                        variant={'inherit'}
                        display={'flex'}
                        flexDirection={'column'}
                      >
                        <Typography component={'span'} color={'inherit'} variant={'inherit'}>
                          {titleInfo.ammCalcData?.myCoinA.belong}
                        </Typography>
                        <Typography component={'span'} color={'inherit'} variant={'inherit'}>
                          {titleInfo.feeA}
                        </Typography>
                      </Typography>
                      <Typography component={'span'} color={'inherit'} variant={'h6'} paddingX={1}>
                        {' + '}
                      </Typography>
                      <Typography
                        component={'span'}
                        color={'inherit'}
                        variant={'inherit'}
                        display={'flex'}
                        flexDirection={'column'}
                      >
                        <Typography component={'span'} color={'inherit'} variant={'inherit'}>
                          {titleInfo.ammCalcData?.myCoinB.belong}
                        </Typography>
                        <Typography component={'span'} color={'inherit'} variant={'inherit'}>
                          {titleInfo.feeB}
                        </Typography>
                      </Typography>
                    </Typography>
                  </Typography>
                </BoxStyled>
                <BoxStyled
                  paddingY={3}
                  paddingX={(1 / 2) * 5}
                  display={'flex'}
                  flexDirection={'column'}
                >
                  <Typography
                    component={'p'}
                    color={'textSecondary'}
                    display={'flex'}
                    justifyContent={'space-between'}
                  >
                    <Typography component={'span'} color={'textSecondary'}>
                      {' '}
                      {t('labelMyPoolShare')}
                    </Typography>
                  </Typography>
                  <Typography
                    component={'p'}
                    color={'textSecondary'}
                    display={'flex'}
                    justifyContent={'space-between'}
                    marginTop={1}
                  >
                    <Typography component={'span'} color={'textSecondary'}>
                      {' '}
                      {myAmm.balanceA ? myAmm.balanceA : EmptyValueTag}{' '}
                      {titleInfo.ammCalcData?.myCoinA.belong}{' '}
                    </Typography>
                    <Typography component={'span'} color={'textSecondary'} variant={'h6'}>
                      {' '}
                      --{' '}
                    </Typography>
                  </Typography>
                  <Typography
                    component={'p'}
                    color={'textSecondary'}
                    display={'flex'}
                    justifyContent={'space-between'}
                    marginTop={1}
                  >
                    <Typography component={'span'} color={'textSecondary'}>
                      {' '}
                      {myAmm.balanceB ? myAmm.balanceA : EmptyValueTag}{' '}
                      {titleInfo.ammCalcData?.myCoinB.belong}
                    </Typography>
                    <Typography component={'span'} color={'textSecondary'} variant={'h6'}>
                      {' '}
                      --{' '}
                    </Typography>
                  </Typography>
                </BoxStyled>
                <BoxStyled
                  paddingY={3}
                  paddingX={(1 / 2) * 5}
                  display={'flex'}
                  flexDirection={'column'}
                >
                  <Box display={'flex'} flexDirection={'row'} justifyContent={'space-between'}>
                    <Typography display={'flex'} flexDirection={'column'} component={'div'}>
                      <Typography variant={'body2'} component={'h5'} color={'textSecondary'}>
                        {t('labelReward')}
                      </Typography>
                      <Typography variant={'body1'} component={'span'} color={'textPrimary'}>
                        {typeof titleInfo.activity === 'undefined' ? (
                          EmptyValueTag
                        ) : (
                          <>
                            <Typography component={'span'}>
                              {titleInfo.activity.totalRewards}{' '}
                            </Typography>
                            <Typography component={'span'}>
                              {titleInfo.activity.rewardToken.simpleName}
                            </Typography>
                          </>
                        )}
                      </Typography>
                    </Typography>
                    <Typography
                      display={'flex'}
                      flexDirection={'column'}
                      alignItems={'flex-end'}
                      component={'div'}
                    >
                      <Typography variant={'body2'} component={'h5'} color={'textSecondary'}>
                        {t('labelMyReward')}
                      </Typography>
                      <Typography variant={'body1'} component={'span'} color={'textPrimary'}>
                        {typeof titleInfo.activity === 'undefined' ? (
                          EmptyValueTag
                        ) : (
                          <>
                            <Typography component={'span'}>
                              {myAmm.reward}
                              <Typography component={'span'}>
                                {titleInfo.activity.rewardToken.simpleName}
                              </Typography>
                            </Typography>
                          </>
                        )}
                      </Typography>
                    </Typography>
                  </Box>
                  <Typography
                    alignSelf={'flex-start'}
                    variant={'body2'}
                    color={'textSecondary'}
                    component='span'
                    marginTop={1}
                  >
                    {t('labelDate')}:
                    {typeof titleInfo.activity === 'undefined'
                      ? EmptyValueTag
                      : moment(titleInfo.activity.duration.from).format(YEAR_DAY_FORMAT) +
                        ' - ' +
                        moment(titleInfo.activity.duration.to).format(YEAR_DAY_FORMAT)}
                  </Typography>
                </BoxStyled>
              </Grid>
              <Hidden mdDown>
                <Grid item md={7} paddingRight={2}></Grid>
              </Hidden>
            </Grid>
          </Box>
          <Box display={'flex'}>
            <WrapAmmPanel />
          </Box>
        </Box>
      </Container>

      {/*<Footer></Footer>*/}
    </>
  )
})

const Template: Story<any> = () => {
  const theme: Theme = useTheme()
  return (
    <>
      <GlobalStyles
        styles={css`
      ${globalCss({ theme })};

      body:before {
        ${
          theme.mode === 'dark'
            ? ` 
                        background: var(--color-global-bg);
                   `
            : ''
        }
      }
    }
    `}
      />
      <Style>
        <MemoryRouter initialEntries={['/']}>
          <AmmDetailWrap />
        </MemoryRouter>
      </Style>{' '}
    </>
  )
}

export default {
  title: 'components/Layout/AmmDetail',
  component: Template,
  argTypes: {},
} as Meta

export const AmmDetailStory = Template.bind({})
// SwitchPanel.args = {}
