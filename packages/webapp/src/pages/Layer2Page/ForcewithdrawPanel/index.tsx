import styled from '@emotion/styled'
import { Box, Link } from '@mui/material'
import React from 'react'
import { WithTranslation, withTranslation } from 'react-i18next'
import {
  Button,
  ForceWithdrawPanel,
  TransactionTradeViews,
  useSettings,
} from '@loopring-web/component-lib'
import { useForceWithdraw } from '@loopring-web/core'
import { useTheme } from '@emotion/react'
import { useHistory } from 'react-router-dom'
import { BackIcon } from '@loopring-web/common-resources'

const StylePaper = styled(Box)`
  background: var(--color-box);
  border-radius: ${({ theme }) => theme.unit}px;

  .content {
    width: 420px;
  }

  &.isMobile {
    .content {
      flex: 1;
      width: var(--swap-box-width);
    }
  }
`

export const ForcewithdrawPanel = withTranslation(['common', 'layout'])(
  ({ t }: WithTranslation) => {
    const { isMobile } = useSettings()
    const history = useHistory()
    const { forceWithdrawProps } = useForceWithdraw()
    const theme = useTheme()
    const extendsProps = isMobile ? { _width: 420 } : { _width: 'auto' }
    return (
      <Box flex={1} display={'flex'} flexDirection={'column'}>
        <Box marginBottom={2}>
          <Button
            startIcon={<BackIcon fontSize={'small'} />}
            variant={'text'}
            size={'medium'}
            sx={{ color: 'var(--color-text-secondary)' }}
            color={'inherit'}
            onClick={history.goBack}
          >
            {t('labelForceWithdrawTitle')}
            {/*<Typography color={"textPrimary"}></Typography>*/}
          </Button>
        </Box>
        <StylePaper
          flex={1}
          display={'flex'}
          alignItems={'center'}
          justifyContent={'center'}
          className={isMobile ? 'isMobile' : 'MuiPaper-elevation2'}
          marginBottom={2}
          position={'relative'}
        >
          <Link
            position={'absolute'}
            variant={'body1'}
            sx={{
              right: 2 * theme.unit,
              top: 2 * theme.unit,
              zIndex: 999,
            }}
            target='_self'
            rel='noopener noreferrer'
            onClick={() =>
              history.push(
                `/l2assets/history/${RecordTabIndex.Transactions}?types=${TransactionTradeViews.forceWithdraw}`,
              )
            }
          >
            {t('labelTransactionsLink')}
          </Link>
          <Box
            display={'flex'}
            alignItems={'center'}
            justifyContent={'center'}
            className={'content'}
          >
            <ForceWithdrawPanel {...{ ...forceWithdrawProps, ...extendsProps }} />
          </Box>
        </StylePaper>
      </Box>
    )
  },
)
