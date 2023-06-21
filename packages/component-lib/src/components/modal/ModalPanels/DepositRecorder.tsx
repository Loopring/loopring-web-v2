import { Box, Link, Typography } from '@mui/material'
import styled from '@emotion/styled'
import React from 'react'
import { TFunction } from 'react-i18next'
import {
  AccountHashInfo,
  CompleteIcon,
  getFormattedHash,
  L1L2_NAME_DEFINED,
  LinkIcon,
  MapChainId,
  WaitingIcon,
  WarningIcon,
} from '@loopring-web/common-resources'
import { useTheme } from '@emotion/react'
import { useSettings } from '../../../stores'

const BoxStyled = styled(Box)`
  background: var(--color-box-hover);
  position: relative;
  overflow-y: scroll;
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* Internet Explorer 10+ */
  &::-webkit-scrollbar {
    /* WebKit */
    width: 0;
  }
  &:before {
    content: '';
    position: absolute;
    display: block;
    top: 0;
    left: 0;
    right: 0;
    width: 100%;
    height: 1px;
    box-shadow: ${({ theme }) => theme.colorBase.shadowHeader};
  }
  border-bottom-left-radius: ${({ theme }) => theme.unit}px;
  border-bottom-right-radius: ${({ theme }) => theme.unit}px;
` as typeof Box

export const DepositRecorder = ({
  t,
  accAddress,
  chainInfos,
  etherscanUrl,
  clear,
}: // updateDepositHash
{ t: TFunction } & {
  accAddress: string
  etherscanUrl: string
  chainInfos: AccountHashInfo
  clear?: () => void
  // updateDepositHash: (depositHash: string, accountAddress: string, status?: 'success' | 'failed') => void
}) => {
  const theme = useTheme()
  const { defaultNetwork } = useSettings()
  const network = MapChainId[defaultNetwork] ?? MapChainId[1]
  const depositView = React.useMemo(() => {
    return (
      <>
        {chainInfos &&
        chainInfos?.depositHashes &&
        chainInfos?.depositHashes[accAddress] &&
        chainInfos?.depositHashes[accAddress].length ? (
          <>
            <Typography
              display={'inline-flex'}
              justifyContent={'space-between'}
              paddingY={1 / 2}
              component={'h6'}
            >
              <Typography
                component={'p'}
                variant={'body2'}
                color={'text.primary'}
                paddingBottom={1}
              >
                {t('labelL1toL2Hash', {
                  loopringL2: L1L2_NAME_DEFINED[network].loopringL2,
                  l2Symbol: L1L2_NAME_DEFINED[network].l2Symbol,
                  l1Symbol: L1L2_NAME_DEFINED[network].l1Symbol,
                  ethereumL1: L1L2_NAME_DEFINED[network].ethereumL1,
                })}
              </Typography>
              {clear && (
                <Link
                  variant={'body2'}
                  paddingBottom={1}
                  onClick={() => {
                    clear()
                  }}
                >
                  {t('labelClearAll')}
                </Link>
              )}
            </Typography>
            {chainInfos?.depositHashes[accAddress].map((txInfo) => {
              return (
                <Typography
                  key={txInfo.hash}
                  display={'inline-flex'}
                  justifyContent={'space-between'}
                  fontSize={'h5'}
                  paddingY={1 / 2}
                >
                  {/*{depoistView}*/}
                  <Link
                    fontSize={'inherit'}
                    alignItems={'center'}
                    display={'inline-flex'}
                    href={`${etherscanUrl}tx/${txInfo.hash}`}
                    target={'_blank'}
                    rel={'noopener noreferrer'}
                  >
                    {txInfo.symbol ? (
                      <Typography component={'span'} color={'text.secondary'}>
                        {t('labelL1toL2Record', {
                          symbol: txInfo.symbol,
                          value: txInfo.value,
                        })}
                      </Typography>
                    ) : (
                      getFormattedHash(txInfo.hash)
                    )}
                    <LinkIcon style={{ marginLeft: `${theme.unit}px` }} fontSize={'small'} />
                  </Link>
                  <Typography fontSize={'inherit'} component={'span'}>
                    {txInfo.status === 'pending' ? (
                      <WaitingIcon fontSize={'large'} />
                    ) : txInfo.status === 'success' ? (
                      <CompleteIcon fontSize={'large'} />
                    ) : (
                      <WarningIcon fontSize={'large'} />
                    )}
                  </Typography>
                </Typography>
              )
            })}
          </>
        ) : (
          <Typography
            display={'flex'}
            flex={1}
            justifyContent={'center'}
            flexDirection={'column'}
            component={'h6'}
          >
            <Typography component={'p'} variant={'body1'} color={'text.secondary'}>
              {t('labelL1toL2HashEmpty', {
                loopringL2: L1L2_NAME_DEFINED[network].loopringL2,
                l2Symbol: L1L2_NAME_DEFINED[network].l2Symbol,
                l1Symbol: L1L2_NAME_DEFINED[network].l1Symbol,
                ethereumL1: L1L2_NAME_DEFINED[network].ethereumL1,
              })}
            </Typography>
          </Typography>
        )}
      </>
    )
  }, [network, chainInfos?.depositHashes[accAddress]])

  return (
    <BoxStyled
      minHeight={60}
      maxHeight={180}
      component={'div'}
      display={'flex'}
      paddingX={5}
      paddingY={1}
      flex={1}
      flexDirection={'column'}
      alignSelf={'flex-end'}
      className={'depositRecord'}
    >
      {depositView}
    </BoxStyled>
  )
}
