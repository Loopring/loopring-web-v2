import React from 'react'
import * as sdk from '@loopring-web/loopring-sdk'
import { useHistory } from 'react-router-dom'
import { Button, useSettings } from '@loopring-web/component-lib'
import {
  ConvertToIcon,
  L1L2_NAME_DEFINED,
  Layer2RouterID,
  MapChainId,
  MessageIcon,
  RouterPath,
} from '@loopring-web/common-resources'
import { useTranslation } from 'react-i18next'
import { Box, IconButton, Link, Snackbar, Typography } from '@mui/material'
import moment from 'moment'
import styled from '@emotion/styled'
import { useNotification, useNotificationFunc } from '../hooks'

const BoxStyle = styled(Box)`
  .point {
    right: 4px;
    top: 4px;
    position: absolute;
    width: 8px;
    height: 8px;
    background: var(--color-error);
    border-radius: 50%;
  }
  &.headerItem {
    padding: 0;
    .MuiGrid-item {
      padding: 0;
    }
    .message {
      word-wrap: break-word;
      text-overflow: ellipsis;
      overflow: hidden;
      white-space: nowrap;
      width: 274px;
      display: inline-block;
      margin-top: ${({ theme }) => (1 / 2) * theme.unit}px;
      svg {
        display: none;
      }
    }
    .time {
      margin-top: ${({ theme }) => (1 / 2) * theme.unit}px;
      font-size: ${({ theme }) => theme.fontDefault.body2};
    }
    .point {
      width: 4px;
      height: 4px;
      right: 0;
      top: 0;
    }
  }
`
export const NoticePop = ({
  isShow,
  setNotificationPush,
  ...rest
}: sdk.UserNotification & {
  isShow: boolean
  setNotificationPush: (props: { isShow: boolean; item: any }) => void
}) => {
  const history = useHistory()
  const { t } = useTranslation()
  const { onReadClick } = useNotificationFunc({})
  // const [open, setOpen] = React.useState(false)
  const { defaultNetwork } = useSettings()
  const network = MapChainId[defaultNetwork] ?? MapChainId[1]

  const handleClose = () => {
    onReadClick(0, rest)
    setNotificationPush({ isShow: false, item: null })
  }
  const ele = useNotification({
    ...rest,
    index: 0,
    onReadClick,
  })
  const actionEle = React.useMemo(() => {
    return (
      <Box display={'inline-flex'} justifyContent={'flex-end'} flexDirection={'row-reverse'}>
        <Button
          sx={{ marginLeft: 1 }}
          variant={'contained'}
          size={'small'}
          color={'primary'}
          onClick={() => {
            ele?.active
              ? ele?.active()
              : history.push(`/#${RouterPath.layer2}/${Layer2RouterID.notification}`)
            handleClose()
          }}
        >
          {t('labelDetail')}
        </Button>
        <Button
          sx={{ marginLeft: 1 }}
          variant={'text'}
          size={'medium'}
          onClick={() => {
            handleClose()
          }}
        >
          {t('labelClose')}
        </Button>
      </Box>
    )
  }, [ele])
  return (
    <Snackbar
      open={isShow}
      autoHideDuration={20000}
      ContentProps={{
        sx: {
          flexDirection: 'column',
        },
      }}
      sx={{
        pointerEvents: 'all',
        flexDirection: 'column',
        top: '80% !important',
        height: 'fit-content',
        '.MuiPaper-root': { background: 'var(--color-pop-bg)' },
      }}
      onClose={handleClose}
      message={
        <Box
          display={'flex'}
          flexDirection={'column'}
          justifyContent={'start'}
          alignItems={'flex-start'}
        >
          <Typography variant={'body1'} color={'textSecondary'}>
            {t(ele.i18nKey, {
              l1ChainName: L1L2_NAME_DEFINED[network].l1ChainName,
              loopringL2: L1L2_NAME_DEFINED[network].loopringL2,
              l2Symbol: L1L2_NAME_DEFINED[network].l2Symbol,
              l1Symbol: L1L2_NAME_DEFINED[network].l1Symbol,
              ethereumL1: L1L2_NAME_DEFINED[network].ethereumL1,
            })}
          </Typography>
          <Typography variant={'body1'} color={'textPrimary'} marginTop={1} className={'message'}>
            {rest.message}
          </Typography>

          <Typography
            variant={'body1'}
            color={'textSecondary'}
            marginTop={1}
            textAlign={'center'}
            className={'time'}
          >
            {t('labelNotificationTime', {
              time: moment(rest.createAt).fromNow(),
              interpolation: {
                escapeValue: false,
              },
            })}
          </Typography>
        </Box>
      }
      action={actionEle}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
    />
  )
}

export const NotificationItem = React.memo(
  ({
    index,
    onReadClick,
    className = '',
    size = 'large',
    ...rest
  }: sdk.UserNotification & {
    index: number
    className?: string
    size?: 'small' | 'medium' | 'large'
    onReadClick: (index: number, rest: any) => void
  }) => {
    const { message, createAt } = rest
    const { defaultNetwork } = useSettings()
    const network = MapChainId[defaultNetwork] ?? MapChainId[1]
    const { t } = useTranslation()
    const ele = useNotification({ index, onReadClick, ...rest })
    return (
      <BoxStyle display={'flex'} justifyContent={'stretch'} paddingY={1} className={className}>
        <Box position={'relative'} marginRight={2}>
          {!rest.read ? (
            <IconButton size={size} onClick={() => onReadClick(index, rest)}>
              <MessageIcon htmlColor={'var(--color-text-secondary)'} />
            </IconButton>
          ) : (
            <MessageIcon fontSize={size} htmlColor={'var(--color-text-third)'} />
          )}
          {!rest.read && <Typography className={'point'} component={'i'} display={'block'} />}
        </Box>
        <Box flex={1} display={'flex'} flexDirection={'column'} alignItems={'flex-start'}>
          <Typography variant={'body1'} color={'textSecondary'}>
            {t(ele.i18nKey, {
              l1ChainName: L1L2_NAME_DEFINED[network].l1ChainName,
              loopringL2: L1L2_NAME_DEFINED[network].loopringL2,
              l2Symbol: L1L2_NAME_DEFINED[network].l2Symbol,
              l1Symbol: L1L2_NAME_DEFINED[network].l1Symbol,
              ethereumL1: L1L2_NAME_DEFINED[network].ethereumL1,
            })}
          </Typography>
          {ele.active ? (
            <Link
              variant={'body1'}
              color={'textPrimary'}
              marginTop={1}
              onClick={() => ele.active()}
              className={'message'}
              display={'inline-flex'}
              justifyContent={'space-between'}
              alignItems={'center'}
              width={'100%'}
            >
              <span>{message}</span>
              <ConvertToIcon fontSize={'medium'} color={'inherit'} />
            </Link>
          ) : (
            <Typography
              onClick={() => onReadClick(index, rest)}
              variant={'body1'}
              color={'textPrimary'}
              marginTop={1}
              className={'message'}
            >
              {message}
            </Typography>
          )}
          <Typography
            variant={'body1'}
            color={'textSecondary'}
            marginTop={1}
            textAlign={'center'}
            className={'time'}
          >
            {t('labelNotificationTime', {
              time: moment(createAt).fromNow(),
              interpolation: {
                escapeValue: false,
              },
            })}
          </Typography>
        </Box>
      </BoxStyle>
    )
  },
)
