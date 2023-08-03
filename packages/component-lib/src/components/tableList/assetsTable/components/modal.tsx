import { useTranslation } from 'react-i18next'
import styled from '@emotion/styled'
import { Box, Link, Typography } from '@mui/material'
import { useSettings } from '../../../../stores'
import { LoadingBlock } from '../../../block'
import { CoinIcons } from './CoinIcons'

const ContentWrapperStyled = styled(Box)`
  position: absolute;
  top: 45%;
  left: 50%;
  transform: translate(-50%, -50%);
  // min-width: ${({ theme }) => theme.unit * 87.5}px;
  // height: 60%;
  background-color: var(--color-pop-bg);
  box-shadow: 0px ${({ theme }) => theme.unit / 2}px ${({ theme }) => theme.unit / 2}px
    rgba(0, 0, 0, 0.25);
  padding: 0 ${({ theme }) => theme.unit * 1}px;
  border-radius: ${({ theme }) => theme.unit / 2}px;
`

const HeaderStyled = styled(Box)`
  display: flex;
  align-items: center;
  width: 100%;
  margin-top: ${({ theme }) => theme.unit * 2}px;
  margin-bottom: ${({ theme }) => theme.unit * 2}px;
  padding: 0 ${({ theme }) => theme.unit * 3}px;
`

export const LockDetailPanel = ({
  tokenLockDetail,
}: {
  tokenLockDetail?:
    | undefined
    | {
        list: any[]
        row: any
      }
}) => {
  const { t } = useTranslation()
  const { isMobile, coinJson } = useSettings()

  const token = tokenLockDetail?.row?.token

  let tokenIcon: [any, any] = [undefined, undefined]
  if (token) {
    const [head, middle, tail] = token?.value?.split('-')
    if (token.type === 'lp' && middle && tail) {
      tokenIcon =
        coinJson[middle] && coinJson[tail]
          ? [coinJson[middle], coinJson[tail]]
          : [undefined, undefined]
    }
    if (token.type !== 'lp' && head && head !== 'lp') {
      tokenIcon = coinJson[head] ? [coinJson[head], undefined] : [undefined, undefined]
    }
  }

  return (
    <ContentWrapperStyled width={'var(--mobile-full-panel-width)'}>
      <HeaderStyled
        flexDirection={isMobile ? 'column' : 'row'}
        alignItems={'flex-start'}
        justifyContent={'center'}
      >
        <Typography variant={'h4'} display={'flex'} justifyContent={'center'}>
          {token && <CoinIcons type={token.type} tokenIcon={tokenIcon} size={28} />}
          <Typography
            variant={'inherit'}
            color={'textPrimary'}
            display={'flex'}
            flexDirection={'column'}
            marginLeft={2}
            component={'span'}
            paddingRight={1}
          >
            <Typography variant={'inherit'} component={'span'} className={'next-coin'}>
              {t('labelLocketInfo', { symbol: token?.value })}
            </Typography>
          </Typography>
        </Typography>
      </HeaderStyled>
      <Box borderRadius={'inherit'} minWidth={110} paddingBottom={2}>
        {tokenLockDetail && tokenLockDetail.list?.length ? (
          tokenLockDetail.list.map((item) => {
            return (
              <Box
                display={'flex'}
                key={item.key}
                flexDirection={'row'}
                justifyContent={'space-between'}
                padding={1}
              >
                <Typography
                  display={'inline-flex'}
                  alignItems={'center'}
                  component={'span'}
                  color={'textSecondary'}
                >
                  {t(item.key)}
                </Typography>

                <Link
                  display={'inline-flex'}
                  alignItems={'center'}
                  color={'inherit'}
                  variant={'body1'}
                  style={{
                    textDecoration: 'underline dotted',
                    // color: 'var(--color-text-secondary)',
                  }}
                  href={item.link}
                >
                  {item.value}
                </Link>
              </Box>
            )
          })
        ) : (
          <LoadingBlock />
        )}
      </Box>
    </ContentWrapperStyled>
  )
}
