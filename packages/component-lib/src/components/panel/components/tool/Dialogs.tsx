import { Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, TextField } from '@material-ui/core';
// import React from 'react';
import { Trans, WithTranslation, withTranslation } from 'react-i18next';
import {Button} from '../../../basic-lib'
import React from 'react';
// const Transition = React.forwardRef(function Transition(props, ref) {
//     return <Slide direction="up" ref={ref} {...props} />;
// });
export const AlertImpact = withTranslation('common', {withRef: true})(({  t,
                                                                           open,
                                                                           handleClose}: WithTranslation &{
    open: boolean,
    handleClose: (event: MouseEvent, isAgree?: boolean) => void
}) => {
    return <Dialog
        open={open}
        // TransitionComponent={Transition}
        keepMounted
        onClose={(e:MouseEvent)=>handleClose(e)}
        aria-describedby="alert-dialog-slide-description"
    >
        <DialogTitle> {t('labelImpactTitle')}</DialogTitle>
        <DialogContent>
            <DialogContentText id="alert-dialog-slide-description">
                <Trans i18nKey={'labelImpactGreat'}>
                     xxxxxxx
                </Trans>
            </DialogContentText>
        </DialogContent>
        <DialogActions>
            <Button onClick={(e)=>handleClose(e as any)}> {t('labelDisagree')}</Button>
            <Button onClick={(e) => {
                handleClose(e as any, true)
            }}>{t('labelAgree')}</Button>

        </DialogActions>
    </Dialog>
 })
 export const ConfirmImpact = withTranslation('common', {withRef: true})(({ t,
                                                                             open,
                                                                             handleClose}: WithTranslation &{
     open: boolean,
     handleClose: (event: MouseEvent, isAgree?: boolean) => void
 })=> {
     const [value,setValue] = React.useState('')

     return  <Dialog
                open={open}
                // TransitionComponent={Transition}
                keepMounted
                onClose={(e:MouseEvent)=>handleClose(e)}
                aria-describedby="alert-dialog-slide-description"
                >
     <DialogTitle> {t('labelImpactTitle')}</DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-slide-description">
                        <Trans i18nKey={'labelImpactPirceisuge'}>
                            xxxxxxx   type Agree, capture 
                        </Trans>
                    </DialogContentText>
                    <TextField
                        autoFocus
                        value={value}
                        onChange={(event)=>{setValue(event.target.value)}}
                        margin="dense"
                        id="agree"
                        label="Agree"
                        type="text"
                        fullWidth
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={(e)=>handleClose(e as any)}> {t('labelDisagree')}</Button>
                    <Button disabled={value.trim() !== 'Agree'} onClick={(e) => {
                        handleClose(e as any, true)
                    }}>{t('labelAgree')}</Button>
                </DialogActions>
                </Dialog>
 })