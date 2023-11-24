import styled from '@emotion/styled'
import { Box, Divider } from '@mui/material'
import React from 'react'
import { WithTranslation, withTranslation } from 'react-i18next'
import {
  Button,
  ForceWithdrawPanel,
  TransactionTradeViews,
  useSettings,
  MaxWidthContainer,
} from '@loopring-web/component-lib'
import { useForceWithdraw } from '@loopring-web/core'
import { useTheme } from '@emotion/react'
import { useHistory } from 'react-router-dom'
import { BackIcon, RecordTabIndex, RouterPath } from '@loopring-web/common-resources'

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
      <>
        <MaxWidthContainer
          background={'var(--color-global-bg)'}
          display={'flex'}
          justifyContent={'space-between'}
          flexDirection={'row'}
          paddingY={2}
        >
          <Button
            startIcon={<BackIcon fontSize={'small'} />}
            variant={'text'}
            size={'medium'}
            sx={{ color: 'var(--color-text-primary)' }}
            color={'inherit'}
            onClick={history.goBack}
          >
            {t('labelForceWithdrawTitle')}
          </Button>
          <Button
            variant={'text'}
            sx={{ color: 'var(--color-text-primary)' }}
            color={'inherit'}
            endIcon={<BackIcon fontSize={'small'} sx={{ transform: 'rotate(180deg)' }} />}
            onClick={() =>
              history.push(
                `${RouterPath.l2records}/${RecordTabIndex.Transactions}?types=${TransactionTradeViews.forceWithdraw}`,
              )
            }
          >
            {t('labelTransactionsLink')}
          </Button>
        </MaxWidthContainer>
        <Divider />
        <MaxWidthContainer
          maxWidth='lg'
          style={{
            display: 'flex',
            flexDirection: 'column',
            flex: 1,
          }}
        >
          <Box flex={1} display={'flex'} flexDirection={'column'}>
            <Box marginBottom={2}></Box>
            <StylePaper
              flex={1}
              display={'flex'}
              alignItems={'center'}
              justifyContent={'center'}
              className={isMobile ? 'isMobile' : 'MuiPaper-elevation2'}
              marginBottom={2}
              position={'relative'}
            >
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
        </MaxWidthContainer>
      </>
    )
  },
)
