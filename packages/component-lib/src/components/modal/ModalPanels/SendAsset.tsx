import { Box, CardContent, Tooltip, Typography, Divider, Tab, Tabs } from '@mui/material'
import styled from '@emotion/styled'
import { MenuBtnStyled } from '../../styled'
import { SendAssetProps } from './Interface'
import { useTranslation } from 'react-i18next'
import {
  AnotherIcon,
  BackIcon,
  ExchangeAIcon,
  IncomingIcon,
  Info2Icon,
  L1L2_NAME_DEFINED,
  L1l2Icon,
  L2l2Icon,
  MapChainId,
  OutputIcon,
  AlertIcon,
  SendAssetList,
  hexToRGB,
  Contact,
  fontDefault,
} from '@loopring-web/common-resources'
import { useOpenModals, useSettings, useToggle } from '../../../stores'

import { Button, CoinIcon, TickCardStyleItem } from '../../basic-lib'
import React from 'react'
import { useTheme } from '@emotion/react'

const BoxStyled = styled(Box)`` as typeof Box

const IconItem = ({ svgIcon }: { svgIcon: string }) => {
  switch (svgIcon) {
    case 'IncomingIcon':
      return <IncomingIcon color={'inherit'} fontSize={'inherit'} sx={{ marginRight: 1 }} />
    case 'L2l2Icon':
      return <L2l2Icon color={'inherit'} fontSize={'inherit'} sx={{ marginRight: 1 }} />
    case 'L1l2Icon':
      return <L1l2Icon color={'inherit'} fontSize={'inherit'} sx={{ marginRight: 1 }} />
    case 'ExchangeAIcon':
      return <ExchangeAIcon color={'inherit'} fontSize={'inherit'} sx={{ marginRight: 1 }} />
    case 'OutputIcon':
      return <OutputIcon color={'inherit'} fontSize={'inherit'} sx={{ marginRight: 1 }} />
    case 'AnotherIcon':
      return <AnotherIcon color={'inherit'} fontSize={'inherit'} sx={{ marginRight: 1 }} />
  }
}
export const SendAsset = ({ sendAssetList, allowTrade, symbol, isToL1 }: SendAssetProps) => {
  const { t } = useTranslation('common')
  const { defaultNetwork, isMobile } = useSettings()
  const network = MapChainId[defaultNetwork] ?? MapChainId[1]
  const {
    toggle: { send },
  } = useToggle()

  return (
    <BoxStyled
      flex={1}
      display={'flex'}
      alignItems={'center'}
      justifyContent={'space-between'}
      flexDirection={'column'}
      width={'var(--modal-width)'}
    >
      <Box marginBottom={3} marginTop={-1} display={'flex'} alignItems={'center'}>
        <Typography
          component={'h3'}
          variant={isMobile ? 'h4' : 'h3'}
          whiteSpace={'pre'}
          marginRight={1}
        >
          {t('labelSendAssetTitle', {
            symbol,
            loopringL2: L1L2_NAME_DEFINED[network].loopringL2,
          })}
        </Typography>
        <Tooltip title={<>{t('labelSendAssetHowto')}</>}>
          <span>
            <Info2Icon fontSize={'large'} htmlColor={'var(--color-text-third)'} />
          </span>
        </Tooltip>
      </Box>
      <Box
        display={'flex'}
        flexDirection={'column'}
        justifyContent={'center'}
        flex={1}
        alignItems={'stretch'}
        alignSelf={'stretch'}
        className='modalContent'
        paddingX={isMobile ? 4 : 5}
        paddingBottom={4}
      >
        <Box flex={1} flexDirection={'column'}>
          {sendAssetList.reduce((prev, item) => {
            if (
              !symbol ||
              (item.key == 'SendAssetToAnotherNet' && send['orbiter']?.includes(symbol)) ||
              !['SendAssetToAnotherNet'].includes(item.key)
            ) {
              prev.push(
                <Box key={item.key} marginTop={2}>
                  <MenuBtnStyled
                    variant={'outlined'}
                    size={'large'}
                    className={`sendAsset  ${isMobile ? 'isMobile' : ''}`}
                    fullWidth
                    disabled={
                      !!(item.enableKey && allowTrade[item.enableKey]?.enable === false) ||
                      (/SendTo?(\w)+L1/gi.test(item.key) && isToL1)
                    }
                    endIcon={<BackIcon sx={{ transform: 'rotate(180deg)' }} />}
                    onClick={(e) => {
                      item.handleSelect(e)
                    }}
                  >
                    <Typography
                      component={'span'}
                      variant={'inherit'}
                      color={'inherit'}
                      display={'inline-flex'}
                      alignItems={'center'}
                      lineHeight={'1.2em'}
                      sx={{
                        textIndent: 0,
                        textAlign: 'left',
                      }}
                    >
                      <>{IconItem({ svgIcon: item.svgIcon })}</>
                      {t('label' + item.key, {
                        loopringL2: L1L2_NAME_DEFINED[network].loopringL2,
                        l2Symbol: L1L2_NAME_DEFINED[network].l2Symbol,
                        l1Symbol: L1L2_NAME_DEFINED[network].l1Symbol,
                        ethereumL1: L1L2_NAME_DEFINED[network].ethereumL1,
                      })}
                    </Typography>
                  </MenuBtnStyled>
                </Box>,
              )
            }
            return prev
          }, [] as JSX.Element[])}
        </Box>
      </Box>
    </BoxStyled>
  )
  {
    /*</WalletConnectPanelStyled>*/
  }
}

