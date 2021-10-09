//
import { WithTranslation, withTranslation } from 'react-i18next';
import {
    ModalCloseButton, ModalSettingFeeProps, useSettings, Button, useOpenModals
} from '../../../index';

// import { useTheme } from '@emotion/react';
// import { Box } from '@mui/material';

import { Box, Link, Modal, Typography } from '@mui/material';
import { SwitchPanelStyled } from '../../styled';
import { FeeChargeOrderDefault } from '@loopring-web/common-resources';
import React from 'react';

export const PanelStyled={}
export const ModalSettingFee = withTranslation('common', {withRef: true})((
    {
         t,
        open,
        onClose,
        style,
        ...rest
    }: ModalSettingFeeProps & WithTranslation) => {
    // const theme = useTheme();
    // const {w, h} = style ? style : {w: undefined, h: undefined};
    const {feeChargeOrder, setFeeChargeOrder}  = useSettings();
    const {setShowFeeSetting}  = useOpenModals();

    const [feeChargeValue,setFeeChargeValue] = React.useState<string[]>(feeChargeOrder);

    return <Modal
        open={open}
        onClose={onClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
    >
        <SwitchPanelStyled >
            <Box display={'flex'} width={"100%"} flexDirection={'column'}>
                <ModalCloseButton onClose={onClose} t={t}  {...rest}/>
                <Box flex={1} alignItems={'stretch'} display={'flex'} flexDirection={'column'}>
                    <Typography component={'h5'} variant={'h4'} textAlign={'center'}>
                        {t('LabelSettingChargeFeeOrder')}
                    </Typography>
                    <Typography component={'h5'} variant={'body1'} color={'text.secondary'}  textAlign={'center'}>
                        {t('LabelSettingChargeFeeOrder')}
                    </Typography>
                     <Box>
                         {FeeChargeOrderDefault}
                     </Box>
                    <Button fullWidth variant={'contained'} size={'medium'} color={'primary'} onClick={() => {
                        // copyToClipBoard(info)
                        // setExportAccountToastOpen(true)
                        setFeeChargeOrder(feeChargeValue)
                        setShowFeeSetting({isShow:false})
                    }}
                    >{t(`labelExportAccountCopy`)}
                    </Button>
                    <Typography color={'text.secondary'}>
                        <Link onClick={  ()=>{
                            setFeeChargeValue(FeeChargeOrderDefault);
                        } } >{t('labelReset')}</Link>
                        {/*<Button fullWidth variant={'text'} size={'medium'} color={'primary'} onClick={() => {*/}
                        {/*    // copyToClipBoard(info)*/}
                        {/*    // setExportAccountToastOpen(true)*/}
                        {/*    setFeeChargeOrder(feeChargeValue)*/}
                        {/*    setShowFeeSetting({isShow:false})*/}
                        {/*}}*/}
                        {/*>{t(`labelExportAccountCopy`)}*/}
                        {/*</Button>*/}
                    </Typography>

                </Box>
                {/*{onBack ? <ModalBackButton onBack={onBack}  {...rest}/> :<></>}*/}
            </Box>
        </SwitchPanelStyled>
    </Modal>;
})
