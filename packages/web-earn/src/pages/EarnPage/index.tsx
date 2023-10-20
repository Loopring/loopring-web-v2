import styled from '@emotion/styled'
import { CoinIcon, ConfirmInvestDualRisk } from '@loopring-web/component-lib'
import { Box, Button, Modal, Typography } from '@mui/material'

import { withTranslation } from 'react-i18next'
import { DualModal } from './component'
import {
  BackIcon,
  EmptyValueTag,
  SoursURL,
  UpIcon,
  getValuePrecisionThousand,
  hexToRGB,
  myLog,
} from '@loopring-web/common-resources'
import { useTheme } from '@emotion/react'
import { useDualHook } from 'pages/InvestPage/DualPanel/hook'
import {
  accountStaticCallBack,
  btnClickMap,
  useAccount,
  useDualMap,
  useTokenPrices,
} from '@loopring-web/core'
import { cloneDeep, difference, max } from 'lodash'
import { toBig } from '@loopring-web/loopring-sdk'
import { useHistory } from 'react-router'
import { useGetAssets } from 'pages/AssetPage/AssetPanel/hook'
import React from 'react'

const EarnCard = styled(Box)`
  background-color: var(--color-box-third);
  padding: ${({ theme }) => theme.unit * 6}px ${({ theme }) => theme.unit * 4}px
    ${({ theme }) => theme.unit * 4}px ${({ theme }) => theme.unit * 4}px;
  width: 32%;
  margin-bottom: ${({ theme }) => theme.unit * 2}px;
  border-radius: ${({ theme }) => theme.unit * 1.5}px;
  border: 0.5px solid var(--color-border);
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  overflow: hidden;
`

const FAQ = styled(Box)<{ opend: boolean }>`
  background: ${({ opend }) => opend && 'var(--color-box-third)'};
  padding: ${({ theme }) => theme.unit * 3}px;
  border-radius: ${({ theme }) => theme.unit * 1.5}px;
  border: ${({ opend }) => opend && '0.5px solid var(--color-border)'};
  margin-bottom: ${({ theme }) => theme.unit * 2}px;
`

const TextTag = styled(Box)`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 32px;
  border-radius: 16px;
  background: ${({ theme }) => hexToRGB(theme.colorBase.primary, 0.2)};
  padding: 0px ${({ theme }) => theme.unit * 2}px;
  margin: 0px ${({ theme }) => theme.unit * 1}px;
  color: var(--color-text-primary);
`
const ConnectBtn = styled(Button)`
  height: 80px;
  padding: 0px 80px;
  border-radius: 40px;
  color: var(--color-text-primary);
  &:hover {
    &:before {
      border-radius: 40px;
    }
  }
`
const AnimationCard = styled(Box)<{ highlighted: boolean }>`
  display: flex;
  flex-direction: column;
  background-color: var(--color-box-third);
  border-radius: 12px;
  padding-top: ${({ theme }) => theme.unit * 8}px;
  padding-left: ${({ theme }) => theme.unit * 5}px;
  padding-right: ${({ theme }) => theme.unit * 4}px;
  padding-bottom: ${({ theme }) => theme.unit * 2.5}px;
  height: 390px;
  width: ${({ highlighted }) => (highlighted ? '54%' : '20%')};
  transition: width 0.5s ease;
  border: 0.5px solid var(--color-border);

  .title {
    margin-bottom: ${({ theme }) => theme.unit * 3}px;
  }
  .sub-title {
    color: var(--color-text-secondary);
    /* margin-bottom: ${({ theme }) => theme.unit * 9}px; */
    /* visibility: visible; */
    display: ${({ highlighted }) => (highlighted ? '' : 'none')};
  }
  img {
    height: 134px;
    width: 134px;
    align-self: end;
  }
`

