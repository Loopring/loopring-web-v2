import React from 'react'
import { Avatar, Box, BoxProps, styled, Typography } from '@mui/material'
import { CoinInfo, CoinSource, SoursURL, TokenType } from '@loopring-web/common-resources'
import { AvatarCoin, VaultTag } from '../../../basic-lib'
import { useSettings } from '../../../../stores'

const BoxStyle = styled(Box)<BoxProps & { size: number }>`
  ${({ size }) => {
    return `
    .logo-icon.dual:last-child {
      transform: scale(0.6) translate(${size / 6}px, ${size / 6}px);
    }
    .logo-icon.vault:last-child {
      transform: bottom;
    }
    `
  }}
`

export const CoinIcons = React.memo(
  ({
    tokenIcon,
    size: _size,
    type = TokenType.single,
  }: {
    tokenIcon: [CoinSource, CoinSource?]
    size?: number | 'middle' | 'small' | 'large'
    type?: TokenType
  }) => {
    const size = React.useMemo(() => {
      if (!_size) {
        return 24
      } else if (typeof _size === 'string') {
        switch (_size) {
          case 'middle':
            return 24
          case 'small':
            return 20
          case 'large':
            return 36
        }
      } else {
        return _size
      }
    }, [_size])

    const [coinAInfo, coinBInfo] = tokenIcon
    return (
      <BoxStyle
        display={'flex'}
        justifyContent={'center'}
        size={size}
        alignItems={[TokenType.vault].includes(type) ? 'flex-end' : 'initial'}
      >
        <Box
          className={`logo-icon ${type}`}
          display={'flex'}
          height={'var(--list-menu-coin-size)'}
          position={'relative'}
          zIndex={20}
          width={'var(--list-menu-coin-size)'}
          alignItems={'center'}
          justifyContent={'center'}
        >
          {coinAInfo ? (
            <AvatarCoin
              imgx={coinAInfo.x}
              imgy={coinAInfo.y}
              imgheight={coinAInfo.h}
              imgwidth={coinAInfo.w}
              size={size}
              variant='circular'
              alt={coinAInfo?.simpleName as string}
              // src={sellData?.icon}
              src={
                'data:image/svg+xml;utf8,' +
                '<svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M0 0H36V36H0V0Z"/></svg>'
              }
            />
          ) : (
            <Avatar
              variant='circular'
              alt={coinAInfo?.simpleName as string}
              style={{
                height: size ?? 'var(--list-menu-coin-size)',
                width: size ?? 'var(--list-menu-coin-size)',
              }}
              // src={sellData?.icon}
              src={SoursURL + 'images/icon-default.png'}
            />
          )}
        </Box>
        {[TokenType.vault].includes(type) && (
          <Box
            className={`logo-icon ${type}`}
            display={'flex'}
            position={'relative'}
            zIndex={24}
            left={-10}
            top={(Math.pow(size, 1.7) / 50 ) - 3}
            alignItems={'center'}
            justifyContent={'center'}
          >
            <VaultTag
              style={{
                height: size / 2,
                width: size / 2,
                transformOrigin: 'bottom',
              }}
            />
          </Box>
        )}
        {coinBInfo || [TokenType.dual, TokenType.lp].includes(type) ? (
          <Box
            className={`logo-icon ${type}`}
            display={'flex'}
            height={'var(--list-menu-coin-size)'}
            position={'relative'}
            zIndex={18}
            left={-8}
            width={'var(--list-menu-coin-size)'}
            alignItems={'center'}
            justifyContent={'center'}
          >
            {coinBInfo ? (
              <AvatarCoin
                imgx={coinBInfo.x}
                imgy={coinBInfo.y}
                imgheight={coinBInfo.h}
                imgwidth={coinBInfo.w}
                size={size}
                variant='circular'
                alt={coinBInfo?.simpleName as string}
                // src={sellData?.icon}
                src={
                  'data:image/svg+xml;utf8,' +
                  '<svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M0 0H36V36H0V0Z"/></svg>'
                }
              />
            ) : (
              <Avatar
                variant='circular'
                alt={coinBInfo?.simpleName as string}
                style={{
                  height: size ?? 'var(--list-menu-coin-size)',
                  width: size ?? 'var(--list-menu-coin-size)',
                }}
                // src={sellData?.icon}
                src={SoursURL + 'images/icon-default.png'}
              />
            )}
          </Box>
        ) : (
          <></>
        )}
      </BoxStyle>
    )
  },
)

