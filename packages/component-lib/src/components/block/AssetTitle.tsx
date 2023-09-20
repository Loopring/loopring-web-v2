import { Box, Grid, IconButton, Typography } from '@mui/material'
import {
  getValuePrecisionThousand,
  HeaderMenuItemInterface,
  HiddenTag,
  HideIcon,
  L1L2_NAME_DEFINED,
  MapChainId,
  subMenuLayer2,
  TradeBtnStatus,
  ViewIcon,
} from '@loopring-web/common-resources'
import { useTranslation, withTranslation, WithTranslation } from 'react-i18next'
import { AssetTitleMobileProps, AssetTitleProps } from './Interface'
import styled from '@emotion/styled'
import { DropdownIconStyled } from '../tradePanel'
import { AnimationArrow, Button, ButtonListRightStyled } from './../'
import { useHistory, useRouteMatch } from 'react-router-dom'
import { useSettings } from '../../stores'

const BoxStyled = styled(Box)`
  color: var(--color-text-secondary);

  .MuiButtonBase-root {
    color: var(--color-text-secondary);
  }
` as typeof Box

export const AssetTitle = withTranslation('common')(
  ({
    t,
    assetInfo,
    accountId,
    onShowSend,
    onShowReceive,
    hideL2Assets,
    setHideL2Assets,
    assetBtnStatus,
  }: AssetTitleProps & WithTranslation) => {
    const history = useHistory()
    const { defaultNetwork } = useSettings()
    const network = MapChainId[defaultNetwork] ?? MapChainId[1]
    return (
      <Grid container spacing={2} justifyContent={'space-between'} alignItems={'flex-start'}>
        <Grid item xs={7} display={'flex'} flexDirection={'column'}>
          <BoxStyled
            component={'span'}
            display={'flex'}
            alignItems={'center'}
            justifyContent={'flex-start'}
            marginBottom={'16px'}
          >
            <Typography
              component={'span'}
              variant={'body1'}
              paddingRight={3}
              color={'textSecondary'}
            >
              {t('labelAssetTitle', {
                loopringL2: L1L2_NAME_DEFINED[network].loopringL2,
              })}
              {` (UID: ${accountId})`}
              <IconButton
                size={'small'}
                // color={'secondary'}
                onClick={() => setHideL2Assets(!hideL2Assets)}
                aria-label={t('labelShowAccountInfo')}
              >
                {!hideL2Assets ? <ViewIcon /> : <HideIcon />}
              </IconButton>
            </Typography>
          </BoxStyled>

          <Typography
            component={'span'}
            display={'flex'}
            alignItems={'center'}
            justifyContent={'flex-start'}
            marginTop={1}
          >
            <Typography component={'span'} variant={'h1'}>
              {!hideL2Assets && assetInfo.priceTag}
            </Typography>
            {!hideL2Assets ? (
              <Typography component={'span'} variant={'h1'}>
                {assetInfo.totalAsset
                  ? getValuePrecisionThousand(assetInfo.totalAsset, 2, 2, 2, true, { floor: true })
                  : '0.00'}
              </Typography>
            ) : (
              <Typography component={'span'} variant={'h1'}>
                {HiddenTag}
              </Typography>
            )}
          </Typography>
        </Grid>
        <ButtonListRightStyled
          item
          xs={5}
          display={'flex'}
          flexDirection={'row'}
          justifyContent={'flex-end'}
        >
          <Button
            variant={'contained'}
            size={'small'}
            color={'primary'}
            disabled={assetBtnStatus === TradeBtnStatus.LOADING}
            onClick={() => onShowSend()}
          >
            {t('labelSendAssetBtn')}
          </Button>
          <Button
            variant={'outlined'}
            size={'medium'}
            color={'secondary'}
            disabled={assetBtnStatus === TradeBtnStatus.LOADING}
            onClick={() => onShowReceive()}
          >
            {t('labelAddAssetBtn')}
          </Button>
          <Button
            variant={'outlined'}
            size={'medium'}
            color={'secondary'}
            onClick={() => history.push('/l2assets/history')}
          >
            {t('labelTransactions')}
          </Button>
        </ButtonListRightStyled>
      </Grid>
    )
  },
)