export const EarnPage = withTranslation('common', { withRef: true })(() => {
  const { baseTokenList } = useDualHook()
  const { marketMap } = useDualMap()
  const tokenList: any[] = Object.values(baseTokenList ?? {})
  const { tokenPrices } = useTokenPrices()

  const account = useAccount()
  // myLog('account',account)

  const sellCoverTokens: {
    symbol: string
    apy: string
    price: string
    tag: 'sellCover' | 'buyDip'
    apyRaw: number
  }[] = (tokenList ?? [])?.map((token) => {
    const keys = Object.keys(marketMap).filter((key) => key.includes(token.tokenName))
    const maxApy = max(keys.map((key) => (marketMap[key] as any).baseTokenApy?.max as number))
    return {
      symbol: token.tokenName,
      apy:
        toBig(maxApy ?? 0)
          .times('100')
          .toString() + '%',
      price: '$' + getValuePrecisionThousand(tokenPrices[token.tokenName], 2, 2),
      tag: 'sellCover',
      apyRaw: maxApy ?? 0,
    }
  })
  const buyDipTokens: {
    symbol: string
    apy: string
    price: string
    tag: 'sellCover' | 'buyDip'
    apyRaw: number
  }[] =
    tokenList?.map((token) => {
      const keys = Object.keys(marketMap).filter((key) => key.includes(token.tokenName))
      const maxApy = max(keys.map((key) => (marketMap[key] as any).quoteTokenApy?.max as number))
      return {
        symbol: token.tokenName,
        apy:
          toBig(maxApy ?? 0)
            .times('100')
            .toString() + '%',
        price: '$' + getValuePrecisionThousand(tokenPrices[token.tokenName], 2, 2),
        tag: 'buyDip',
        apyRaw: maxApy ?? 0,
      }
    }) ?? []

  const dualTokenList = [...sellCoverTokens, ...buyDipTokens]
  const maxApyForAll = max(dualTokenList.map((token) => token.apyRaw))
  const upTo = maxApyForAll ? toBig(maxApyForAll).times('100').toString() + '%' : EmptyValueTag
  const history = useHistory()
  const { assetTitleProps } = useGetAssets()
  const myBalance =
    assetTitleProps.assetInfo.totalAsset && assetTitleProps.assetInfo.priceTag
      ? assetTitleProps.assetInfo.priceTag +
        getValuePrecisionThousand(assetTitleProps.assetInfo.totalAsset, 2, 2, 2, true, {
          floor: true,
        })
      : '$0.00'
  // assetTitleProps.assetInfo.totalAsset

  const [openedFaqs, setOpenedFaqs] = React.useState([0])
  const faqs: {
    question: string
    answer: React.ReactNode
    // opened: boolean
    // onClick: () => void
  }[] = [
    {
      question: 'What is Loopring protocol ?',
      answer: (
        <Typography>
          As the world's first ZKRollup implementation to scale up Ethereum, Loopring Protocol has
          run since 2017. There have been more than 210K users and $5.88B trading volume occurred on
          this protocol. As an app-specific ZKRollup protocol, it has been successfully deployed not
          only as a Layer 2 on top of Ethereum but also as a Layer 3 on top of other EVM-compatible
          networks such as Arbitrum.
        </Typography>
      ),
      // opened: openedFaqs.includes(0),
      // onClick: () => setOpenedFaqs( set(openedFaqs) 0)
    },
    {
      question: 'What is Dual Investment ?',
      answer: (
        <Box>
          <Typography>
            Dual Investment is a non-principal protected structured product. Upon purchasing, you
            can select the underlying asset, investment currency, investment amount, and delivery
            date. Your return will be denominated in the investment currency or alternate currency,
            depending on the below conditions.
          </Typography>
          <br />
          <Typography>
            There are two types of Dual Investment products: “Buy Low” and “Sell High”.
          </Typography>
          <br />
          <Typography>
            Buy Low products gives you a chance to buy your desired crypto (such as LRC) at a lower
            price in the future with stablecoins (USDC).
          </Typography>
          <br />
          <Typography component={'li'}>
            Target Reached: On the Settlement Date, if the Market Price is at or below the Target
            Price, the target currency (LRC) will be bought;
          </Typography>
          <Typography component={'li'}>
            Target Not Reached: On the Settlement Date, if the Market Price is above the Target
            Price, then you will keep your stablecoins; In both scenarios, you will first earn
            interest in stablecoins. Once the Target Price is reached, your subscription amount and
            interest income will be used to buy LRC.
          </Typography>
          <br />
          <Typography>
            Sell High products gives you a chance to sell your existing crypto (such as LRC) at a
            higher price in the future (for USDC).
          </Typography>
          <br />
          <Typography component={'li'}>
            Target Reached: On the Settlement Date, the Market Price is at or above the Target
            Price, your LRC will be sold for USDC.
          </Typography>
          <Typography component={'li'}>
            Target Not Reached: On the Settlement Date, the Market Price is below the Target Price,
            then you will keep your LRC. In both scenarios, you will first earn interest in your
            existing currency (LRC). Once the Target Price is reached, your subscription amount and
            interest income will be sold for USDC.
          </Typography>
          <br />
          <Typography>
            Your token for investment is just locked but still in your account as Loopring is a DEX.
          </Typography>
          <br />
          <Typography>
            Each purchased product has a settlement date. We will take an average of the market
            price in the last 30 minutes before 16:00 (UTC+8) on the delivery date as the settlement
            price.
          </Typography>
          <Typography component={'q'}>
            Please make sure that you fully understand the product and the risks before investing.
          </Typography>
        </Box>
      ),
      // opened: openedFaq === 1,
      // onClick: () => setOpenedFaq(1)
    },
    {
      question: `What is the Dual Investment Sell covered gain ?`,
      answer: (
        <Box>
          <Typography>
            Covered Gain is an investment strategy to sell digital assets at your Target Price and
            earn interest while waiting.
          </Typography>
          <br />
          <Typography>On the Settlement Date, there can be 2 scenarios:</Typography>

          <Typography component={'li'}>{`Market Price > Target Price`}</Typography>
          <Typography component={'li'}>{`Market Price ≤ Target Price`}</Typography>
          <br />

          <Typography>{`Market Price > Target Price`}</Typography>
          <Typography>
            Your original investment and earned interest will be sold at the target price.
          </Typography>
          <br />
          <Typography>
            This order is then closed regardless of whether "Auto Reinvest" is enabled or not.
          </Typography>
          <br />
          <Typography>{`Market Price ≤ Target Price`}</Typography>
          <Typography>Your original investment and earned interest won’t be sold.</Typography>
          <br />
          <Typography>
            If you enable the “Auto Reinvest” feature, Loopring will automatically subscribe to a
            suitable dual investment product based on the agreed terms until you either successfully
            sell crypto at your desired price or disable the feature.
          </Typography>
          <br />
          <Typography>Auto Reinvest</Typography>
          <Typography>
            When you enable the “Auto Reinvest” feature, Loopring will automatically reinvest your
            funds into a new product with the same target price when the previous product expires,
            continuing until you successfully sell your crypto at your Target Price. If there isn’t
            an available product within 2 hours after the previous settlement, the order will be
            automatically closed.
          </Typography>
          <br />
          <Typography>
            Sell Price: the Target Price at which you want to sell your crypto.
          </Typography>
          <br />
          <Typography>
            Longest Settlement Date: your acceptable investment period. If no suitable products are
            available within this range, “Auto Reinvest” will not subscribe to any products for you,
            even if it's enabled.
          </Typography>
        </Box>
      ),
      // opened: openedFaq === 1,
      // onClick: () => setOpenedFaq(1)
    },
    {
      question: `What is the Dual Investment Buy the dip ?`,
      answer: (
        <Box>
          <Typography>
            Buy The Dip is an investment strategy to buy digital assets at your Target Price and
            earn interest while waiting.
          </Typography>
          <br />
          <Typography>On the Settlement Date, there can be 2 scenarios:</Typography>

          <Typography component={'li'}>{`Market Price > Target Price`}</Typography>
          <Typography component={'li'}>{`Market Price ≤ Target Price`}</Typography>
          <br />

          <Typography>{`Market Price > Target Price`}</Typography>
          <Typography>
            Your original investment and earned interest won’t be converted. Earned interest is in
            USDC or USDT.
          </Typography>
          <br />
          <Typography>
            If you enable the “Auto Reinvest” feature, Loopring will automatically subscribe to a
            suitable dual investment product based on the agreed terms until you either successfully
            buy crypto at your desired price or disable the feature.
          </Typography>
          <br />
          <Typography>{`Market Price ≤ Target Price`}</Typography>
          <Typography>
            Your original investment and earned interest will be converted at the Target Price.
          </Typography>
          <br />
          <Typography>
            This order is then closed regardless of whether "Auto Reinvest" is enabled or not.
          </Typography>
          <br />
          <Typography>Auto Reinvest</Typography>
          <Typography>
            When you enable the “Auto Reinvest” feature, Loopring will automatically reinvest your
            funds into a new product with the same target price when the previous product expires,
            continuing until you successfully buy crypto at your desired price. If there isn’t an
            available product within 2 hours after the previous settlement, the order will be
            automatically closed.
          </Typography>
          <br />
          <Typography>Buy Price: the Target Price at which you want to buy crypto.</Typography>
          <br />
          <Typography>
            Longest Settlement Date: your acceptable investment period. If no suitable products are
            available within this range, “Auto Reinvest” will not subscribe to any products for you,
            even if it's enabled.
          </Typography>

          {/* On the Settlement Date, there can be 2 scenarios:
Market Price > Target Price
Market Price ≤ Target Price */}

          {/* Market Price > Target Price
Your original investment and earned interest won’t be converted. Earned interest is in USDC or USDT.

If you enable the “Auto Reinvest” feature, Loopring will automatically subscribe to a suitable dual investment product based on the agreed terms until you either successfully buy crypto at your desired price or disable the feature.

Market Price ≤ Target Price
Your original investment and earned interest will be converted at the Target Price.

This order is then closed regardless of whether "Auto Reinvest" is enabled or not.

Auto Reinvest
When you enable the “Auto Reinvest” feature, Loopring will automatically reinvest your funds into a new product with the same target price when the previous product expires, continuing until you successfully buy crypto at your desired price. If there isn’t an available product within 2 hours after the previous settlement, the order will be automatically closed.

Buy Price: the Target Price at which you want to buy crypto.

Longest Settlement Date: your acceptable investment period. If no suitable products are available within this range, “Auto Reinvest” will not subscribe to any products for you, even if it's enabled. */}
        </Box>
      ),
      // opened: openedFaq === 1,
      // onClick: () => setOpenedFaq(1)
    },
  ]
  const connectStatus: 'connected' | 'locked' | 'notConnected' =
    account.account.readyState === 'ACTIVATED'
      ? 'connected'
      : account.account.readyState === 'LOCKED'
      ? 'locked'
      : 'notConnected'

  const theme = useTheme()
  const _btnClickMap = Object.assign(cloneDeep(btnClickMap), {})
  const [highlightedAnimationCard, setHighlightedAnimationCard] = React.useState(0)

  // const highlightedAnimationCard=0

  return (
    <Box display={'flex'} justifyContent={'center'} width={'100%'}>
      <Box
        display={'flex'}
        flexDirection={'column'}
        width={'100%'}
        marginBottom={2}
        maxWidth={'964px'}
        justifyContent={'center'}
      >
        <Box marginTop={10} display={'flex'} justifyContent={'center'} flexDirection={'column'} width={'100%'}>
          <Typography variant={'h1'} textAlign={'center'}>
            DUAL INVESTMENT
          </Typography>
          <Typography
            marginTop={2}
            variant={'h5'}
            color={'var(--color-text-secondary)'}
            textAlign={'center'}
          >
            The most innovative structural products brought to the DeFi world
          </Typography>
        </Box>

        <Box marginTop={3} display={'flex'} justifyContent={'center'}>
          <TextTag>
            <Typography>Buy Low or Sell High</Typography>
          </TextTag>
          <TextTag>
            <Typography>No Trading Fees</Typography>
          </TextTag>
          <TextTag>
            <Typography>High Rewards</Typography>
          </TextTag>
        </Box>

        {/* <Box
          marginX={'3%'}
          paddingX={'5%'}
          marginTop={10}
          height={'108px'}
          bgcolor={'var(--color-box-third)'}
          borderRadius={'54px'}
          display={'flex'}
          alignItems={'center'}
          justifyContent={'space-between'}
        >
          <Box width={'20%'}>
            <Typography variant={'h5'} color={'var(--color-text-secondary)'}>
              Current Locking TVL
            </Typography>
            <Typography variant={'h2'}>todo</Typography>
          </Box>
          {connectStatus === 'connected' ? (
            <Box
              width={'354px'}
              display={'flex'}
              flexDirection={'column'}
              justifyContent={'center'}
              height={'80px'}
              borderRadius={'40px'}
              bgcolor={'var(--color-text-primary)'}
            >
              <Typography
                textAlign={'center'}
                color={theme.mode === 'light' ? 'var(--color-white)' : 'var(--color-black)'}
                variant={'h5'}
              >
                Your Balance
              </Typography>
              <Typography
                textAlign={'center'}
                color={theme.mode === 'light' ? 'var(--color-white)' : 'var(--color-black)'}
                variant={'h2'}
              >
                {myBalance}
              </Typography>
            </Box>
          ) : connectStatus === 'notConnected' ? (
            <ConnectBtn
              onClick={() => {
                accountStaticCallBack(_btnClickMap, [])
              }}
              variant={'contained'}
            >
              <Typography color={'var(--color-text-button)'} variant={'h2'}>
                Connect Wallet
              </Typography>
            </ConnectBtn>
          ) : (
            <ConnectBtn
              onClick={() => {
                accountStaticCallBack(_btnClickMap, [])
              }}
              variant={'contained'}
            >
              <Typography color={'var(--color-text-button)'} variant={'h2'}>
                Unlock
              </Typography>
            </ConnectBtn>
          )}

          <Box width={'20%'}>
            <Typography textAlign={'right'} variant={'h5'} color={'var(--color-text-secondary)'}>
              Up To
            </Typography>
            <Typography textAlign={'right'} variant={'h2'}>
              {upTo}
            </Typography>
          </Box>
        </Box> */}

        <Box marginTop={8} display={'flex'} flexWrap={'wrap'}>
          {dualTokenList.map((info, index) => {
            return (
              <EarnCard key={info.symbol} marginRight={index % 3 === 2 ? '0' : '2%'}>
                {info.tag === 'sellCover' ? (
                  <Typography
                    sx={{ borderBottomLeftRadius: 12, paddingX: 2 }}
                    color={theme.colorBase.warning}
                    bgcolor={hexToRGB(theme.colorBase.warning, 0.2)}
                    position={'absolute'}
                    right={0}
                    top={0}
                  >
                    Sell Hign
                  </Typography>
                ) : (
                  <Typography
                    sx={{ borderBottomLeftRadius: 12, paddingX: 2 }}
                    color={theme.colorBase.success}
                    bgcolor={hexToRGB(theme.colorBase.success, 0.2)}
                    position={'absolute'}
                    right={0}
                    top={0}
                  >
                    Buy Low
                  </Typography>
                )}
                <CoinIcon size={64} symbol={info.symbol} />
                {/* <Box width={64} height={64} src={info.imgSrc} component={'img'} /> */}
                <Typography variant={'h3'} marginTop={2}>
                  Invest {info.symbol}
                </Typography>
                <Box
                  marginBottom={4}
                  justifyContent={'center'}
                  alignItems={'center'}
                  marginTop={7}
                  display={'flex'}
                >
                  <Box>
                    <Typography color={'var(--color-success)'} textAlign={'center'}>
                      APY
                    </Typography>
                    <Typography variant={'h4'} color={'var(--color-success)'} textAlign={'center'}>
                      {info.apy}
                    </Typography>
                  </Box>
                  <Box width={'1px'} height={24} marginX={1.5} bgcolor={'var(--color-border)'} />
                  <Box>
                    <Typography textAlign={'center'}>Current Price</Typography>
                    <Typography variant={'h4'} textAlign={'center'}>
                      {info.price}
                    </Typography>
                  </Box>
                </Box>

                <Button
                  onClick={() => {
                    history.push(
                      `/invest/dual?viewType=${
                        info.tag === 'buyDip' ? 'DualDip' : 'DualGain'
                      }&autoChose=${info.symbol}`,
                    )
                  }}
                  variant={'contained'}
                  fullWidth
                >
                  View Details
                </Button>
              </EarnCard>
            )
          })}
        </Box>
        <Box
          marginTop={12.5}
          paddingTop={7}
          paddingBottom={10}
          justifyContent={'center'}
          borderRadius={3}
          bgcolor={'var(--color-primary)'}
        >
          <Typography
            color={'var(--color-text-button)'}
            textAlign={'center'}
            marginBottom={3}
            variant={'h2'}
          >
            loopring Earn
          </Typography>
          <Typography color={'var(--color-text-button)'} textAlign={'center'} variant={'h5'}>
            Loopring Earn is built on top of Loopring Protocol to take full advantage of its
            ZKRollup technology and full-stack DEX capability to provide the most innovative DeFi
            products to users.{' '}
          </Typography>
        </Box>
        <Box marginTop={12.5}>
          <Typography textAlign={'center'} variant={'h2'}>
            Loopring Protocol
          </Typography>
          <Typography
            textAlign={'center'}
            variant={'h5'}
            color={'var(--color-text-secondary)'}
            marginTop={2}
          >
            The world's first ZKRollup implementation designed to scale Ethereum, fully optimized
            for trading.
          </Typography>
        </Box>
        <Box marginTop={5} display={'flex'}>
          <AnimationCard
            justifyContent={'space-between'}
            highlighted={highlightedAnimationCard === 0}
            onMouseOver={() => setHighlightedAnimationCard(0)}
            marginRight={'3%'}
          >
            <Box>
              <Typography variant={'h3'} className={'title'}>
                Ultimate Security
              </Typography>
              <Typography className={'sub-title'}>
                Assets on Loopring L2 are equally secure as they are on the Ethereum mainnet.
              </Typography>
            </Box>

            <img
              src={
                SoursURL +
                (theme.mode === 'dark'
                  ? 'images/web-earn/animation_card_d1.svg'
                  : 'images/web-earn/animation_card_l1.svg')
              }
            />
          </AnimationCard>
          <AnimationCard
            justifyContent={'space-between'}
            highlighted={highlightedAnimationCard === 1}
            onMouseOver={() => setHighlightedAnimationCard(1)}
            marginRight={'3%'}
          >
            <Box>
              <Typography variant={'h3'} className={'title'}>
                Low Transaction Fees
              </Typography>
              <Typography className={'sub-title'}>
                Assets on Loopring L2 are equally secure as they are on the Ethereum mainnet.
              </Typography>
            </Box>
            <img
              src={
                SoursURL +
                (theme.mode === 'dark'
                  ? 'images/web-earn/animation_card_d2.svg'
                  : 'images/web-earn/animation_card_l2.svg')
              }
            />
          </AnimationCard>
          <AnimationCard
            justifyContent={'space-between'}
            highlighted={highlightedAnimationCard === 2}
            onMouseOver={() => setHighlightedAnimationCard(2)}
          >
            <Box>
              <Typography variant={'h3'} className={'title'}>
                High Throughput
              </Typography>
              <Typography variant={'h5'} className={'sub-title'}>
                Loopring L2 can settle ~2000 transactions per second with near instant finality.
              </Typography>
            </Box>
            <img
              src={
                SoursURL +
                (theme.mode === 'dark'
                  ? 'images/web-earn/animation_card_d3.svg'
                  : 'images/web-earn/animation_card_l3.svg')
              }
            />
          </AnimationCard>
        </Box>

        <Typography textAlign={'center'} marginTop={12.5} variant={'h2'}>
          FAQs
        </Typography>
        <Box marginTop={5} marginBottom={12.5}>
          {faqs.map((faq, index) => {
            const opened = openedFaqs.includes(index)
            return (
              <FAQ opend={openedFaqs.includes(index)} key={faq.question}>
                <Box display={'flex'} justifyContent={'space-between'}>
                  <Typography marginBottom={2} variant={'h3'}>
                    {faq.question}
                  </Typography>
                  <BackIcon
                    onClick={() => {
                      if (opened) {
                        setOpenedFaqs(difference(openedFaqs, [index]))
                      } else {
                        setOpenedFaqs(openedFaqs.concat(index))
                      }
                    }}
                    sx={{
                      transform: opened ? 'rotate(90deg)' : 'rotate(270deg)',
                      cursor: 'pointer',
                    }}
                    htmlColor={'var(--color-text-secondary)'}
                  />
                </Box>
                {opened && (
                  <Box sx={{ '& .MuiTypography-root': { color: 'var(--color-text-secondary)' } }}>
                    {faq.answer}
                  </Box>
                )}
              </FAQ>
            )
          })}
        </Box>

        <DualModal open={false} />
      </Box>
    </Box>
  )
})