export const CoinIconsNew = ({
  tokenIcon,
  size: _size,
  secondLogoType,
  ...rest
}: {
  tokenIcon: [CoinSource, CoinSource?]
  size?: number | 'middle' | 'small' | 'large'
  secondLogoType?: 'normal' | 'subscript'
} & BoxProps) => {
  const size = React.useMemo(() => {
    if (!_size) {
      return 24
    } else if (typeof _size === 'string') {
      switch (_size) {
        case 'middle':
          return 24
        case 'small':
          return 20
        case 'large':
          return 36
      }
    } else {
      return _size
    }
  }, [_size])

  const [coinAInfo, coinBInfo] = tokenIcon
  return (
    <Box display={'flex'} justifyContent={'center'} alignItems={'center'} {...rest}>
      <Box
        className={`logo-icon`}
        display={'flex'}
        height={size}
        position={'relative'}
        zIndex={20}
        width={size}
        alignItems={'center'}
        justifyContent={'center'}
      >
        {coinAInfo ? (
          <AvatarCoin
            imgx={coinAInfo.x}
            imgy={coinAInfo.y}
            imgheight={coinAInfo.h}
            imgwidth={coinAInfo.w}
            size={size}
            variant='circular'
            alt={coinAInfo?.simpleName as string}
            // src={sellData?.icon}
            src={
              'data:image/svg+xml;utf8,' +
              '<svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M0 0H36V36H0V0Z"/></svg>'
            }
          />
        ) : (
          <Avatar
            variant='circular'
            alt={coinAInfo?.simpleName as string}
            style={{
              height: size ?? 'var(--list-menu-coin-size)',
              width: size ?? 'var(--list-menu-coin-size)',
            }}
            // src={sellData?.icon}
            src={SoursURL + 'images/icon-default.png'}
          />
        )}
      </Box>
      {secondLogoType === 'subscript' && coinBInfo && (
        <Box
          className={`logo-icon`}
          display={'flex'}
          position={'relative'}
          zIndex={24}
          left={-20}
          top={Math.pow(size, 1.7) / 50 + 3}
          alignItems={'center'}
          justifyContent={'center'}
        >
          <AvatarCoin
            imgx={coinBInfo.x}
            imgy={coinBInfo.y}
            imgheight={coinBInfo.h}
            imgwidth={coinBInfo.w}
            size={size / 2}
            variant='circular'
            alt={coinBInfo?.simpleName as string}
            style={{
              transformOrigin: 'bottom',
            }}
            // src={sellData?.icon}
            src={
              'data:image/svg+xml;utf8,' +
              '<svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M0 0H36V36H0V0Z"/></svg>'
            }
          />
          {/* <VaultTag
              style={{
                height: size / 2,
                width: size / 2,
                transformOrigin: 'bottom',
              }}
            /> */}
        </Box>
      )}
      {secondLogoType !== 'subscript' && coinBInfo && (
        <Box
          className={`logo-icon`}
          display={'flex'}
          height={'var(--list-menu-coin-size)'}
          position={'relative'}
          zIndex={18}
          left={-8}
          width={'var(--list-menu-coin-size)'}
          alignItems={'center'}
          justifyContent={'center'}
        >
          {coinBInfo ? (
            <AvatarCoin
              imgx={coinBInfo.x}
              imgy={coinBInfo.y}
              imgheight={coinBInfo.h}
              imgwidth={coinBInfo.w}
              size={size}
              variant='circular'
              alt={coinBInfo?.simpleName as string}
              // src={sellData?.icon}
              src={
                'data:image/svg+xml;utf8,' +
                '<svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M0 0H36V36H0V0Z"/></svg>'
              }
            />
          ) : (
            <Avatar
              variant='circular'
              alt={coinBInfo?.simpleName as string}
              style={{
                height: size ?? 'var(--list-menu-coin-size)',
                width: size ?? 'var(--list-menu-coin-size)',
              }}
              // src={sellData?.icon}
              src={SoursURL + 'images/icon-default.png'}
            />
          )}
        </Box>
      )}
    </Box>
  )
}


export const ColumnCoinDeep = React.memo(
  ({
    token: { type = TokenType.single, ...token },
    isNotRequiredName = false,
  }: {
    token: CoinInfo<any> & {
      type?: TokenType
    }
  } & { isNotRequiredName?: boolean }) => {
    let tokenIcon: [any, any] = [undefined, undefined]
    const [head, middle, tail] = token?.simpleName?.split('-')
    const { coinJson } = useSettings()
    if (type === 'lp' && middle && tail) {
      tokenIcon =
        coinJson[middle] && coinJson[tail]
          ? [coinJson[middle], coinJson[tail]]
          : [undefined, undefined]
    }
    if (type !== 'lp' && head && head !== 'lp') {
      tokenIcon = coinJson[head] ? [coinJson[head], undefined] : [undefined, undefined]
    }
    return (
      <Box height={'100%'} display={'inline-flex'} alignItems={'center'}>
        <CoinIcons type={type} tokenIcon={tokenIcon} />
        <Typography marginLeft={1} component={'span'} color={'textPrimary'}>
          {token?.simpleName}
        </Typography>
        {!isNotRequiredName && (
          <Typography
            marginLeft={1 / 2}
            component={'span'}
            variant={'body2'}
            className={'next-company'}
            color={'textSecondary'}
          >
            {token?.name}
          </Typography>
        )}
      </Box>
    )
  },
)
