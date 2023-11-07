import styled from '@emotion/styled'
import { CoinIcon, useSettings } from '@loopring-web/component-lib'
import { Box, Button, Typography } from '@mui/material'

import { withTranslation } from 'react-i18next'
import { DualModal } from './component'
import {
  BackIcon,
  EmptyValueTag,
  SoursURL,
  getValuePrecisionThousand,
  hexToRGB,
} from '@loopring-web/common-resources'
import { useTheme } from '@emotion/react'
import { useDualHook } from 'pages/InvestPage/DualPanel/hook'
import { btnClickMap, useAccount, useDualMap, useTokenPrices } from '@loopring-web/core'
import { cloneDeep, difference, max } from 'lodash'
import { toBig } from '@loopring-web/loopring-sdk'
import { useHistory, useLocation } from 'react-router'
import { useGetAssets } from 'pages/AssetPage/AssetPanel/hook'
import React from 'react'

const EarnCard = styled(Box)<{ isMobile: boolean }>`
  background-color: var(--color-box-third);
  padding: ${({ theme }) => theme.unit * 6}px ${({ theme }) => theme.unit * 4}px
    ${({ theme }) => theme.unit * 4}px ${({ theme }) => theme.unit * 4}px;
  width: ${({ isMobile }) => (isMobile ? '100%' : '32%')};
  margin-bottom: ${({ theme }) => theme.unit * 2}px;
  border-radius: ${({ theme }) => theme.unit * 1.5}px;
  border: 0.5px solid var(--color-border);
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  overflow: hidden;
  :hover {
    border: 1px solid var(--color-primary);
  }
`

const FAQ = styled(Box)<{ opend: boolean }>`
  background: ${({ opend }) => opend && 'var(--color-box-third)'};
  padding: ${({ theme }) => theme.unit * 3}px;
  border-radius: ${({ theme }) => theme.unit * 1.5}px;
  border: ${({ opend }) => opend && '0.5px solid var(--color-border)'};
  margin-bottom: ${({ theme }) => theme.unit * 2}px;
`

const TextTag = styled(Box)<{ isMobile: boolean }>`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 32px;
  border-radius: 16px;
  background: ${({ theme }) => hexToRGB(theme.colorBase.primary, 0.2)};
  padding: 0px ${({ theme }) => theme.unit * 2}px;
  margin: 0px ${({ theme }) => theme.unit * 1}px;
  color: var(--color-text-primary);
  width: ${({ isMobile }) => (isMobile ? '50%' : 'auto')};
  margin-bottom: ${({ isMobile, theme }) => (isMobile ? `${theme.unit}px` : 'auto')};
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
const AnimationCard = styled(Box)<{ highlighted: boolean; isMobile: boolean }>`
  display: flex;
  flex-direction: column;
  background-color: var(--color-box-third);
  border-radius: 12px;
  padding-top: ${({ theme }) => theme.unit * 8}px;
  padding-left: ${({ theme }) => theme.unit * 5}px;
  padding-right: ${({ theme }) => theme.unit * 4}px;
  padding-bottom: ${({ theme }) => theme.unit * 2.5}px;
  height: 390px;
  height: ${({ isMobile }) => (isMobile ? '290px' : '390px')};
  width: ${({ highlighted, isMobile }) => (isMobile ? '100%' : highlighted ? '55.08%' : '20.4%')};
  transition: all 0.5s ease;
  border: ${({ highlighted, isMobile }) =>
    !isMobile && highlighted
      ? '1px solid var(--color-primary)'
      : '0.5px solid var(--color-border)'};
  overflow: hidden;
  .title {
    margin-bottom: ${({ theme }) => theme.unit * 3}px;
  }
  .sub-title {
    color: var(--color-text-secondary);
    display: ${({ highlighted, isMobile }) => (isMobile || highlighted ? '' : 'none')};
    max-height: 30px;
  }
  img {
    height: 134px;
    width: 134px;
    align-self: end;
    margin-right: ${({ highlighted, isMobile }) => (isMobile || highlighted ? '0px' : '-60px')};
    opacity: ${({ highlighted, isMobile }) => (isMobile || highlighted ? '1' : '0.5')};
    transition: all 0.5s ease;
  }
  margin-bottom: ${({ isMobile, theme }) => (isMobile ? `${theme.unit * 2.5}px` : 'auto')};
