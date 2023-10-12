import styled from '@emotion/styled'
import { ConfirmInvestDualRisk } from '@loopring-web/component-lib'
import { Box, Button, Modal, Typography } from '@mui/material'

import { withTranslation } from 'react-i18next'
import { DualModal } from './component'
import { BackIcon, UpIcon, hexToRGB } from '@loopring-web/common-resources'
import { useTheme } from '@emotion/react'

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
  cursor: pointer;
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
`

export const EarnPage = withTranslation('common', { withRef: true })(() => {
  const infos: {
    imgSrc: string
    symbol: string
    apy: string
    tvl: string
    tag: 'sellCover' | 'buyDip'
  }[] = [
    {
      imgSrc:
        'https://raw.githubusercontent.com/Uniswap/assets/master/blockchains/ethereum/assets/0xBBbbCA6A901c926F240b89EacB641d8Aec7AEafD/logo.png',
      symbol: 'ETH',
      apy: '999.9%',
      tvl: '$607.94M',
      tag: 'sellCover',
    },
    {
      imgSrc:
        'https://raw.githubusercontent.com/Uniswap/assets/master/blockchains/ethereum/assets/0xBBbbCA6A901c926F240b89EacB641d8Aec7AEafD/logo.png',
      symbol: 'BTC',
      apy: '999.9%',
      tvl: '$607.94M',
      tag: 'sellCover',
    },
    {
      imgSrc:
        'https://raw.githubusercontent.com/Uniswap/assets/master/blockchains/ethereum/assets/0xBBbbCA6A901c926F240b89EacB641d8Aec7AEafD/logo.png',
      symbol: 'BTC',
      apy: '999.9%',
      tvl: '$607.94M',
      tag: 'sellCover',
    },
    {
      imgSrc:
        'https://raw.githubusercontent.com/Uniswap/assets/master/blockchains/ethereum/assets/0xBBbbCA6A901c926F240b89EacB641d8Aec7AEafD/logo.png',
      symbol: 'BTC',
      apy: '999.9%',
      tvl: '$607.94M',
      tag: 'buyDip',
    },
  ]
  const faqs: {
    question: string
    answer: string
    opened: boolean
  }[] = [
    {
      question: 'What’s the Loopring Lite ?',
      answer:
        'Dual Investment is a non-principal protected structured product. Upon purchasing, you can select the underlying asset, investment currency, investment amount, and delivery date. ',
      opened: true,
    },
    {
      question: 'What’s your name ?',
      answer: 'todo',
      opened: false,
    },
  ]
  const connected = true
  const theme = useTheme()

  return (
    <Box
      display={'flex'}
      flexDirection={'column'}
      width={'100%'}
      marginBottom={2}
      maxWidth={'1200px'}
      justifyContent={'center'}
    >
      <Box display={'flex'} justifyContent={'center'} flexDirection={'column'} width={'100%'}>
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

      <Box
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
        <Box>
          <Typography variant={'h5'} color={'var(--color-text-secondary)'}>
            Current Locking TVL
          </Typography>
          <Typography variant={'h2'}>$54,456,94</Typography>
        </Box>
        {connected ? (
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
              $54,456,94
            </Typography>
          </Box>
        ) : (
          <ConnectBtn variant={'contained'}>
            <Typography variant={'h2'}>Connect Wallet</Typography>
          </ConnectBtn>
        )}

        <Box>
          <Typography variant={'h5'} color={'var(--color-text-secondary)'}>
            Up To
          </Typography>
          <Typography variant={'h2'}>46.98%</Typography>
        </Box>
      </Box>

      <Box marginTop={12.5} display={'flex'} flexWrap={'wrap'}>
        {infos.map((info, index) => {
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
              <Box width={64} height={64} src={info.imgSrc} component={'img'} />
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
                    {info.tvl}
                  </Typography>
                </Box>
              </Box>

              <Button variant={'contained'} fullWidth>
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
        <Typography textAlign={'center'} marginBottom={3} variant={'h2'}>
          loopring Earn
        </Typography>
        <Typography textAlign={'center'} variant={'h5'}>
          Loopring Earn is built on top of Loopring Protocol to take full advantage of its ZKRollup
          technology and full-stack DEX capability to provide the most innovative DeFi products to
          users.{' '}
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
          The world's first ZKRollup implementation designed to scale Ethereum, fully optimized for
          trading.
        </Typography>
      </Box>
      <Box marginTop={5}>
        <Box>
          <Typography>Ultimate Security</Typography>
          <Typography>
            Assets on Loopring L2 are equally secure as they are on the Ethereum mainnet.
          </Typography>
          <img src={'https://static.loopring.io/assets/images/nft_dark.png'} />
        </Box>
        <Box>
          <Typography>Low Transaction Fees</Typography>
          <Typography>
            Assets on Loopring L2 are equally secure as they are on the Ethereum mainnet.
          </Typography>
          <img src={'https://static.loopring.io/assets/images/nft_dark.png'} />
        </Box>
        <Box>
          <Typography>Ultimate Security</Typography>
          <Typography>
            Loopring L2 can settle ~2000 transactions per second with near instant finality.
          </Typography>
          <img src={'https://static.loopring.io/assets/images/nft_dark.png'} />
        </Box>
      </Box>

      <Typography textAlign={'center'} marginTop={12.5} variant={'h2'}>
        FAQs
      </Typography>
      <Box marginTop={5} marginBottom={12.5}>
        {faqs.map((faq, index) => {
          return (
            <FAQ opend={faq.opened} key={faq.question}>
              <Box display={'flex'} justifyContent={'space-between'}>
                <Typography marginBottom={2} variant={'h3'}>
                  {faq.question}
                </Typography>
                <BackIcon
                  sx={{
                    transform: faq.opened ? 'rotate(90deg)' : 'rotate(270deg)',
                  }}
                  htmlColor={'var(--color-text-secondary)'}
                />
              </Box>
              {faq.opened && (
                <Typography variant={'h5'} color={'var(--color-text-secondary)'}>
                  {faq.answer}
                </Typography>
              )}
            </FAQ>
          )
        })}
      </Box>

      <DualModal open={false} />
    </Box>
  )
})
