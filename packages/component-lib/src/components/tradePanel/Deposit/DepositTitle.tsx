import { Tab, Tabs, Typography } from '@mui/material'
import { Info2Icon, L1L2_NAME_DEFINED, MapChainId } from '@loopring-web/common-resources'
import React from 'react'
import { bindPopper, usePopupState } from 'material-ui-popup-state/hooks'
import { bindHover } from 'material-ui-popup-state'
import { Trans, useTranslation } from 'react-i18next'
import { PopoverPure } from '../../basic-lib'
import { DepositPanelType } from './Interface'
import { useSettings } from '../../../stores'

export const DepositTitle = ({ title, description, isHideDes = false }: any) => {
  const { t } = useTranslation()
  const { isMobile, defaultNetwork } = useSettings()
  const network = MapChainId[defaultNetwork] ?? MapChainId[1]

  const popupState = usePopupState({
    variant: 'popover',
    popupId: `popupId-deposit`,
  })
  return (
    <Typography display={'inline-flex'} alignItems={'center'}>
      <Typography
        component={'span'}
        variant={isMobile ? 'h4' : 'h3'}
        whiteSpace={'pre-line'}
        marginRight={1}
        className={'depositTitle'}
      >
        {title ? title : t('depositTitle')}
      </Typography>
      {!isHideDes && (
        <>
          <Info2Icon
            {...bindHover(popupState)}
            fontSize={isMobile ? 'medium' : 'large'}
            htmlColor={'var(--color-text-third)'}
          />
          <PopoverPure
            className={'arrow-center'}
            {...bindPopper(popupState)}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'center',
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'center',
            }}
          >
            <Typography padding={2} component={'p'} variant={'body2'} whiteSpace={'pre-line'}>
              <Trans
                i18nKey={description ? description : 'labelDepositDescription'}
                tOptions={{
                  l1ChainName: L1L2_NAME_DEFINED[network].l1ChainName,
                }}
              >
                Once your deposit is confirmed on Ethereum, it will be added to your balance within
                2 minutes.
              </Trans>
            </Typography>
          </PopoverPure>
        </>
      )}
    </Typography>
  )
}
const ThirdPartTitle = React.memo(() => {
  const { t } = useTranslation()
  const popupState = usePopupState({
    variant: 'popover',
    popupId: `popupId-ThirdPart`,
  })
  return (
    <>
      <Typography component={'span'} variant={'h5'} marginRight={1}>
        {t('labelVendor')}
      </Typography>
      <Info2Icon
        {...bindHover(popupState)}
        fontSize={'medium'}
        htmlColor={'var(--color-text-third)'}
      />
      <PopoverPure
        className={'arrow-center'}
        {...bindPopper(popupState)}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
      >
        <Typography padding={2} component={'p'} variant={'body2'} whiteSpace={'pre-line'}>
          <Trans i18nKey={'labelL1toL2Vendor'}>
            Make an order form third Loopring-parter, Once your order confirmed by Loopring, it will
            be added to your balance within 2 minutes.
          </Trans>
        </Typography>
      </PopoverPure>
    </>
  )
})

export const DepositTitleGroup = ({
  tabIndex,
  onTabChange,
  title,
  description,
}: {
  title?: string
  description?: string
  tabIndex: DepositPanelType
  onTabChange: (index: DepositPanelType) => void
  // (event: React.SyntheticEvent, value: DepositTabIndex) => void;
}) => {
  return (
    <>
      <Tabs variant={'fullWidth'} value={tabIndex} onChange={(_e, value) => onTabChange(value)}>
        <Tab
          value={DepositPanelType.Deposit}
          label={<DepositTitle title={title} description={description} />}
        />
        <Tab value={DepositPanelType.ThirdPart} label={<ThirdPartTitle />} />
      </Tabs>
    </>
  )
}

export const DepositTitleNewGroup = () => {
  return [
    <Typography component={'span'}>
      <DepositTitle />
    </Typography>,
    <Typography component={'span'}>
      <ThirdPartTitle />
    </Typography>,
  ]
}
