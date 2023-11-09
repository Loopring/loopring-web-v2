import React from 'react'
import * as sdk from '@loopring-web/loopring-sdk'
import { useHistory } from 'react-router-dom'
import { useSettings } from '@loopring-web/component-lib'
import {
  ConvertToIcon,
  L1L2_NAME_DEFINED,
  MapChainId,
  MessageIcon,
  RecordTabIndex,
  RouterPath,
} from '@loopring-web/common-resources'
import { useTranslation } from 'react-i18next'
import { Box, IconButton, Link, Typography } from '@mui/material'
import moment from 'moment'
import styled from '@emotion/styled'

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
      display: inline-flex;
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
export const NotificationItem = React.memo(
  ({
    index,
    onReadClick,
    className = '',
    size = 'large',
    ...rest
  }: sdk.UserNotification & {
    index: number
    className: string
    size
    onReadClick: (index: number, rest: any) => void
  }) => {
    const { messageType, message, createAt } = rest
    const history = useHistory()
    const { defaultNetwork } = useSettings()
    const network = MapChainId[defaultNetwork] ?? MapChainId[1]
    const { t } = useTranslation()
    let ele: any = {
      i18nKey: '',
      active: undefined,
    }

    switch (messageType) {
      case sdk.NotificationMessageType.L1_CREATED:
        ele.i18nKey = 'labelActiveL1successfulNote' //Active L1 Account successful
        ele.active = undefined
        break
      case sdk.NotificationMessageType.L2_CREATED:
        ele.i18nKey = 'labelActiveL2successfulNote' //Active L2 Account successful
        ele.active = () => {
          onReadClick(index, rest)
          history.push(`${RouterPath.l2assetsDetail}`)
        }
        break
      case 12: //sdk.NotificationMessageType.L1_CREATING:
        ele.i18nKey = 'labelActivatingL1AccountNote' //Active L2 Account successful
        ele.active = undefined
        break
      case sdk.NotificationMessageType.L1_RECEIVE:
        ele.i18nKey = 'labelL1ReceiveNote'
        ele.active = undefined
        break
      case sdk.NotificationMessageType.L1_SEND:
        ele.i18nKey = 'labelL1SendNote'
        ele.active = undefined
        break
      case sdk.NotificationMessageType.L2_RECEIVE:
        ele.i18nKey = 'labelL2ReceiveNote'
        ele.active = () => {
          onReadClick(index, rest)
          history.push(`${RouterPath.l2records}/${RecordTabIndex.Transactions}`)
        }
        break
      case sdk.NotificationMessageType.L2_SEND:
        ele.i18nKey = 'labelL2SendNote'
        ele.active = undefined
        ele.active = () => {
          onReadClick(index, rest)
          history.push(`${RouterPath.l2records}/${RecordTabIndex.Transactions}`)
        }
        break
      case sdk.NotificationMessageType.DEPOSIT:
        ele.i18nKey = 'labelL2DepositNote'
        ele.active = () => {
          onReadClick(index, rest)
          history.push(`${RouterPath.l2records}/${RecordTabIndex.Transactions}`)
        }
        break
      case sdk.NotificationMessageType.WITHDRAW:
        ele.i18nKey = 'labelL2WithdrawNote'
        ele.active = () => {
          onReadClick(index, rest)
          history.push(`${RouterPath.l2records}/${RecordTabIndex.Transactions}`)
        }
        break
      default:
        ele.i18nKey = 'labelNotificationLabel'
        ele.active = undefined
        break
    }

    return (
      <BoxStyle display={'flex'} justifyContent={'stretch'} paddingY={1} className={className}>
        <Box position={'relative'} marginRight={2}>
          {!ele.read ? (
            <IconButton size={size} onClick={() => onReadClick(index, ele)}>
              <MessageIcon htmlColor={'var(--color-text-secondary)'} />
            </IconButton>
          ) : (
            <MessageIcon fontSize={size} htmlColor={'var(--color-text-third)'} />
          )}
          {!ele.read && <Typography className={'point'} component={'i'} display={'block'} />}
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
              alignItmes={'center'}
              width={'100%'}
            >
              <span>{message}</span>
              <ConvertToIcon fontSize={'medium'} color={'inherit'} />
            </Link>
          ) : (
            <Typography variant={'body1'} color={'textPrimary'} marginTop={1} className={'message'}>
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