export const AssetTitleMobile = ({
  assetInfo,
  accountId,
  onShowSend,
  onShowReceive,
  hideL2Assets,
  setHideL2Assets,
}: AssetTitleMobileProps) => {
  const { hideL2Action, setHideL2Action, defaultNetwork } = useSettings()
  const network = MapChainId[defaultNetwork] ?? MapChainId[1]
  const { t } = useTranslation(['common', 'layout'])
  let match: any = useRouteMatch('/l2assets/:item')
  const history = useHistory()
  const label = Reflect.ownKeys(subMenuLayer2)
    .reduce((pre, item) => [...pre, ...subMenuLayer2[item]], [] as HeaderMenuItemInterface[])
    .find((item) => RegExp(item?.router?.path ?? '').test(match?.url ?? ''))?.label?.i18nKey
  return (
    <Box display={'flex'} flexDirection={'column'} marginBottom={2}>
      <Box
        display={'flex'}
        flexDirection={'column'}
        justifyContent={'space-between'}
        position={'relative'}
        alignItems={'flex-end'}
      >
        <Typography component={'h3'} variant={'h4'} position={'absolute'} left={2} top={2}>
          {t(label ?? 'labelAssets', {
            ns: 'layout',
            loopringL2: L1L2_NAME_DEFINED[network].loopringL2,
            l2Symbol: L1L2_NAME_DEFINED[network].l2Symbol,
          })}
        </Typography>
        <Typography
          component={'span'}
          variant={'body1'}
          display={'inline-flex'}
          alignItems={'center'}
          marginBottom={1}
        >
          {t('labelAssetMobileTitle', {
            loopringL2: L1L2_NAME_DEFINED[network].loopringL2,
            l2Symbol: L1L2_NAME_DEFINED[network].l2Symbol,
            l1Symbol: L1L2_NAME_DEFINED[network].l1Symbol,
            ethereumL1: L1L2_NAME_DEFINED[network].ethereumL1,
          })}
          {` (UID: ${accountId})`}
          <IconButton
            size={'small'}
            // color={'secondary'}
            onClick={() => setHideL2Assets(!hideL2Assets)}
            aria-label={t('labelShowAccountInfo')}
          >
            {!hideL2Assets ? <ViewIcon fontSize={'large'} /> : <HideIcon fontSize={'large'} />}
          </IconButton>
        </Typography>
        <Typography
          component={'span'}
          display={'flex'}
          alignItems={'center'}
          justifyContent={'flex-start'}
          marginTop={1}
        >
          <Typography component={'span'} paddingRight={1} variant={'h3'}>
            {assetInfo.priceTag}
          </Typography>
          {!hideL2Assets ? (
            <Typography component={'span'} variant={'h3'}>
              {assetInfo.totalAsset
                ? getValuePrecisionThousand(assetInfo.totalAsset, 2, 2, 2, true, { floor: true })
                : '0.00'}
            </Typography>
          ) : (
            <Typography component={'span'} variant={'h3'}>
              &#10033;&#10033;&#10033;&#10033;.&#10033;&#10033;
            </Typography>
          )}
        </Typography>
      </Box>
      <Box
        component={'span'}
        display={'flex'}
        alignItems={'center'}
        style={{ cursor: 'pointer' }}
        justifyContent={'center'}
        onClick={() => setHideL2Action(!hideL2Action)}
        marginBottom={1}
      >
        {!hideL2Action ? (
          <DropdownIconStyled status={hideL2Action ? 'down' : 'up'} fontSize={'medium'} />
        ) : (
          <AnimationArrow className={'arrowCta'} />
        )}
      </Box>
      {!hideL2Action && (
        <Grid container spacing={2}>
          <Grid item xs={4}>
            <Button
              fullWidth
              variant={'contained'}
              size={'small'}
              color={'primary'}
              onClick={() => onShowSend()}
            >
              {t('labelSendAssetBtn')}
            </Button>
          </Grid>
          <Grid item xs={4}>
            <Button
              fullWidth
              variant={'contained'}
              size={'small'}
              color={'primary'}
              onClick={() => onShowReceive()}
            >
              {t('labelAddAssetBtn')}
            </Button>
          </Grid>
          <Grid item xs={4}>
            <Button
              fullWidth
              variant={'outlined'}
              size={'medium'}
              color={'secondary'}
              onClick={() => history.push('/l2assets/history')}
            >
              {t('labelTransactions')}
            </Button>
          </Grid>
          {/*<Grid item xs={4}>*/}
          {/*  <Button*/}
          {/*    fullWidth*/}
          {/*    variant={"outlined"}*/}
          {/*    size={"medium"}*/}
          {/*    color={"primary"}*/}
          {/*    onClick={() => onShowTransfer()}*/}
          {/*  >*/}
          {/*    {t("labelL2toL2")}*/}
          {/*  </Button>*/}
          {/*</Grid>*/}
          {/*<Grid item xs={4}>*/}
          {/*  <Button*/}
          {/*    fullWidth*/}
          {/*    variant={"outlined"}*/}
          {/*    size={"medium"}*/}
          {/*    color={"primary"}*/}
          {/*    onClick={() => onShowWithdraw()}*/}
          {/*  >*/}
          {/*    {t("labelL2toL1")}*/}
          {/*  </Button>*/}
          {/*</Grid>*/}
        </Grid>
      )}
    </Box>
  )
}
