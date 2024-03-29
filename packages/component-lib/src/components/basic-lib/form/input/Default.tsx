import styled from '@emotion/styled'
import React from 'react'
import { Avatar, Box, FormControlLabel as MuFormControlLabel } from '@mui/material'
import {
  AvatarCoinProps,
  AvatarCoinStyled,
  LPTokenType,
  MarketType,
  SoursURL,
  TokenType,
} from '@loopring-web/common-resources'
import { useSettings } from '../../../../stores'
import { VaultTag } from '../../tags'

export const FormControlLabel = styled(MuFormControlLabel)`
  && {
    padding-right: ${({ theme }) => theme.unit * 2}px;
    background-color: inherit;
    border-radius: ${({ theme }) => theme.unit / 2}px;
    color: var(--color-text-secondary);
  }
`

export const AvatarCoin = (props: AvatarCoinProps) => {
  const size = props.size ?? 36
  return (
    <Box
      display={'inline-flex'}
      alignItems={'center'}
      justifyContent={'center'}
      height={36}
      width={36}
      sx={{ transform: `scale(${size / (36 * 2)})` }}
    >
      <AvatarCoinStyled {...props} />
    </Box>
  )
}

export const CoinIcon = <R extends MarketType | string | LPTokenType>({
  symbol,
  lpSize = 24,
  size: _size,
  type,
  tokenImageKey,
}: {
  symbol: R
  lpSize?: number
  size?: number | 'middle' | 'small' | 'large'
  type?: TokenType
  tokenImageKey?: R
}) => {
  const { coinJson } = useSettings()
  const size = React.useMemo(() => {
    if (!_size) {
      return 24
    } else if (typeof _size === 'string') {
      switch (_size) {
        case 'middle':
          return 24
          break
        case 'small':
          return 20
          break
        case 'large':
          return 36
          break
      }
    } else {
      return _size
    }
  }, [_size])

  if (symbol && symbol.match(/LP-(\w+)-(\w+)/i) && coinJson) {
    // @ts-ignore
    const [, coinA, coinB] = symbol.match(/LP-(\w+)-(\w+)/i)
    const coinAIcon: any = coinJson[coinA]
    const coinBIcon: any = coinJson[coinB]

    return (
      <Box display={'flex'} alignItems={'center'} marginRight={-1 / 2}>
        <Box
          className={'logo-icon'}
          display={'flex'}
          height={'var(--list-menu-coin-size)'}
          position={'relative'}
          zIndex={20}
          width={'var(--list-menu-coin-size)'}
          alignItems={'center'}
          justifyContent={'center'}
        >
          {coinAIcon ? (
            <AvatarCoin
              imgx={coinAIcon.x}
              imgy={coinAIcon.y}
              imgheight={coinAIcon.h}
              imgwidth={coinAIcon.w}
              size={lpSize}
              variant='circular'
              alt={symbol}
              src={
                'data:image/svg+xml;utf8,' +
                '<svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M0 0H36V36H0V0Z"/></svg>'
              }
            />
          ) : (
            <Avatar
              variant='circular'
              alt={symbol}
              style={{
                height: 'var(--list-menu-coin-size)',
                width: 'var(--list-menu-coin-size)',
              }}
              src={SoursURL + 'images/icon-default.png'}
            />
          )}
        </Box>
        <Box
          className={'logo-icon'}
          display={'flex'}
          height={'var(--list-menu-coin-size)'}
          position={'relative'}
          zIndex={18}
          left={-8}
          width={'var(--list-menu-coin-size)'}
          alignItems={'center'}
          justifyContent={'center'}
        >
          {coinBIcon ? (
            <AvatarCoin
              imgx={coinBIcon.x}
              imgy={coinBIcon.y}
              imgheight={coinBIcon.h}
              imgwidth={coinBIcon.w}
              size={lpSize}
              variant='circular'
              alt={symbol}
              src={
                'data:image/svg+xml;utf8,' +
                '<svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M0 0H36V36H0V0Z"/></svg>'
              }
            />
          ) : (
            <Avatar
              variant='circular'
              alt={symbol}
              style={{
                height: 'var(--list-menu-coin-size)',
                width: 'var(--list-menu-coin-size)',
              }}
              src={SoursURL + 'images/icon-default.png'}
            />
          )}
        </Box>
      </Box>
    )
  } else {
    if (type && type == TokenType.vault) {
      const coinIcon: any = coinJson[tokenImageKey ?? symbol]
      return (
        <Box display={'flex'} alignItems={'flex-end'} marginRight={-1 / 2}>
          <Box
            className={'logo-icon'}
            display={'flex'}
            height={'var(--list-menu-coin-size)'}
            position={'relative'}
            zIndex={20}
            width={'var(--list-menu-coin-size)'}
            alignItems={'center '}
            justifyContent={'center'}
          >
            {coinIcon ? (
              <AvatarCoin
                imgx={coinIcon.x}
                imgy={coinIcon.y}
                imgheight={coinIcon.h}
                imgwidth={coinIcon.w}
                size={size}
                variant='circular'
                alt={symbol}
                src={
                  'data:image/svg+xml;utf8,' +
                  '<svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M0 0H36V36H0V0Z"/></svg>'
                }
              />
            ) : (
              <Avatar
                variant='circular'
                alt={symbol}
                style={{
                  height: 'var(--list-menu-coin-size)',
                  width: 'var(--list-menu-coin-size)',
                }}
                src={SoursURL + 'images/icon-default.png'}
              />
            )}
          </Box>
          <Box
            className={`logo-icon ${type}`}
            display={'flex'}
            height={'var(--svg-size-small)'}
            position={'relative'}
            zIndex={24}
            left={-10}
            width={'var(--svg-size-small)'}
            alignItems={'flex-center'}
            justifyContent={'center'}
          >
            <VaultTag
              sx={{
                height: 36,
                width: 36,
                transformOrigin: 'bottom',
                transform: `scale(${size / (36 * 4)})`,
              }}
            />
          </Box>
        </Box>
      )
    } else {
      const coinIcon: any = coinJson[symbol]

      return (
        <>
          {coinIcon ? (
            <AvatarCoin
              imgx={coinIcon.x}
              imgy={coinIcon.y}
              imgheight={coinIcon.h}
              imgwidth={coinIcon.w}
              size={size}
              variant='circular'
              alt={symbol}
              src={
                'data:image/svg+xml;utf8,' +
                '<svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M0 0H36V36H0V0Z"/></svg>'
              }
            />
          ) : (
            <Avatar
              variant='circular'
              alt={symbol}
              style={{
                height: 'var(--list-menu-coin-size)',
                width: 'var(--list-menu-coin-size)',
              }}
              // src={sellData?.icon}
              src={SoursURL + 'images/icon-default.png'}
            />
          )}
        </>
      )
    }
    // {[TokenType.vault].includes(type) && (
    //     <Box
    //         className={`logo-icon ${type}`}
    //         display={'flex'}
    //         height={'var(--btn-icon-size-small)'}
    //         position={'relative'}
    //         zIndex={24}
    //         left={-12}
    //         width={'var(--btn-icon-size-small)'}
    //         alignItems={'center'}
    //         justifyContent={'center'}
    //     >
    //       <VaultTag
    //           sx={{
    //             height: 36,
    //             width: 36,
    //             transformOrigin: 'bottom',
    //             transform: `scale(${size / (36 * 2)})`,
    //           }}
    //       />
    //     </Box>
    // )}
  }
}
