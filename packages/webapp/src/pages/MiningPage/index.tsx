import { AmmCard, AmmProps, EmptyDefault, RewardTable } from '@loopring-web/component-lib'
import React from 'react'
import { useHistory } from 'react-router-dom'
import {
  AmmCardProps,
  AmmExitData,
  AmmInData,
  AmmJoinData,
  getMiningLinkList,
  IBData,
} from '@loopring-web/common-resources'
import { Box, Grid, Modal, Typography } from '@mui/material'
import styled from '@emotion/styled'
import { RewardListItem, useAmmMiningUI } from './hook'
import { Trans, withTranslation } from 'react-i18next'
import { AmmPoolActivityRule, LoopringMap } from '@loopring-web/loopring-sdk'
import { store, useAccount, useAmmActivityMap } from '@loopring-web/core'

export enum MiningJumpType {
  orderbook = 'orderbook',
  amm = 'amm',
}

const WrapperStyled = styled(Box)`
  display: flex;
  flex-direction: column;
  flex: 1;
` as typeof Box

const ContentWrapperStyled = styled(Box)`
  position: absolute;
  top: 45%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: ${({ theme }) => theme.unit * 37.5}px;
  max-height: ${({ theme }) => theme.unit * 30}px;
  background-color: var(--color-box);
  box-shadow: 0 ${({ theme }) => theme.unit / 2}px ${({ theme }) => theme.unit / 2}px
    rgba(0, 0, 0, 0.25);
  border-radius: ${({ theme }) => theme.unit / 2}px;
`

type ClickHandler = {
  handleClick: (pair: string, type: MiningJumpType) => void
}

const AmmCardWrap = React.memo(
  React.forwardRef(
    (
      props: AmmCardProps<{ [key: string]: any }> &
        ClickHandler & {
          popoverIdx: number
          ammRewardRecordList: RewardListItem[]
          getLiquidityMining: (market: string, size?: number) => Promise<void>
          setShowRewardDetail: React.Dispatch<React.SetStateAction<boolean>>
          setChosenCardInfo: React.Dispatch<React.SetStateAction<any>>
          getMyAmmShare: (market: string) => any
        },
      ref,
    ) => {
      // const pair = `${props.coinAInfo?.simpleName}-${props.coinBInfo?.simpleName}`;
      const { ruleType } = props.activity
      const { account } = useAccount()
      const type = ruleType === 'ORDERBOOK_MINING' ? MiningJumpType.orderbook : MiningJumpType.amm
      const popoverIdx = props.popoverIdx
      const { setShowRewardDetail, setChosenCardInfo, getMyAmmShare } = props
      const ammInfo = getMyAmmShare(`LP-${props.market}`)
      return props ? (
        <AmmCard
          ref={ref}
          {...props}
          {...{
            popoverIdx,
            getMiningLinkList,
            setShowRewardDetail,
            setChosenCardInfo,
            ammInfo,
          }}
          account={account}
          handleClick={() => props.handleClick(props.market, type)}
        />
      ) : (
        <></>
      )
    },
  ),
)

const AmmList = <I extends { [key: string]: any }>({
  ammActivityViewMap,
  ammRewardRecordList,
  getLiquidityMining,
  setShowRewardDetail,
  setChosenCardInfo,
  getMyAmmShare,
}: {
  ammActivityViewMap: Array<AmmCardProps<I>>
  ammRewardRecordList: RewardListItem[]
  getLiquidityMining: (market: string, size?: number) => Promise<void>
  setShowRewardDetail: React.Dispatch<React.SetStateAction<boolean>>
  setChosenCardInfo: React.Dispatch<React.SetStateAction<any>>
  getMyAmmShare: (market: string) => any
}) => {
  let history = useHistory()
  const { tokenMap } = store.getState().tokenMap

  const jumpTo = React.useCallback(
    (pair: string, type: MiningJumpType) => {
      if (history) {
        // if (type === MiningJumpType.amm) {
        //   history.push(`/liquidity/pools/coinPair/${pair}`);
        // } else {
        //   history.push(`/trade/lite/${pair}`);
        // }
      }
    },
    [history],
  )

  return (
    <>
      {ammActivityViewMap.length ? (
        ammActivityViewMap.map((item: AmmCardProps<I>, index) => {
          const precisionA = tokenMap ? tokenMap[item.coinAInfo?.simpleName]?.precision : undefined
          const precisionB = tokenMap ? tokenMap[item.coinBInfo?.simpleName]?.precision : undefined
          return (
            <Grid item xs={12} sm={6} lg={4} key={index}>
              <AmmCardWrap
                {...{
                  popoverIdx: index,
                  precisionA,
                  precisionB,
                  ammRewardRecordList,
                  getLiquidityMining,
                  setShowRewardDetail,
                  setChosenCardInfo: setChosenCardInfo,
                  getMyAmmShare,
                }}
                handleClick={jumpTo}
                {...(item as any)}
              />
            </Grid>
          )
        })
      ) : (
        <Box
          flex={1}
          display={'flex'}
          alignItems={'center'}
          justifyContent={'center'}
          flexDirection={'column'}
        >
          <EmptyDefault
            height={'calc(100% - 35px)'}
            marginTop={10}
            display={'flex'}
            flexWrap={'nowrap'}
            alignItems={'center'}
            justifyContent={'center'}
            flexDirection={'column'}
            message={() => {
              return <Trans i18nKey='labelEmptyDefault'>Content is Empty</Trans>
            }}
          />
        </Box>
      )}
    </>
  )
}

