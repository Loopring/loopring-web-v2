import { Box, CardContent, Divider, Tab, Tabs, Tooltip, Typography } from '@mui/material'
import styled from '@emotion/styled'
import { MenuBtnStyled } from '../../styled'
import { AccountStep, AddAssetItem, SendAssetProps } from './Interface'
import { useTranslation } from 'react-i18next'
import {
  AlertIcon,
  AnotherIcon,
  BackIcon,
  Contact,
  ExchangeAIcon,
  fontDefault,
  hexToRGB,
  IncomingIcon,
  Info2Icon,
  L1L2_NAME_DEFINED,
  L1l2Icon,
  L2l2Icon,
  MapChainId,
  OutputIcon,
  SagaStatus,
  SendAssetList,
} from '@loopring-web/common-resources'
import { useOpenModals, useSettings, useToggle } from '../../../stores'

import { Button, CoinIcon, TickCardStyleItem } from '../../basic-lib'
import React from 'react'
import { useTheme } from '@emotion/react'
import { store, useContacts } from '@loopring-web/core'

const BoxStyled = styled(Box)`` as typeof Box

const IconItem = ({ svgIcon }: { svgIcon: string }) => {
  switch (svgIcon) {
    case 'IncomingIcon':
      return <IncomingIcon className='custom-size'  color={'inherit'} fontSize={'inherit'} sx={{ marginRight: 1.5, fontSize: '20px' }} />
    case 'L2l2Icon':
      return <L2l2Icon className='custom-size'  color={'inherit'} fontSize={'inherit'} sx={{ marginRight: 1.5, fontSize: '20px' }} />
    case 'L1l2Icon':
      return <L1l2Icon className='custom-size'  color={'inherit'} fontSize={'inherit'} sx={{ marginRight: 1.5, fontSize: '20px' }} />
    case 'ExchangeAIcon':
      return <ExchangeAIcon className='custom-size'  color={'inherit'} fontSize={'inherit'} sx={{ marginRight: 1.5, fontSize: '20px' }} />
    case 'OutputIcon':
      return <OutputIcon className='custom-size'  color={'inherit'} fontSize={'inherit'} sx={{ marginRight: 1.5, fontSize: '20px' }} />
    case 'AnotherIcon':
      return <AnotherIcon className='custom-size'  color={'inherit'} fontSize={'inherit'} sx={{ marginRight: 1.5, fontSize: '20px' }} />
  }
}
export const SendAsset = ({
  sameLayerAssetList,
  crossChainAssetList,
  crossLayerAssetList,
  allowTrade,
  symbol,
  isToL1,
  toL1Title
}: SendAssetProps) => {
  const { t } = useTranslation('common')
  const { defaultNetwork, isMobile } = useSettings()
  const network = MapChainId[defaultNetwork] ?? MapChainId[1]
  const {
    toggle: { send },
  } = useToggle()

  const filterAndMap = (list: AddAssetItem[]) =>
    list
      .filter(
        (item) =>
          !symbol ||
          (item.key === 'SendAssetToAnotherNet' && send['orbiter']?.includes(symbol)) ||
          !['SendAssetToAnotherNet'].includes(item.key),
      )
      .map((item, index) => (
        <Box key={item.key} marginTop={'-1px'}>
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
            sx={{
              overflow: 'hidden',
              '& .corner-tag': {
                background: '#B8BCC7',
              },
              '& .title, .description': {
                color: 'var(--color-text-secondary)',
              },
              ':hover': {
                '& .corner-tag': {
                  background: 'var(--color-primary)',
                },
                '& .title, .description': {
                  color: 'var(--color-text-primary)',
                }
              },
              borderTopLeftRadius: index === 0 ? '4px' : '0px',
              borderTopRightRadius: index === 0 ? '4px' : '0px',
              borderBottomLeftRadius: index === list.length - 1 ? '4px' : '0px',
              borderBottomRightRadius: index === list.length - 1 ? '4px' : '0px',
              '&&&&:hover' : {
                borderColor: 'var(--color-border)'
              },
              height: isMobile ? '48px' : '64px',
              
           }}
          >
            <Box display={'flex'} alignItems={'center'}>
              <Typography
                component={'span'}
                variant={'inherit'}
                color={'inherit'}
                display={'flex'}
                alignItems={'center'}
                lineHeight={'1.2em'}
                sx={{
                  textIndent: 0,
                  textAlign: 'left',
                }}
              >
                {IconItem({ svgIcon: item.svgIcon })}
              </Typography>
              <Box>
                <Typography
                  sx={{ textIndent: 0 }}
                  textAlign={'left'}
                  color={'var(--color-text-secondary)'}
                  className='title'
                  fontSize={
                    isMobile 
                    ? item.description ? '12px' : '14px'
                    : item.description ? '14px' : '16px'}
                >
                  {t('label' + item.key, {
                    loopringL2: L1L2_NAME_DEFINED[network].loopringL2,
                    l2Symbol: L1L2_NAME_DEFINED[network].l2Symbol,
                    l1Symbol: L1L2_NAME_DEFINED[network].l1Symbol,
                    ethereumL1: L1L2_NAME_DEFINED[network].ethereumL1,
                  })}
                </Typography>
                {item.description && (
                  <Typography
                    textAlign={'left'}
                    sx={{ textWrap: 'auto', textIndent: 0 }}
                    variant='body2'
                    color={'var(--color-text-primary)'}
                    mt={0.5}
                    className='description'
                    fontSize={isMobile ? '11px' : '12px'}
                  >
                    {item.description}
                  </Typography>
                )}
              </Box>
            </Box>
          </MenuBtnStyled>
        </Box>
      ))

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
          <Box mb={5} mt={4}>
            {filterAndMap(sameLayerAssetList)}
          </Box>
          <Box mb={5}>
            <Typography mb={2} color={'var(--color-text-secondary)'} variant='body2'>{toL1Title}</Typography>
            {filterAndMap(crossLayerAssetList)}
          </Box>
          <Box >
            {filterAndMap(crossChainAssetList).length > 0 && <Typography mb={2} color={'var(--color-text-secondary)'} variant='body2'>To other networks</Typography>} 
            {filterAndMap(crossChainAssetList)}
          </Box>
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

export const SendFromContact = (
  props: {
    isENSWrong: boolean,
    selected: string
  } & Contact,
) => {
  const [selected, setSelected] = React.useState(SendAssetList.SendAssetToOtherL1.key)
  const { defaultNetwork } = useSettings()
  const { setShowTransfer, setShowWithdraw, setShowEditContact, setShowAccount } = useOpenModals()
  const { status: contactStatus } = useContacts()
  const [contact, setContact] = React.useState({
    ...props,
  })

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
        })
        setShowAccount({ isShow: false })
        break
      case SendAssetList.SendAssetToL2.key:
        setShowTransfer({
          isShow: true,
          address: contact.contactAddress,
          name: contact.contactName,
          addressType: contact.addressType,
        })
        setShowAccount({ isShow: false })
        break
    }
  }, [selected, contact])
  const geUpdateContact = (_e) => {
    setShowEditContact({
      isShow: true,
      info: {
        ...contact,
        from: AccountStep.SendAssetFromContact,
      },
    })
    setShowAccount({ isShow: false })
  }
  const { t } = useTranslation()
  React.useEffect(() => {
    if (contactStatus == SagaStatus.UNSET && contact.isENSWrong) {
      const { contacts } = store.getState().contacts
      setContact((state) => {
        const _contact = contacts?.find(
          (contact) =>
            contact.contactAddress?.toLowerCase() === state?.contactAddress?.toLowerCase(),
        )
        if (contact.isENSWrong && !_contact?.ens) {
          return {
            ...state,
            isENSWrong: false,
          }
        }
        return state
      })
    }
  }, [contactStatus])
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
            {contact.isENSWrong && (
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
              disabled={contact.isENSWrong}
              onClick={submit}
              variant={'contained'}
              size={'medium'}
              fullWidth
            >
              {t(contact.isENSWrong ? 'labelENSAddressMismatch' : 'labelContactsNext')}
            </Button>
          </Box>
        </Box>
      </BoxStyle>
    </>
  )
}
