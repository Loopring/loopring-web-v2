import { WithTranslation, withTranslation } from 'react-i18next'
import { Box, Typography } from '@mui/material'
import styled from '@emotion/styled'

import React from 'react'
import { useAmmMapUI } from './hook'

import { Button, PoolsTable, useSettings } from '@loopring-web/component-lib'

import { useNotify, useSystem } from '@loopring-web/core'
import { AmmLogo, BackIcon, RowInvestConfig } from '@loopring-web/common-resources'
import { useHistory } from 'react-router-dom'
import { MaxWidthContainer, containerColors } from '..'
import { useTheme } from '@emotion/react'
import { SoursURL } from '@loopring-web/loopring-sdk'

const WrapperStyled = styled(Box)`
  flex: 1;
  display: flex;
  flex-direction: column;
  background: var(--color-box);
  border-radius: ${({ theme }) => theme.unit}px;
`

const StylePaper = styled(Box)`
  width: 100%;
  //height: 100%;
  flex: 1;
  padding-bottom: ${({ theme }) => theme.unit}px;

  .rdg {
    flex: 1;
  }
` as typeof Box

export const PoolsPanel = withTranslation('common')(
  <R extends { [key: string]: any }, I extends { [key: string]: any }>({
    t,
  }: WithTranslation & {}) => {
    const container = React.useRef(null)
    const history = useHistory()
    const { forexMap } = useSystem()
    const { currency, isMobile } = useSettings()
    const poolTableProps = useAmmMapUI()
    const { campaignTagConfig } = useNotify().notifyMap ?? {}
    const theme = useTheme()
    return (
      <Box display={'flex'} flexDirection={'column'} flex={1}>
        <MaxWidthContainer
          display={'flex'}
          justifyContent={'space-between'}
          background={containerColors[0]}
          height={isMobile ? 50 * theme.unit : 34 * theme.unit}
          alignItems={'center'}
        >
          <Box paddingY={7}>
            <Typography marginBottom={2} fontSize={'48px'} variant={'h1'}>
              {t("labelLiquidityPageTitle")}
            </Typography>
            <Button onClick={() => history.push('/invest/balance')} sx={{ width: isMobile ? 36 * theme.unit : 18 * theme.unit }} variant={'contained'}>
              {t("labelInvestMyAmm")}
            </Button>
          </Box>
          {!isMobile && <AmmLogo />}
        </MaxWidthContainer>
        <MaxWidthContainer minHeight={'70vh'} background={containerColors[1]}>
          <PoolsTable
            {...{
              ...poolTableProps,
              campaignTagConfig,
              rowConfig: RowInvestConfig,
              forexValue: forexMap[currency],
            }}
          />
        </MaxWidthContainer>
      </Box>
    )
  },
)
