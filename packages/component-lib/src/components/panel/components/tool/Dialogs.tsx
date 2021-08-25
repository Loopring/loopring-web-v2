import { Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, TextField } from '@material-ui/core';
// import React from 'react';
import { Trans, WithTranslation, withTranslation } from 'react-i18next';
import { Button } from '../../../basic-lib'
import React from 'react';
import { Typography } from '@material-ui/core/';
// const Transition = React.forwardRef(function Transition(props, ref) {
//     return <Slide direction="up" ref={ref} {...props} />;
// });
export const AlertImpact = withTranslation('common', {withRef: true})(({
                                                                           t,
                                                                           value,
                                                                           open,
                                                                           handleClose
                                                                       }: WithTranslation & {
    open: boolean,
    value: number,
    handleClose: (event: MouseEvent, isAgree?: boolean) => void
}) => {
    return <Dialog
        open={open}
        // TransitionComponent={Transition}
        keepMounted
        onClose={(e: MouseEvent) => handleClose(e)}
        aria-describedby="alert-dialog-slide-description"
    >
        <DialogTitle> {t('labelImpactTitle')}</DialogTitle>
        <DialogContent>
            <DialogContentText id="alert-dialog-slide-description">
                <Trans i18nKey={'labelImpactGreat'} tOptions={{value}}>
                    Your transaction amount will affect the pool price<Typography component={'span'} color={'var(--color-warning)'}>{value}%</Typography>. Are you sure to swap?
                </Trans>
            </DialogContentText>
        </DialogContent>
        <DialogActions>
            <Button onClick={(e) => handleClose(e as any)}> {t('labelDisAgreeConfirm')}</Button>
            <Button onClick={(e) => {
                handleClose(e as any, true)
            }}>{t('labelAgreeConfirm')}</Button>

        </DialogActions>
    </Dialog>
})
export const ConfirmImpact = withTranslation('common', {withRef: true})(({
                                                                             t,
                                                                             value,
                                                                             open,
                                                                             handleClose
                                                                         }: WithTranslation & {
    open: boolean,
    value: number,
    handleClose: (event: MouseEvent, isAgree?: boolean) => void
}) => {
    const [agree, setAgree] = React.useState('')

    React.useEffect(() => {
        if (!open) {
            setAgree('')
        }
    }, [open])

    return <Dialog
        open={open}
        // TransitionComponent={Transition}
        keepMounted
        onClose={(e: MouseEvent) => handleClose(e)}
        aria-describedby="alert-dialog-slide-description"
    >
        <DialogTitle> {t('labelImpactTitle')}</DialogTitle>
        <DialogContent>
            <DialogContentText id="alert-dialog-slide-description">
                <Trans i18nKey={'labelImpactGreat'} tOptions={{value}}>
                    Your transaction amount will affect the pool price<Typography component={'span'} color={'var(--color-warning)'}>{value}%</Typography>. Are you sure to swap?
                </Trans>
            </DialogContentText>
            <DialogContentText id="alert-dialog-slide-description">
                <Trans i18nKey={'labelImpactAgree'} tOptions={value}>
                    Please enter uppercase <Typography component={'span'} color={'textPrimary'}>\"AGREE\" </Typography>to confirm again.
                </Trans>
            </DialogContentText>
            <TextField
                autoFocus
                value={agree}
                onChange={(event) => {
                    setAgree(event.target.value)
                }}
                margin="dense"
                id="agree"
                // label="Agree"
                type="text"
                fullWidth
            />
        </DialogContent>
        <DialogActions>
            <Button onClick={(e) => handleClose(e as any)}> {t('labelDisAgreeConfirm')}</Button>
            <Button disabled={agree.trim() !== 'AGREE'} onClick={(e) => {
                handleClose(e as any, true)
            }}>{t('labelAgreeConfirm')}</Button>
        </DialogActions>
    </Dialog>
})