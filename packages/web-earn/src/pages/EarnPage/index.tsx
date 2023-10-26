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
  :hover{
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
  width: ${({ highlighted }) => (highlighted ? '55.08%' : '20.4%')};
  transition: all 0.5s ease;
  border: 0.5px solid var(--color-border);
  overflow: hidden;
  .title {
    margin-bottom: ${({ theme }) => theme.unit * 3}px;
  }
  .sub-title {
    color: var(--color-text-secondary);
    display: ${({ highlighted }) => (highlighted ? '' : 'none')};
    max-height: 30px;
  }
  img {
    height: 134px;
    width: 134px;
    align-self: end;
    margin-right: ${({ highlighted }) => (highlighted ? '0px' : '-60px')};
    opacity: ${({ highlighted }) => (highlighted ? '1' : '0.5')};
    transition: all 0.5s ease;
  }
`

export const EarnPage = withTranslation('webEarn', { withRef: true })(({t}) => {
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
      question: t("labelFAQ1Question"),
      answer: (
        <Typography>
          {t("labelFAQ1Answer")}
        </Typography>
      ),
      // opened: openedFaqs.includes(0),
      // onClick: () => setOpenedFaqs( set(openedFaqs) 0)
    },
    {
      question: t("labelFAQ2Question"),
      answer: (
        <Box>
          <Typography>
            {t("labelFAQ2AnswerLine1")}
          </Typography>
          <br />
          <Typography>
            {t("labelFAQ2AnswerLine2")}
          </Typography>
          <br />
          <Typography>
            {t("labelFAQ2AnswerLine3")}
          </Typography>
          <br />
          <Typography component={'li'}>
            {t("labelFAQ2AnswerLine4")}
          </Typography>
          <Typography component={'li'}>
            {t("labelFAQ2AnswerLine5")}
          </Typography>
          <br />
          <Typography>
            {t("labelFAQ2AnswerLine6")}
          </Typography>
          <br />
          <Typography component={'li'}>
            {t("labelFAQ2AnswerLine7")}
          </Typography>
          <Typography component={'li'}>
            {t("labelFAQ2AnswerLine8")}
          </Typography>
          <br />
          <Typography>
            {t("labelFAQ2AnswerLine9")}
          </Typography>
          <br />
          <Typography>
            {t("labelFAQ2AnswerLine10")}
          </Typography>
          <Typography component={'q'}>
            {t("labelFAQ2AnswerLine11")}
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
            {t("labelFAQ3AnswerLine1")}
          </Typography>
          <br />
          <Typography>{t("labelFAQ3AnswerLine2")}</Typography>

          <Typography component={'li'}>{t("labelFAQ3AnswerLine3")}</Typography>
          <Typography component={'li'}>{t("labelFAQ3AnswerLine4")}</Typography>
          <br />

          <Typography>{t("labelFAQ3AnswerLine5")}</Typography>
          <Typography>
            {t("labelFAQ3AnswerLine6")}
          </Typography>
          <br />
          <Typography>
            {t("labelFAQ3AnswerLine7")}
          </Typography>
          <br />
          <Typography>{t("labelFAQ3AnswerLine8")}</Typography>
          <Typography>{t("labelFAQ3AnswerLine9")}</Typography>
          <br />
          <Typography>
            {t("labelFAQ3AnswerLine10")}
          </Typography>
          <br />
          <Typography>{t("labelFAQ3AnswerLine11")}</Typography>
          <Typography>
            {t("labelFAQ3AnswerLine12")}
          </Typography>
          <br />
          <Typography>
            {t("labelFAQ3AnswerLine13")}
          </Typography>
          <br />
          <Typography>
            {t("labelFAQ3AnswerLine14")}
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
            {t("labelFAQ4AnswerLine1")}
          </Typography>
          <br />
          <Typography>{t("labelFAQ4AnswerLine2")}</Typography>

          <Typography component={'li'}>{t("labelFAQ4AnswerLine3")}</Typography>
          <Typography component={'li'}>{t("labelFAQ4AnswerLine4")}</Typography>
          <br />

          <Typography>{t("labelFAQ4AnswerLine5")}</Typography>
          <Typography>
            {t("labelFAQ4AnswerLine6")}
          </Typography>
          <br />
          <Typography>
            {t("labelFAQ4AnswerLine7")}
          </Typography>
          <br />
          <Typography>{t("labelFAQ4AnswerLine8")}</Typography>
          <Typography>
            {t("labelFAQ4AnswerLine9")}
          </Typography>
          <br />
          <Typography>
            {t("labelFAQ4AnswerLine10")}
          </Typography>
          <br />
          <Typography>{t("labelFAQ4AnswerLine11")}</Typography>
          <Typography>
            {t("labelFAQ4AnswerLine12")}
          </Typography>
          <br />
          <Typography>{t("labelFAQ4AnswerLine13")}</Typography>
          <br />
          <Typography>
            {t("labelFAQ4AnswerLine14")}
          </Typography>
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
        <Box marginTop={12} display={'flex'} justifyContent={'center'} flexDirection={'column'} width={'100%'}>
          <Typography variant={'h1'} textAlign={'center'}>
            {t("labelDualEarnTitle")}
          </Typography>
          <Typography
            marginTop={2}
            variant={'h5'}
            color={'var(--color-text-secondary)'}
            textAlign={'center'}
          >
            {t("labelDualEarnSubTitle")}
          </Typography>
        </Box>

        <Box marginTop={3} display={'flex'} justifyContent={'center'}>
          <TextTag>
            <Typography>{t("labelDualEarnTag1")}</Typography>
          </TextTag>
          <TextTag>
            <Typography>{t("labelDualEarnTag2")}</Typography>
          </TextTag>
          <TextTag>
            <Typography>{t("labelDualEarnTag3")}</Typography>
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

        <Box marginTop={15} display={'flex'} flexWrap={'wrap'}>
          {dualTokenList.map((info, index) => {
            return (
              <EarnCard key={info.symbol} marginRight={index % 3 === 2 ? '0' : '2%'}>
                {/* {info.tag === 'sellCover' ? (
                  <Typography
                    sx={{ borderBottomLeftRadius: 12, paddingX: 2 }}
                    color={theme.colorBase.warning}
                    bgcolor={hexToRGB(theme.colorBase.warning, 0.2)}
                    position={'absolute'}
                    right={0}
                    top={0}
                  >
                    {t("labelSellHigh")}
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
                    {t("labelBuyLow")}
                  </Typography>
                )} */}
                <Box sx={{height: 64, display: 'flex', justifyContent: 'center', alignItems: 'center'}} >
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
                    <Typography variant={'h4'} color={'var(--color-success)'} textAlign={'center'}>
                      {info.apy}
                    </Typography>
                  </Box>
                  <Box width={'1px'} height={24} marginX={1.5} bgcolor={'var(--color-border)'} />
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
            {t("labelLoopringEarn")}
          </Typography>
          <Typography paddingX={14} color={'var(--color-text-button)'} textAlign={'center'} variant={'h5'}>
            {t("labelLoopringEarnDes")}{' '}
          </Typography>
        </Box>
        <Box marginTop={12.5}>
          <Typography textAlign={'center'} variant={'h2'}>
            {t("labelLoopringProtocol")}
          </Typography>
          <Typography
            textAlign={'center'}
            variant={'h5'}
            color={'var(--color-text-secondary)'}
            marginTop={2}
          >
            {t("labelLoopringProtocolDes")}
          </Typography>
        </Box>
        <Box marginTop={5} display={'flex'}>
          <AnimationCard
            justifyContent={'space-between'}
            highlighted={highlightedAnimationCard === 0}
            onMouseOver={() => setHighlightedAnimationCard(0)}
            marginRight={'2.06%'}
          >
            <Box>
              <Typography variant={'h3'} className={'title'}>
                {t("labelUltimateSecurity")}
              </Typography>
              <Typography className={'sub-title'}>
                {t("labelUltimateSecurityDes")}
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
            marginRight={'2.06%'}
          >
            <Box>
              <Typography variant={'h3'} className={'title'}>
                {t("labelLowTransactionFees")}
              </Typography>
              <Typography className={'sub-title'}>
                {t("labelLowTransactionFeesDes")}
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
                {t("labelHighThroughput")}
              </Typography>
              <Typography variant={'h5'} className={'sub-title'}>
                {t("labelHighThroughputDes")}
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
          {t("labelFAQs")}
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
