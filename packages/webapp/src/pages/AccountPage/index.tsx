import { WithTranslation, withTranslation } from 'react-i18next';
import { Box, Modal } from '@material-ui/core';
import { ModalCloseButton, ModalContentStyled, ModalQRCode } from '@loopring-web/component-lib';
import React from 'react';
import { AccountInfo, AccountInfoProps } from '@loopring-web/component-lib';

export const ModalAccountInfo = withTranslation('common')(({
                                                               onClose,
                                                               open,
                                                               t,
                                                               ...rest
                                                           }: { open:boolean, onClose:(e:any)=>void} & AccountInfoProps & WithTranslation) => {


    return <Modal
        open={open}
        onClose={onClose}
        aria-labelledby="Account information"
        aria-describedby="show layer2 address, unlock/locked loopring wallet, copy address"
    >
        <ModalContentStyled style={{boxShadow: '24'}}>
            <Box paddingTop={3} paddingBottom={3} display={'flex'} flexDirection={'column'} minWidth='var(--modal-width)'>
                <ModalCloseButton onClose={onClose} {...{...rest, t}} />
                <AccountInfo {...rest}/>
            </Box>

        </ModalContentStyled>
    </Modal>
})