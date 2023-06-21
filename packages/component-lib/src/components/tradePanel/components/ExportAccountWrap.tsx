import React from 'react'
import { WithTranslation } from 'react-i18next'
import { Box, Grid, TextareaAutosize, Typography } from '@mui/material'
import { Button } from '../../basic-lib'
import { ExportAccountExtendProps } from './Interface'
import styled from '@emotion/styled'
import { copyToClipBoard, NoPhotosIcon } from '@loopring-web/common-resources'
import { useSettings } from '../../../stores'

const TextareaAutosizeStyled = styled(TextareaAutosize)`
  width: 100%;
  padding: ${({ theme }: any) => theme.unit * 2}px;
  color: var(--color-text-secondary);
  background: var(--color-global-bg);
` as any

export const ExportAccountWrap = ({
  t,
  setExportAccountToastOpen,
  ...rest
}: ExportAccountExtendProps & WithTranslation) => {
  const [info, setInfo] = React.useState<any>()
  const {
    exportAccountProps: { accountInfo },
  } = rest
  const { isMobile } = useSettings()

  React.useEffect(() => {
    if (accountInfo) {
      try {
        const info = JSON.stringify(accountInfo, null, 4)
        setInfo(info)
      } finally {
      }
    }
  }, [accountInfo])

  return (
    <Grid
      container
      paddingLeft={5 / 2}
      paddingRight={5 / 2}
      direction={'column'}
      justifyContent={'space-between'}
      alignItems={'center'}
      flex={1}
      height={'100%'}
    >
      <Grid item>
        <Typography
          component={'h4'}
          textAlign={'center'}
          variant={isMobile ? 'h4' : 'h3'}
          whiteSpace={'pre'}
          marginBottom={2}
        >
          {t('labelExportAccount')}
        </Typography>

        <Typography
          variant={'body2'}
          textAlign={'center'}
          color={'var(--color-text-third)'}
          marginBottom={2}
        >
          <NoPhotosIcon style={{ fontSize: 42 }} htmlColor={'var(--color-text-third)'} />
          <Box>{t('labelExportAccountNoPhotos')}</Box>
        </Typography>
      </Grid>

      <Grid item alignSelf={'stretch'} marginBottom={1} position={'relative'}>
        <Typography component={'p'} variant='body1' color={'var(--color-text-third)'}>
          {t('labelExportAccountDescription')}
        </Typography>
      </Grid>

      <Grid item alignSelf={'stretch'} position={'relative'}>
        <TextareaAutosizeStyled disabled maxRows={15} defaultValue={info} />
      </Grid>

      <Grid item marginTop={2} alignSelf={'stretch'}>
        <Button
          fullWidth
          variant={'contained'}
          size={'medium'}
          color={'primary'}
          onClick={() => {
            copyToClipBoard(info)
            setExportAccountToastOpen(true)
          }}
        >
          {t(`labelExportAccountCopy`)}
        </Button>
      </Grid>
    </Grid>
  )
}
