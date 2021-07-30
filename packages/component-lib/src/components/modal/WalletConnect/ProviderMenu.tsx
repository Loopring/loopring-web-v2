import { Box, Checkbox } from '@material-ui/core';
import { WithTranslation } from 'react-i18next';
import styled from '@emotion/styled';
import { ProviderMenuProps } from './Interface';
import { Typography } from '@material-ui/core/';
import { CheckBoxIcon, CheckedIcon, GatewayItem } from '@loopring-web/common-resources';
import { FormControlLabel } from '../../basic-lib';
import React from 'react';


const IconWrapperStyled = styled(Box)`
    background-color: ${({theme}) => theme.colorBase.textPrimary};
    width: var(--gateway-icon-size);
    height: var(--gateway-icon-size);
    border-radius: 50%;
` as typeof Box;


const WalletConnectPanelStyled = styled(Box)`
  width: var(--transfer-modal-width);
` as typeof Box;

export const ProviderMenu = ({
                                       t, gatewayList,
                                       handleSelect,

                                   }: ProviderMenuProps & WithTranslation) => {
    return <WalletConnectPanelStyled display={'flex'} justifyContent={'space-between'} alignItems={'center'}
                                     flexDirection={'column'}>
        <Typography variant={'h3'} component='h3' className="modalTitle" marginBottom={3}>Connect Wallet</Typography>
        <FormControlLabel control={<Checkbox  checkedIcon={<CheckedIcon/>} icon={<CheckBoxIcon/>}
                                             color="default"/>} label="Label"/>
        <Box display={'flex'} justifyContent={'space-evenly'} flex={1} alignItems={'center'} alignSelf={'stretch'}
             className="modalContent" marginTop={3}>

            <>   {gatewayList.map((item: GatewayItem) => (
                <Box component={'a'} display={'flex'} flexDirection={'column'} justifyContent={''} alignItems={'center'}
                     minWidth={84}
                     key={item.key} onClick={item.handleSelect ? item.handleSelect : (event: React.MouseEvent) => {
                    if (handleSelect) {
                        handleSelect(event, item.key);
                    }
                }}>
                    <IconWrapperStyled display={'flex'} justifyContent={'center'} alignItems={'center'}>
                        <img src={item.imgSrc} alt={item.key}/>
                    </IconWrapperStyled>
                    <Typography variant={'body2'} component={'span'} marginTop={2}>{t(item.key)}</Typography>
                </Box>
            ))}
            </>

        </Box>
    </WalletConnectPanelStyled>
}

// export const ModalWalletConnect = withTranslation('swap', {withRef: true})((
//     {
//         t,
//         open,
//         onClose,
//         ...rest
//     }: ModalWalletConnectProps & WithTranslation) => {
//
//     return <Modal
//         open={open}
//         onClose={onClose}
//         aria-labelledby="modal-modal-title"
//         aria-describedby="modal-modal-description"
//     >
//         <ModalContentStyled style={{boxShadow: '24'}}>
//             <WalletConnectPanel {...{...rest, t}} />
//         </ModalContentStyled>
//     </Modal>
// })