export const MiningPage = withTranslation('common')(
  <
    T extends AmmJoinData<C extends IBData<I> ? C : IBData<I>>,
    I,
    TW extends AmmExitData<C extends IBData<I> ? C : IBData<I>>,
    ACD extends AmmInData<I>,
    C = IBData<I>,
  >({
    ammProps,
    t,
    ...rest
  }: {
    ammProps: AmmProps<T, TW, I, ACD>
    ammActivityMap: LoopringMap<LoopringMap<AmmPoolActivityRule[]>> | undefined
  } & any) => {
    const [chosenCardInfo, setChosenCardInfo] = React.useState(undefined)
    const { ammActivityMap } = useAmmActivityMap()
    const {
      ammActivityViewMap,
      ammActivityPastViewMap,
      ammRewardRecordList,
      getLiquidityMining,
      showRewardDetail,
      setShowRewardDetail,
      getMyAmmShare,
    } = useAmmMiningUI({ ammActivityMap })
    // const [tabIndex, setTabIndex] = React.useState<0 | 1>(0);
    // const handleChange = (event: any, newValue: 0 | 1) => {
    //     setTabIndex(newValue);
    // }
    const jointAmmViewMap = [...ammActivityViewMap, ...ammActivityPastViewMap]
    // hide orderbook activity for now
    const filteredJointAmmViewMap = jointAmmViewMap.filter(
      (o) =>
        o.activity.ruleType !== 'SWAP_VOLUME_RANKING' && o.activity.ruleType !== 'ORDERBOOK_MINING',
    )
    const orderedViewMap = filteredJointAmmViewMap.sort((a, b) => {
      if (a.APR && !b.APR) {
        return -1
      }
      if (b.APR && !a.APR) {
        return 1
      }
      return 0
    })

    return (
      <WrapperStyled>
        {/* <Tabs value={tabIndex}
                onChange={handleChange}
                aria-label="tabs switch">
            <Tab label={t('labelCurrentActivities')}/>
            <Tab label={t('labelPastActivities')}/>
        </Tabs> */}
        <Typography variant={'h3'} component={'div'} fontFamily={'Roboto'} marginTop={2}>
          {t('labelMiningPageTitle')}
        </Typography>
        <Typography
          variant={'h6'}
          component={'div'}
          marginTop={1}
          marginBottom={4.5}
          color={'var(--color-text-secondary)'}
        >
          {t('labelMiningPageViceTitle')}
        </Typography>
        <Grid container spacing={5}>
          <AmmList
            ammActivityViewMap={orderedViewMap}
            ammRewardRecordList={ammRewardRecordList}
            getLiquidityMining={getLiquidityMining}
            setChosenCardInfo={setChosenCardInfo}
            {...{
              setShowRewardDetail,
              getMyAmmShare,
            }}
          />
        </Grid>
        <Modal open={showRewardDetail} onClose={() => setShowRewardDetail(false)}>
          <ContentWrapperStyled>
            <RewardTable rawData={ammRewardRecordList} chosenCardInfo={chosenCardInfo} />
          </ContentWrapperStyled>

          {/* <OrderDetailPanel rawData={orderDetailList} showLoading={showDetailLoading} orderId={currOrderId} /> */}
        </Modal>
      </WrapperStyled>
    )
  },
)
