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
import { groupBy, keys } from 'lodash'

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

  const widths = ['25%', '25%','25%','25%']
  const group = groupBy(dualTokenList, token => token.symbol)
  const tableData = dualTokenList.length > 0 ? keys(group).map(symbol => {
    const list = group[symbol]
    return {
      token: symbol,
      list: list.map(type => {
        return {
          apy: type.apy,
          type: type.tag === 'buyDip' ? 'Buy Low' : 'Sell High',
          viewDetail: () => {},
        }
      })
    }
  }) : undefined
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
          {tableData ? (
            <>
              <Typography variant='h2'>{t("labelTitleOverviewAllPrd")}</Typography>
              <Box
                component={'hr'}
                marginTop={3}
                marginBottom={3}
                sx={{
                  background: 'var(--color-border)',
                  border: 'none',
                  height: '1px',
                }}
              />
              <Box paddingX={1.5} paddingY={1.5} display={'flex'}>
                <Typography
                  fontSize={'14px'}
                  color={'var(--color-text-secondary)'}
                  width={widths[0]}
                >
                  {t("labelToken")}
                </Typography>
                <Typography
                  fontSize={'14px'}
                  color={'var(--color-text-secondary)'}
                  width={widths[1]}
                >
                  {t("labelAPY")}
                </Typography>
                <Typography
                  fontSize={'14px'}
                  color={'var(--color-text-secondary)'}
                  width={widths[2]}
                >
                  {t("labelType")}
                </Typography>
                <Typography
                  fontSize={'14px'}
                  color={'var(--color-text-secondary)'}
                  width={widths[3]}
                  textAlign={'right'}
                >
                  {t("labelAction2")}
                </Typography>
              </Box>

              <Box>
                {tableData.map((ele) => {
                  return (
                    <Box key={ele.token} marginBottom={2.5}>
                      <Box
                        component={'hr'}
                        sx={{
                          background: 'var(--color-border)',
                          border: 'none',
                          height: '1px',
                        }}
                      />
                      {ele.list.map((type, index) => {
                        return (
                          <Box
                            paddingX={1.5}
                            key={type.type}
                            paddingY={3.5}
                            display={'flex'}
                            alignItems={'center'}
                          >
                            <Box width={widths[0]} display={'flex'} alignItems={'center'}>
                              {index === 0 && (
                                <>
                                  <CoinIcon symbol={ele.token} />
                                  <Typography marginLeft={1.5}>{ele.token}</Typography>
                                </>
                              )}
                            </Box>
                            <Box width={widths[1]} display={'flex'} alignItems={'center'}>
                              <Typography>{type.apy}</Typography>
                            </Box>
                            <Box width={widths[2]} display={'flex'} alignItems={'center'}>
                              <Typography>{type.type}</Typography>
                            </Box>
                            <Box width={widths[3]} display={'flex'} flexDirection={'row-reverse'}>
                              <Button
                                sx={{
                                  color: 'var(--color-primary)',
                                  borderColor: 'var(--color-primary)',
                                  ':hover': {
                                    color: 'var(--color-primary)',
                                    borderColor: 'var(--color-primary)',
                                  },
                                }}
                                variant={'outlined'}
                                onClick={type.viewDetail}
                              >
                                {t("labelMiningViewDetails")}
                              </Button>
                            </Box>
                          </Box>
                        )
                      })}
                    </Box>
                  )
                })}
              </Box>
            </>
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
