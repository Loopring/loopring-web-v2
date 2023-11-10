import React from 'react'
import { Box, Button, Typography } from '@mui/material'
import {
  CopyIcon,
  ExitIcon,
  getShortAddr,
  LinkIcon,
  SoursURL,
} from '@loopring-web/common-resources'
import { TFunction, Trans } from 'react-i18next'
import styled from '@emotion/styled'
import { AccountBaseProps } from './Interface'
import { ConnectProviders } from '@loopring-web/web3-provider'

const BoxStyled = styled(Box)`
  & .MuiButton-root {
    color: var(--color-text-secondary);

    &:hover {
      color: var(--color-text-primary);
    }
  }

  & .active {
  }

  & .unlock {
    svg {
      color: var(--color-error);
    }
  }

  & .lock {
    svg {
      color: var(--color-success);
    }
  }
` as typeof Box

export const AccountBasePanel = ({
  onDisconnect,
  accAddress,
  level,
  connectName,
  etherscanUrl,
  onCopy,
  hideVIPlevel,
  t,
}: AccountBaseProps & { t: TFunction }) => {
  const addressShort = getShortAddr(accAddress)
  const etherscanLink = etherscanUrl + 'address/' + accAddress
  const connectBy = connectName === ConnectProviders.Unknown ? t('labelWrongNetwork') : connectName

  const getImagePath = React.useMemo(() => {
    const path = SoursURL + `images/vips/${level.toUpperCase().replace('_', '')}`
    return (
      <img
        alt='VIP'
        style={{ verticalAlign: 'text-bottom', width: '32px', height: '16px' }}
        src={`${path}.webp`}
        // srcSet={`${path}.webp 1x, ${path}.png 1x`}
      />
    )
  }, [level])

  return (
    <Box
      display={'flex'}
      flexDirection={'column'}
      justifyContent={'flex-start'}
      alignItems={'center'}
    >
      <Typography variant={'body2'} color={'textSecondary'} marginTop={3}>
        <Trans i18nKey='labelConnectBy' tOptions={{ connectBy }}>
          Connected with{' '}
          <Typography variant={'body2'} component={'span'}>
            {connectName}
          </Typography>
          .
        </Trans>
      </Typography>
      <Typography
        marginTop={1}
        display={'flex'}
        alignItems={'center'}
        justifyContent={'flex-start'}
      >
        <Typography paddingRight={1} component={'span'} fontSize={'3rem'}>
          {addressShort}
        </Typography>
        {!hideVIPlevel && level && getImagePath}
      </Typography>

      <BoxStyled
        component={'div'}
        display={'flex'}
        alignItems={'center'}
        justifyContent={'space-between'}
        marginTop={1}
        alignSelf={'stretch'}
      >
        <Button
          target={'_blank'}
          href={etherscanLink}
          rel='noopener noreferrer'
          startIcon={<LinkIcon fontSize={'small'} />}
        >
          <Typography variant={'body2'} marginTop={1 / 2}>
            {'Etherscan'}
          </Typography>
        </Button>
        <Button
          startIcon={<CopyIcon fontSize={'small'} />}
          onClick={() => {
            if (onCopy) onCopy()
          }}
        >
          <Typography variant={'body2'} marginTop={1 / 2}>
            {' '}
            {t('labelCopyClipBoard')}{' '}
          </Typography>
        </Button>
        <Button
          startIcon={<ExitIcon fontSize={'small'} />}
          onClick={() => {
            if (onDisconnect) onDisconnect()
          }}
        >
          <Typography variant={'body2'} marginTop={1 / 2}>
            {' '}
            {t('labelDisconnect')}{' '}
          </Typography>
        </Button>
      </BoxStyled>
    </Box>
  )
}