`

export const EarnPage = withTranslation('webEarn', { withRef: true })(({ t }) => {
  const { baseTokenList } = useDualHook()
  const { marketMap } = useDualMap()
  const tokenList: any[] = Object.values(baseTokenList ?? {})
  const { tokenPrices } = useTokenPrices()

  const account = useAccount()

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
  const { isMobile } = useSettings()

  const [openedFaqs, setOpenedFaqs] = React.useState([0])
  const faqs: {
    question: string
    answer: React.ReactNode
  }[] = [
    {
      question: t('labelFAQ1Question'),
      answer: <Typography>{t('labelFAQ1Answer')}</Typography>,
    },
    {
      question: t('labelFAQ2Question'),
      answer: (
        <Box>
          <Typography>{t('labelFAQ2AnswerLine1')}</Typography>
          <br />
          <Typography>{t('labelFAQ2AnswerLine2')}</Typography>
          <br />
          <Typography>{t('labelFAQ2AnswerLine3')}</Typography>
          <br />
          <Typography component={'li'}>{t('labelFAQ2AnswerLine4')}</Typography>
          <Typography component={'li'}>{t('labelFAQ2AnswerLine5')}</Typography>
          <br />
          <Typography>{t('labelFAQ2AnswerLine6')}</Typography>
          <br />
          <Typography component={'li'}>{t('labelFAQ2AnswerLine7')}</Typography>
          <Typography component={'li'}>{t('labelFAQ2AnswerLine8')}</Typography>
          <br />
          <Typography>{t('labelFAQ2AnswerLine9')}</Typography>
          <br />
          <Typography>{t('labelFAQ2AnswerLine10')}</Typography>
          <Typography component={'q'}>{t('labelFAQ2AnswerLine11')}</Typography>
        </Box>
      ),
      // opened: openedFaq === 1,
      // onClick: () => setOpenedFaq(1)
    },
    {
      question: `What is the Dual Investment Sell covered gain ?`,
      answer: (
        <Box>
          <Typography>{t('labelFAQ3AnswerLine1')}</Typography>
          <br />
          <Typography>{t('labelFAQ3AnswerLine2')}</Typography>

          <Typography component={'li'}>{t('labelFAQ3AnswerLine3')}</Typography>
          <Typography component={'li'}>{t('labelFAQ3AnswerLine4')}</Typography>
          <br />

          <Typography>{t('labelFAQ3AnswerLine5')}</Typography>
          <Typography>{t('labelFAQ3AnswerLine6')}</Typography>
          <br />
          <Typography>{t('labelFAQ3AnswerLine7')}</Typography>
          <br />
          <Typography>{t('labelFAQ3AnswerLine8')}</Typography>
          <Typography>{t('labelFAQ3AnswerLine9')}</Typography>
          <br />
          <Typography>{t('labelFAQ3AnswerLine10')}</Typography>
          <br />
          <Typography>{t('labelFAQ3AnswerLine11')}</Typography>
          <Typography>{t('labelFAQ3AnswerLine12')}</Typography>
          <br />
          <Typography>{t('labelFAQ3AnswerLine13')}</Typography>
          <br />
          <Typography>{t('labelFAQ3AnswerLine14')}</Typography>
        </Box>
      ),
      // opened: openedFaq === 1,
      // onClick: () => setOpenedFaq(1)
    },
    {
      question: `What is the Dual Investment Buy the dip ?`,
      answer: (
        <Box>
          <Typography>{t('labelFAQ4AnswerLine1')}</Typography>
          <br />
          <Typography>{t('labelFAQ4AnswerLine2')}</Typography>

          <Typography component={'li'}>{t('labelFAQ4AnswerLine3')}</Typography>
          <Typography component={'li'}>{t('labelFAQ4AnswerLine4')}</Typography>
          <br />

          <Typography>{t('labelFAQ4AnswerLine5')}</Typography>
          <Typography>{t('labelFAQ4AnswerLine6')}</Typography>
          <br />
          <Typography>{t('labelFAQ4AnswerLine7')}</Typography>
          <br />
          <Typography>{t('labelFAQ4AnswerLine8')}</Typography>
          <Typography>{t('labelFAQ4AnswerLine9')}</Typography>
          <br />
          <Typography>{t('labelFAQ4AnswerLine10')}</Typography>
          <br />
          <Typography>{t('labelFAQ4AnswerLine11')}</Typography>
          <Typography>{t('labelFAQ4AnswerLine12')}</Typography>
          <br />
          <Typography>{t('labelFAQ4AnswerLine13')}</Typography>
          <br />
          <Typography>{t('labelFAQ4AnswerLine14')}</Typography>
        </Box>
      ),
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
  const productsRef = React.useRef<HTMLDivElement>()
  const location = useLocation()

  React.useEffect(() => {
    if (new URLSearchParams(location.search).get('scrollToProducts') === 'true') {
      setTimeout(() => {
        productsRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
          inline: 'nearest',
        })
      }, 500)
    }
  }, [productsRef])

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
        <Box
          marginTop={12}
          display={'flex'}
          justifyContent={'center'}
          flexDirection={'column'}
          width={'100%'}
        >
          <Typography variant={'h1'} textAlign={'center'}>
            {t('labelDualEarnTitle')}
          </Typography>
          <Typography
            marginTop={2}
            variant={'h5'}
            color={'var(--color-text-secondary)'}
            textAlign={'center'}
          >
            {t('labelDualEarnSubTitle')}
          </Typography>
        </Box>

        <Box
          marginTop={3}
          display={'flex'}
          flexDirection={isMobile ? 'column' : 'row'}
          alignItems={isMobile ? 'center' : 'auto'}
          justifyContent={'center'}
        >
          <TextTag isMobile={isMobile}>
            <Typography>{t('labelDualEarnTag1')}</Typography>
          </TextTag>
          <TextTag isMobile={isMobile}>
            <Typography>{t('labelDualEarnTag2')}</Typography>
          </TextTag>
          <TextTag isMobile={isMobile}>
            <Typography>{t('labelDualEarnTag3')}</Typography>
          </TextTag>
        </Box>

        <Box ref={productsRef} component={'div'} id={'products'} marginTop={15}>
          {dualTokenList && dualTokenList.length !== 0 ? (
            <Box display={'flex'} flexDirection={isMobile ? 'column' : 'row'} flexWrap={'wrap'}>
              {dualTokenList.map((info, index) => {
                return (
                  <EarnCard
                    isMobile={isMobile}
                    key={info.symbol}
                    marginRight={index % 3 === 2 ? '0' : '2%'}
                  >
                    <Box
                      sx={{
                        height: 64,
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                      }}
                    >
                      <CoinIcon size={64} symbol={info.symbol} />
                    </Box>

                    {/* <Box width={64} height={64} src={info.imgSrc} component={'img'} /> */}
                    <Typography variant={'h3'} marginTop={2}>
                      {info.tag === 'sellCover'
                        ? t('labelInvestSymbolSellHigh', {
                            symbol: info.symbol,
                          })
                        : t('labelInvestSymbolBuyLow', {
                            symbol: info.symbol,
                          })}
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
                          {t('labelApy')}
                        </Typography>
                        <Typography
                          variant={'h4'}
                          color={'var(--color-success)'}
                          textAlign={'center'}
                        >
                          {info.apy}
                        </Typography>
                      </Box>
                      <Box
                        width={'1px'}
                        height={24}
                        marginX={1.5}
                        bgcolor={'var(--color-border)'}
                      />
                      <Box>
                        <Typography textAlign={'center'}>{t('labelCurrentPrice')}</Typography>
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
                      {t('labelViewDetails')}
                    </Button>
                  </EarnCard>
                )
              })}
            </Box>
          ) : (
            <Box
              display={'flex'}
              justifyContent={'center'}
              alignItems={'center'}
              height={'150px'}
              width={'100%'}
            >
              <img width={60} src={SoursURL + 'images/loading-line.gif'} />
            </Box>
          )}
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
            {t('labelLoopringEarn')}
          </Typography>
          <Typography
            paddingX={14}
            color={'var(--color-text-button)'}
            textAlign={'center'}
            variant={'h5'}
          >
            {t('labelLoopringEarnDes')}{' '}
          </Typography>
        </Box>
        <Box marginTop={12.5}>
          <Typography textAlign={'center'} variant={'h2'}>
            {t('labelLoopringProtocol')}
          </Typography>
          <Typography
            textAlign={'center'}
            variant={'h5'}
            color={'var(--color-text-secondary)'}
            marginTop={2}
          >
            {t('labelLoopringProtocolDes')}
          </Typography>
        </Box>
        <Box marginTop={5} display={'flex'} flexDirection={isMobile ? 'column' : 'row'}>
          <AnimationCard
            justifyContent={'space-between'}
            highlighted={highlightedAnimationCard === 0}
            onMouseOver={() => setHighlightedAnimationCard(0)}
            marginRight={'2.06%'}
            isMobile={isMobile}
          >
            <Box>
              <Typography variant={'h3'} className={'title'}>
                {t('labelUltimateSecurity')}
              </Typography>
              <Typography className={'sub-title'}>{t('labelUltimateSecurityDes')}</Typography>
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
            marginRight={'2.06%'}
            isMobile={isMobile}
          >
            <Box>
              <Typography variant={'h3'} className={'title'}>
                {t('labelLowTransactionFees')}
              </Typography>
              <Typography className={'sub-title'}>{t('labelLowTransactionFeesDes')}</Typography>
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
            isMobile={isMobile}
          >
            <Box>
              <Typography variant={'h3'} className={'title'}>
                {t('labelHighThroughput')}
              </Typography>
              <Typography variant={'h5'} className={'sub-title'}>
                {t('labelHighThroughputDes')}
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
          {t('labelFAQs')}
        </Typography>
        <Box marginTop={5} marginBottom={12.5}>
          {faqs.map((faq, index) => {
            const opened = openedFaqs.includes(index)
            return (
              <FAQ opend={openedFaqs.includes(index)} key={faq.question}>
                <Box
                  onClick={() => {
                    if (opened) {
                      setOpenedFaqs(difference(openedFaqs, [index]))
                    } else {
                      setOpenedFaqs(openedFaqs.concat(index))
                    }
                  }}
                  sx={{ cursor: 'pointer' }}
                  display={'flex'}
                  justifyContent={'space-between'}
                >
                  <Typography marginBottom={2} variant={'h3'}>
                    {faq.question}
                  </Typography>
                  <BackIcon
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
