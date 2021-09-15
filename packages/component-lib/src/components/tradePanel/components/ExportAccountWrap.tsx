import React from 'react'
import { WithTranslation } from 'react-i18next';
import { Grid, Typography, TextareaAutosize } from '@mui/material';
import { Button } from '../../basic-lib';
import { ExportAccountExtendProps } from './Interface';
import styled from '@emotion/styled'

const TextareaAutosizeStyled = styled(TextareaAutosize)`
    width: 100%;
    color: var(--color-text-secondary);
    background: var(--color-global-bg);
` as any

export const ExportAccountWrap = ({
           t,
           ...rest
       }: ExportAccountExtendProps & WithTranslation) => {
    const [accountInfo, setAccountInfo] = React.useState<any>()
    const { exportAccountProps } = rest

    React.useEffect(() => {
        if (exportAccountProps) {
            try{
                const info = JSON.stringify(exportAccountProps, null, 4)
                setAccountInfo(info)
            }
            finally{

            }
        }
    }, [exportAccountProps])

    return <Grid className={''} paddingLeft={5 / 2} paddingRight={5 / 2} container
                 direction={"column"}
                 justifyContent={'space-between'} alignItems={"center"} flex={1} height={'100%'}>
        <Grid item>
            <Typography component={'h4'} textAlign={'center'} variant={'h3'} marginBottom={2}>
                {t('labelExportAccount')}
            </Typography>
            <Typography variant={'body2'} textAlign={'center'} color={'var(--color-text-third)'} marginBottom={2}>
                {t('labelExportAccountNoPhotos')}
            </Typography>
        </Grid>

        <Grid item alignSelf={"stretch"} position={'relative'}>
            <Typography component={'p'} variant="body1" color={'var(--color-text-third)'}>
                {t('labelExportAccountDescription')}
            </Typography>
        </Grid>

        <Grid item alignSelf={"stretch"} position={'relative'}>
            <TextareaAutosizeStyled
                disabled
                defaultValue={accountInfo}
            ></TextareaAutosizeStyled>
        </Grid>

        <Grid item marginTop={2} alignSelf={'stretch'}>
            <Button fullWidth variant={'contained'} size={'medium'} color={'primary'} onClick={() => {
                // if (onResetClick) {
                //     onResetClick()
                // }
            }}
            >{t(`labelExportAccountCopy`)}
            </Button>
        </Grid>
    </Grid>
}
