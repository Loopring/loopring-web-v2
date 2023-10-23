import {
  AnimationArrow,
  Button,
  DropdownIconStyled,
  useSettings,
} from '@loopring-web/component-lib'
import { useTranslation } from 'react-i18next'
import { useRouteMatch } from 'react-router-dom'
import { HeaderMenuItemInterface, RouterPath, subMenuLayer2 } from '@loopring-web/common-resources'
import { Box, Grid } from '@mui/material'

export const TitleNFTMobile = () => {
  const { hideL2Action, setHideL2Action } = useSettings()
  const { t } = useTranslation(['common', 'layout'])
  let match: any = useRouteMatch('/nft/:item')
  const label = Reflect.ownKeys(subMenuLayer2)
    .reduce((pre, item) => [...pre, ...subMenuLayer2[item]], [] as HeaderMenuItemInterface[])
    .find((item) => RegExp(item?.router?.path ?? '').test(match?.url ?? ''))?.label?.i18nKey
  return (
    <Box display={'flex'} flexDirection={'column'} marginBottom={2}>
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
              variant={'outlined'}
              size={'medium'}
              color={'primary'}
              href={`/#/${RouterPath.nft}/mintNFT`}
            >
              {t('labelMintNFT')}
            </Button>
          </Grid>
          <Grid item xs={4}>
            <Button
              fullWidth
              variant={'outlined'}
              size={'medium'}
              color={'primary'}
              href={`/#/${RouterPath.nft}/depositNFT`}
            >
              {t('labelL1toL2NFT')}
            </Button>
          </Grid>
        </Grid>
      )}
    </Box>
  )
}
