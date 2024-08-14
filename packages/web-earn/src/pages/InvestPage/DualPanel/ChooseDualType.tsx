import { Box, Grid, Typography } from '@mui/material'
import {
  DualDownIcon,
  DualConvertIcon,
  DualUpIcon,
  DualViewType,
  LOOPRING_DOCUMENT,
  DualInvestmentLogo,
  SoursURL,
} from '@loopring-web/common-resources'
import { Button, CoinIcon, MenuBtnStyled, useSettings } from '@loopring-web/component-lib'
import React from 'react'
import { useTranslation } from 'react-i18next'
import styled from '@emotion/styled'
import { containerColors, MaxWidthContainer } from '../index'
import { useHistory } from 'react-router-dom'
import { useTheme } from '@emotion/react'

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

export const ChooseDualTypeContent = [
  {
    icon: (
      <DualUpIcon
        style={{
          width: 156,
          height: 156,
        }}
      />
    ),
    type: DualViewType.DualGain,
    titleKey: 'labelCoverGain',
    desKey: 'labelCoverGainDes',
  },
  {
    icon: (
      <DualDownIcon
        style={{
          width: 156,
          height: 156,
        }}
      />
    ),
    type: DualViewType.DualDip,
    titleKey: 'labelDip',
    desKey: 'labelDipDes',
  },

  {
    icon: (
      <DualConvertIcon
        style={{
          width: 156,
          height: 156,
        }}
      />
    ),
    type: DualViewType.All,
    titleKey: 'labelDualMerge',
    desKey: 'labelDualMergeDes',
  },
]
export const TypographyStyle = styled(Typography)`
  svg {
    fill: ${({ theme }) => theme.colorBase.textSecondary};
  }
` as typeof Typography
export const ChooseDualType = ({ 
  onSelect,
  dualTokenList,
  productsRef
}: { 
  onSelect: (props: DualViewType) => void,
  dualTokenList: {
    symbol: string;
    apy: string;
    price: string;
    tag: "sellCover" | "buyDip";
    apyRaw: number;
  }[]
  productsRef: React.MutableRefObject<HTMLDivElement | undefined>
}) => {
  const { isMobile } = useSettings()
  const theme = useTheme()
  const history = useHistory()
  const { t } = useTranslation()
  const tEarn = useTranslation('webEarn').t
  return (
    <>
      <MaxWidthContainer
        display={'flex'}
        justifyContent={'space-between'}
        background={containerColors[0]}
        height={isMobile ? 60 * theme.unit : 30 * theme.unit}
        alignItems={'center'}
      >
        <Box paddingY={7}>
          <Typography marginBottom={2} fontSize={'38px'} variant={'h1'}>
            {t('labelInvestDualTitle')}
          </Typography>
          <Box display={'flex'} alignItems={'center'}>
            <Button
              onClick={() => history.push('/l2assets/assets/Invests')}
              sx={{ width: isMobile ? 36 * theme.unit : 18 * theme.unit }}
              variant={'contained'}
            >
              {t('labelInvestMyDual')}
            </Button>

            <Button
              onClick={() => {
                window.open(`${LOOPRING_DOCUMENT}dual_investment_tutorial_en.md`, '_blank')
                window.opener = null
              }}
              sx={{ marginLeft: 1.5, height: 40 }}
              variant={'outlined'}
              color={'inherit'}
            >
              {t('labelInvestDualTutorial')}
            </Button>
          </Box>
        </Box>
        {!isMobile && <DualInvestmentLogo />}
      </MaxWidthContainer>
      <MaxWidthContainer background={containerColors[1]} minHeight={'70vh'} paddingY={3}>
        <Grid
          container
          flex={1}
          display={'flex'}
          spacing={2}
          flexDirection={isMobile ? 'column' : 'row'}
        >
          {ChooseDualTypeContent.map((item) => {
            return (
              <Grid item xs={6} md={4} key={item.type} display={'flex'} justifyContent={'center'}>
                <MenuBtnStyled
                  variant={'outlined'}
                  sx={{
                    width: 'var(--dual-type-width)',
                    height: '320px',
                    flexDirection: 'column',
                    justifyContent: 'space-around',
                  }}
                  onClick={() => onSelect(item.type)}
                >
                  <Box display={'flex'} flexDirection={'column'} alignItems={'left'} marginTop={3}>
                    <Typography
                      variant={'h5'}
                      component={'span'}
                      display={'inline-flex'}
                      color={'textPrimary'}
                      textAlign={'left'}
                      sx={{ textIndent: 0 }}
                    >
                      {t(item.titleKey)}
                    </Typography>
                    <Typography
                      sx={{ textIndent: 0 }}
                      variant={'body1'}
                      component={'span'}
                      display={'inline-flex'}
                      color={'textSecondary'}
                      textAlign={'left'}
                    >
                      {t(item.desKey)}
                    </Typography>
                  </Box>
                  <TypographyStyle component={'span'} display={'inline-flex'}>
                    {item.icon}
                  </TypographyStyle>
                  <Button
                    sx={{ marginBottom: 3 }}
                    variant={'contained'}
                    fullWidth
                    color={'primary'}
                    size={'medium'}
                  >
                    {t('labelDualInvestGuid')}
                  </Button>
                </MenuBtnStyled>
              </Grid>
            )
          })}
        </Grid>

        <Box ref={productsRef} component={'div'} id={'products'} marginTop={8}>
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
                        ? tEarn('labelInvestSymbolSellHigh', {
                            symbol: info.symbol,
                          })
                        : tEarn('labelInvestSymbolBuyLow', {
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
                          {tEarn('labelApy')}
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
                        <Typography textAlign={'center'}>{tEarn('labelCurrentPrice')}</Typography>
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
                      {tEarn('labelViewDetails')}
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

      </MaxWidthContainer>
    </>
  )
}
