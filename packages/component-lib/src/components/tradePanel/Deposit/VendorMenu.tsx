import { Avatar, Box, Typography } from '@mui/material'
import { MenuBtnStyled } from '../../styled'
import { VendorMenuProps } from '../../modal/ModalPanels/Interface'
import { useTranslation } from 'react-i18next'
import {
  BanxaIcon,
  RampIcon,
  SCENARIO,
  TradeBtnStatus,
  TradeTypes,
  VendorProviders,
} from '@loopring-web/common-resources'
import { useTheme } from '@emotion/react'
import { useSettings } from '../../../stores'
import { TagIconList } from '../../block'

export const VendorIconItem = ({ svgIcon }: { svgIcon: string }) => {
  const theme = useTheme()
  switch (svgIcon) {
    case 'BanxaIcon':
      return (
        <BanxaIcon
          style={{
            height: '24px',
            width: '103px',
          }}
          fontColor={theme.colorBase.textPrimary}
        />
      )
    case 'RampIcon':
      return (
        <RampIcon
          style={{
            height: '24px',
            width: '114px',
          }}
          fontColor={theme.colorBase.textPrimary}
        />
      )
  }
}

export const VendorMenu = ({
  vendorList,
  banxaRef,
  // handleSelect,
  campaignTagConfig,
  type = TradeTypes.Buy,
  vendorForce,
}: VendorMenuProps) => {
  const { t } = useTranslation()
  const { isMobile } = useSettings()
  const theme = useTheme()
  return (
    <Box
      flex={1}
      display={'flex'}
      alignItems={'center'}
      justifyContent={'space-between'}
      flexDirection={'column'}
    >
      <Typography variant={isMobile ? 'h4' : 'h3'} whiteSpace={'pre'} component={'h4'}>
        {t('labelL1toL2ThirdPart', { type: t(`label${type}`) })}
      </Typography>
      <Box
        display={'flex'}
        flexDirection={'column'}
        justifyContent={'center'}
        flex={1}
        alignItems={'stretch'}
        alignSelf={'stretch'}
        className='modalContent'
        paddingX={3}
        paddingTop={1}
      >
        <Typography color={'textSecondary'} variant={'body1'} marginBottom={1}>
          {t('labelWhatProvider')}
        </Typography>
        {vendorList.map((item) => (
          <Box key={item.key} marginTop={1.5} width={'100%'}>
            <MenuBtnStyled
              variant={'outlined'}
              size={'large'}
              id={item.key + (type == TradeTypes.Buy ? '-on' : '-off')}
              ref={
                item.key === VendorProviders.Banxa && type === TradeTypes.Buy ? banxaRef : undefined
              }
              className={`${isMobile ? 'isMobile' : ''} ${
                vendorForce === item.key ? 'selected vendor' : 'vendor'
              }`}
              fullWidth
              style={{
                height:
                  item.flag && item.flag.startDate < Date.now() && Date.now() < item.flag.endDate
                    ? 56
                    : '',
                flexDirection: 'row',
              }}
              loading={
                item.btnStatus && item.btnStatus === TradeBtnStatus.LOADING ? 'true' : 'false'
              }
              disabled={
                item.btnStatus &&
                [TradeBtnStatus.LOADING, TradeBtnStatus.DISABLED].includes(item.btnStatus)
              }
              startIcon={VendorIconItem({ svgIcon: item.svgIcon })}
              onClick={(e) => {
                if (item.handleSelect) {
                  item.handleSelect(e)
                }
              }}
            >
              <Typography component={'span'} className={'vendorName'} height={0}>
                {t(item.key)}
              </Typography>
              {campaignTagConfig && (
                <TagIconList
                  scenario={SCENARIO.FIAT}
                  size={'var(--svg-size-large)'}
                  campaignTagConfig={campaignTagConfig}
                  symbol={`${item.key}-${type == TradeTypes.Buy ? 'on' : 'off'}`}
                />
              )}
              {type == TradeTypes.Sell && (
                <Avatar
                  alt={'BETA'}
                  style={{
                    width: 'auto',
                    // width: size ? size : "var(--svg-size-medium)",
                    height: 'var(--svg-size-medium)',
                    marginRight: theme.unit / 2,
                  }}
                  variant={'square'}
                  src={'https://static.loopring.io/assets/svg/beta.png'}
                />
              )}
              {/*{item.flag &&*/}
              {/*  item.flag.startDate < Date.now() &&*/}
              {/*  Date.now() < item.flag.endDate && (*/}
              {/*    <>*/}
              {/*      <Typography*/}
              {/*        component={"span"}*/}
              {/*        variant={"body2"}*/}
              {/*        color={"var(--color-warning)"}*/}
              {/*      >*/}
              {/*        {t(item.flag.highLight ?? "")}*/}
              {/*      </Typography>*/}
              {/*      /!*<Typography position={"absolute"} right={8} top={4}>*!/*/}
              {/*      /!*  {item.flag.tag}*!/*/}
              {/*      /!*</Typography>*!/*/}
              {/*    </>*/}
              {/*  )}*/}
            </MenuBtnStyled>
          </Box>
        ))}
      </Box>
    </Box>
  )
  {
    /*</WalletConnectPanelStyled>*/
  }
}