const BoxStyle = styled(Box)`
  & {
    height: inherit;

    .content-main {
      overflow: scroll;
      align-self: stretch;

      & > div {
        align-self: stretch;
      }
    }

    .MuiTab-root.sendType {
      padding: ${({ theme }) => 3 * theme.unit}px ${({ theme }) => 3 * theme.unit}px;

      &.Mui-selected,
      &:hover {
        padding: ${({ theme }) => 3 * theme.unit}px ${({ theme }) => 3 * theme.unit}px;
        box-sizing: border-box;
      }

      &:after {
        display: none;
      }
    }
  }
`

export const SendFromContact = ({
  // contacts,
  isENSWrong,
  ...contact
}: {
  isENSWrong
} & Contact) => {
  const [selected, setSelected] = React.useState(SendAssetList.SendAssetToOtherL1.key)
  const { defaultNetwork } = useSettings()
  const { setShowTransfer, setShowWithdraw, setShowEditContact } = useOpenModals()
  const network = MapChainId[defaultNetwork] ?? MapChainId[1]
  const theme = useTheme()

  const submit = React.useCallback(() => {
    // : Contact, network: 'SendToOtherL1'| 'SendTOL2', onClose: () => void
    switch (selected) {
      case SendAssetList.SendAssetToOtherL1.key:
        setShowWithdraw({
          isShow: true,
          address: contact.contactAddress,
          name: contact.contactName,
          addressType: contact.addressType,
          // symbol: 'ETH',
          // info: {
          //   onCloseCallBack: onClose,
          // },
        })
        break
      case SendAssetList.SendAssetToL2.key:
        setShowTransfer({
          isShow: true,
          address: contact.contactAddress,
          name: contact.contactName,
          addressType: contact.addressType,
          // symbol: 'ETH',
          // info: {
          //   onCloseCallBack: onClose,
          // },
        })
        break
    }
  }, [])
  const geUpdateContact = (_e) => {
    setShowEditContact({
      isShow: true,
      info: {
        ...contact,
        isENSWrong,
      },
    })
  }
  const { t } = useTranslation()
  return (
    <>
      <Box
        display={'flex'}
        flexDirection={'column'}
        alignItems={'flex-start'}
        alignSelf={'stretch'}
        marginTop={-4}
        justifyContent={'stretch'}
      >
        <Typography
          display={'flex'}
          flexDirection={'row'}
          component={'header'}
          alignItems={'center'}
          height={'var(--toolbar-row-height)'}
          paddingX={3}
        >
          <Typography component={'span'} display={'inline-flex'} color={'textPrimary'}>
            {t('labelContactsNetworkChoose', {
              loopringL2: L1L2_NAME_DEFINED[network].loopringL2,
              l2Symbol: L1L2_NAME_DEFINED[network].l2Symbol,
              l1Symbol: L1L2_NAME_DEFINED[network].l1Symbol,
              ethereumL1: L1L2_NAME_DEFINED[network].ethereumL1,
              loopringLayer2: L1L2_NAME_DEFINED[network].loopringLayer2,
            })}
          </Typography>
        </Typography>
        <Divider style={{ marginTop: '-1px', width: '100%' }} />
      </Box>
      <BoxStyle
        display={'flex'}
        alignItems={'stretch'}
        flexDirection={'column'}
        paddingBottom={4}
        width={'100%'}
      >
        <Box flex={1} display={'flex'} flexDirection={'column'} alignItems={'stretch'}>
          <Box
            display={'flex'}
            flexDirection={'column'}
            justifyContent={'stretch'}
            marginTop={2}
            paddingX={3}
          >
            <Typography
              variant={'body1'}
              component={'span'}
              color={'var(--color-text-secondary)'}
              marginBottom={1}
            >
              {t('labelSendToContact')}
            </Typography>
            <Box
              display={'flex'}
              flexDirection={'column'}
              alignItems={'stretch'}
              borderRadius={2}
              padding={1}
              bgcolor='var(--field-opacity)'
            >
              <Typography variant={'body1'} component={'span'} color={'var(--color-text-primary)'}>
                {contact?.contactName}
              </Typography>
              <Typography variant={'body1'} component={'span'} color={'var(--color-text-primary)'}>
                {contact?.contactAddress}
              </Typography>
              <Typography variant={'body1'} component={'span'} color={'var(--color-text-primary)'}>
                {contact?.ens}
              </Typography>
            </Box>
            {isENSWrong && (
              <Button
                variant={'contained'}
                sx={{
                  fontSize: fontDefault.body1,
                  marginTop: 2,
                  padding: 1,
                  color: 'var(--color-text-button)',
                  display: 'flex',
                  alignItems: 'center',
                  background: hexToRGB(theme.colorBase.warning, 0.2),
                  textAlign: 'left',
                  borderRadius: 2,
                  height: 'auto',
                  '&:hover': {
                    background: hexToRGB(theme.colorBase.warning, 0.3),
                  },
                }}
                onClick={geUpdateContact}
                endIcon={<BackIcon fontSize={'large'} sx={{ transform: 'rotate(180deg)' }} />}
              >
                <Typography component={'span'} color={'inherit'} display={'inline-flex'}>
                  <AlertIcon color={'warning'} sx={{ marginRight: 1 / 2, marginTop: '2px' }} />
                  {t('labelContactENSAlert')}
                </Typography>
              </Button>
            )}
          </Box>
          <Tabs
            variant={'fullWidth'}
            value={selected}
            onChange={(_event, value) => setSelected(value)}
            aria-label='l2-history-tabs'
            sx={{
              display: 'flex',
              flexWrap: 'nowrap',
            }}
          >
            <Tab
              className={'sendType'}
              value={SendAssetList.SendAssetToOtherL1.key}
              key={SendAssetList.SendAssetToOtherL1.key}
              label={
                <TickCardStyleItem
                  className={'btnCard'}
                  selected={selected == SendAssetList.SendAssetToOtherL1.key}
                >
                  <CardContent>
                    <Typography component={'span'} display={'inline-flex'}>
                      <CoinIcon size={32} symbol={L1L2_NAME_DEFINED[network].L1Token} />
                    </Typography>
                    <Typography paddingLeft={1} display={'flex'} flexDirection={'column'}>
                      {L1L2_NAME_DEFINED[network].l1ChainName +
                        '/' +
                        L1L2_NAME_DEFINED[network].l1Symbol}
                    </Typography>
                  </CardContent>
                </TickCardStyleItem>
              }
            />
            <Tab
              className={'sendType'}
              value={SendAssetList.SendAssetToL2.key}
              key={SendAssetList.SendAssetToL2.key}
              label={
                <TickCardStyleItem
                  selected={selected == SendAssetList.SendAssetToL2.key}
                  className={'btnCard'}
                >
                  <CardContent>
                    <Typography component={'span'} display={'inline-flex'}>
                      <CoinIcon size={32} symbol={L1L2_NAME_DEFINED[network].L2Token} />
                    </Typography>
                    <Typography paddingLeft={1} display={'flex'} flexDirection={'column'}>
                      {L1L2_NAME_DEFINED[network].loopringL2 +
                        '/' +
                        L1L2_NAME_DEFINED[network].l2Symbol}
                    </Typography>
                  </CardContent>
                </TickCardStyleItem>
              }
            />
          </Tabs>
        </Box>
        <Box
          width={'100%'}
          display={'flex'}
          flexDirection={'column'}
          alignItems={'center'}
          justifyContent={'flex-end'}
        >
          <Box alignSelf={'stretch'} paddingX={3}>
            <Button
              disabled={isENSWrong}
              onClick={submit}
              variant={'contained'}
              size={'medium'}
              fullWidth
            >
              {t(isENSWrong ? 'labelENSAddressMismatch' : 'labelContactsNext')}
            </Button>
          </Box>
        </Box>
      </BoxStyle>
    </>
  )
}
