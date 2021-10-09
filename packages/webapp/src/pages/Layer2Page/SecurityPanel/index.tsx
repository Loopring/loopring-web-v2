import styled from '@emotion/styled';
import { Box, Button, Divider, Grid, Typography } from '@mui/material';
import React from 'react';
import { Trans, WithTranslation, withTranslation } from 'react-i18next';
import { useExportAccountInfo, useResetAccount } from './hook';
import { useOpenModals, useSettings } from '@loopring-web/component-lib';

const StyledPaper = styled(Grid)`
  width: 100%;
  height: 100%;
  background: var(--color-box);
  border-radius: ${({theme}) => theme.unit}px;
`

const StyledDivider = styled(Divider)`
  margin: ${({theme}) => theme.unit}px  ${({theme}) => theme.unit * 4}px;
`
// const DividerBlock = styled(Divider)`
//   margin: 0;
//   flex: 1;
//   width: 1px;
//   height: ${({theme}) => theme.unit * 3}px;
//   background: var(--color-divide)
// `

export const SecurityPanel = withTranslation(['common', 'layout'])(({t, i18n, ...rest}: & WithTranslation) => {

    const { resetKeypair, } = useResetAccount()
    const { setShowFeeSetting } = useOpenModals()
    const {exportAccInfo, exportAccount} = useExportAccountInfo()

    return <StyledPaper container className={'MuiPaper-elevation2'} marginBottom={2}>
        {/*<Typography variant={'h5'} component={'h3'} paddingLeft={2}>{t('labelTitleSecurity')}</Typography>*/}
        <Grid item xs={12} display={'flex'} flexDirection={'column'}  paddingY={1}>
            <Box component={'section'} display={'flex'} flexDirection={'column'}  paddingX={4} paddingY={3}>
                <Grid container display={'flex'}>
                    <Grid item xs={7}>
                        <Typography variant={'h4'} color={'text.primary'} component={'h4'}
                                    marginBottom={1}>{t('labelTitleResetL2Keypair')}</Typography>
                        <Typography variant={'body1'} color={'text.secondary'} component={'p'} marginTop={1}>
                            <Trans i18nKey="resetDescription">
                                Create a new signing key for layer-2 authentication (no backup needed). This will
                                <Typography component={'span'}>cancel all your pending orders</Typography>.
                            </Trans>
                        </Typography>
                    </Grid>
                    <Grid item xs={5} display={'flex'} justifyContent={'flex-start'} alignItems={'flex-end'} flexDirection={'column'}>
                        <Button variant={'outlined'} size={'medium'} color={'primary'} onClick={ () => {
                            resetKeypair()
                        }}
                                disabled={false}>{t('labelBtnReset')}</Button>
                        {/* <Typography variant={'body2'} color={'text.secondary'} component={'p'}
                                    paddingTop={1}>{t('labelHadChangPassword', {passDay: '14 hours'})}</Typography> */}
                    </Grid>
                </Grid>
                {/*<Grid container display={'flex'} flexDirection={'row'} justifyContent={'stretch'}*/}
                {/*      alignItems={'flex-start'} paddingX={4} >*/}
                {/*    <Grid item xs={12}>*/}
                {/*        <Typography variant={'h4'} color={'text.primary'} component={'h4'} paddingX={4}  marginBottom={1}>{t('labelTitleResetL2Keypair')}</Typography>*/}
                {/*    </Grid>*/}
                {/*    <Grid item xs={8} display={'flex'} flexDirection={'column'}>*/}
                {/*        <Typography variant={'body1'} color={'text.secondary'} component={'p'}>*/}
                {/*            <Trans i18nKey="resetDescription">*/}
                {/*                Create a new signing key for layer-2 authentication (no backup needed). This will*/}
                {/*                <Typography component={'span'}>cancel all your pending orders</Typography>.*/}
                {/*            </Trans>*/}
                {/*        </Typography>*/}
                {/*    </Grid>*/}
                {/*    <Grid item xs={4} display={'flex'} flexDirection={'column'} justifyContent={'space-evenly'}*/}
                {/*          alignItems={'flex-end'} alignSelf={'stretch'}>*/}
                {/*        <Button variant={'outlined'} size={'medium'} color={'primary'} disabled={false}>{t('labelBtnReset')}</Button>*/}
                {/*    </Grid>*/}
                {/*    <Grid item xs={12} display={'flex'} flexDirection={'row'} justifyContent={'flex-end'}*/}
                {/*          alignItems={'center'} alignSelf={'stretch'}>*/}
                {/*        <Typography variant={'body2'} color={'text.secondary'} component={'p'}*/}
                {/*                    paddingTop={1}>{t('labelHadChangPassword', {passDay: '14 hours'})}</Typography>*/}
                {/*    </Grid>*/}
                {/*</Grid>*/}
            </Box>
            <StyledDivider/>
            <Box component={'section'} display={'flex'} flexDirection={'column'}  paddingX={4} paddingY={3}>
                <Grid container display={'flex'}>
                    <Grid item xs={7}>
                        <Typography variant={'h4'} color={'text.primary'} component={'h4'}
                                    marginBottom={1}>{t('labelTitleExportAccount')}</Typography>
                        <Typography variant={'body1'} color={'text.secondary'} component={'p'} marginTop={1}>
                            {t('descriptionExportAccount')}</Typography>
                    </Grid>
                    <Grid item xs={5} display={'flex'} justifyContent={'flex-start'} alignItems={'flex-end'} flexDirection={'column'}>
                        <Button onClick={() => {
                            // exportAccInfo()
                            exportAccount()
                        }} variant={'outlined'} size={'medium'}
                                color={'primary'}
                                disabled={false}>{t('labelBtnExportAccount')}</Button>
                    </Grid>
                </Grid>
            </Box>
            <StyledDivider/>
            <Box component={'section'} display={'flex'} flexDirection={'column'}>
                <Typography variant={'h4'} color={'text.primary'} component={'h4'} paddingX={4}
                            marginY={1}>{t('labelSettingFee')}</Typography>

                <Grid container display={'flex'} flexDirection={'row'} justifyContent={'stretch'}
                      alignItems={'flex-start'} paddingX={4} marginBottom={2}>
                    <Grid item xs={7} display={'flex'} flexDirection={'column'}>
                        <Typography variant={'body1'} color={'text.secondary'}
                                    component={'p'}>{t('descriptionSettingFee')}</Typography>
                    </Grid>
                    <Grid item xs={5} display={'flex'} flexDirection={'column'} justifyContent={'space-evenly'}
                          alignItems={'flex-end'} alignSelf={'stretch'}>
                        <Grid item> <Button onClick={() => {
                            // exportAccInfo()
                            setShowFeeSetting({isShow:true})
                        }} variant={'outlined'} size={'medium'}
                                            color={'primary'} disabled={false}>{t('labelBtnEdit')}</Button></Grid>
                    </Grid>
                </Grid>
            </Box> 
        </Grid>
    </StyledPaper>
})
