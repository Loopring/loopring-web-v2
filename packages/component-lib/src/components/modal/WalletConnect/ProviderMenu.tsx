import { Box, Checkbox, FormControlLabel as MuiFormControlLabel } from '@material-ui/core';
import { WithTranslation } from 'react-i18next';
import styled from '@emotion/styled';
import { ProviderMenuProps } from './Interface';
import { Grid, Typography } from '@material-ui/core/';
import { Button } from '../../basic-lib';
import { CheckBoxIcon, CheckedIcon, ConnectProviders, GatewayItem } from '@loopring-web/common-resources';
import React from 'react';


const ProviderBtnStyled = styled(Button)`
    // background-color: ${({theme}) => theme.colorBase.textPrimary};
  // width: var(--gateway-icon-size);
  // height: var(--gateway-icon-size);
  // border-radius: 50%;
  .MuiButton-label {
    display: flex;
    justify-content: space-between;
  }
  padding: 0 ${({theme}) => theme.unit*5/3}px;
  &.selected {
    position: relative;

    &:after {
      position: absolute;
      content: "\u25CF";
      color: ${({theme}) => theme.colorBase.success};
      width: 100%;
      display: flex;
      top: 0;
      padding-top: ${({theme}) => theme.unit / 2}px;
      justify-content: center;
      //align-items: center;
      font-size: ${({theme}) => theme.fontDefault.h5};
    }

  }
` as typeof Button;


const WalletConnectPanelStyled = styled(Box)`
  width: var(--transfer-modal-width);
` as typeof Box;

export const ProviderMenu = ({
                                 t,
                                 gatewayList,
                                 handleSelect,
                                 providerName = ConnectProviders.UnKnown,
                             }: ProviderMenuProps & WithTranslation) => {
    // const  !==  ConnectProviders.UnKnown
    return <WalletConnectPanelStyled display={'flex'} justifyContent={'space-between'} alignItems={'center'}
                                     flexDirection={'column'}>
        <Typography variant={'h3'} component='h3' className="modalTitle" marginBottom={3}>Connect Wallet</Typography>
        <Box>
            <MuiFormControlLabel
                control={<Checkbox defaultChecked checkedIcon={<CheckedIcon/>} icon={<CheckBoxIcon/>}
                                   color="default"/>} label="Label"/>
        </Box>

        <Grid container minWidth={120} display={'flex'} flexDirection={'column'} justifyContent={'space-evenly'}
              flex={1} alignItems={'stretch'} alignSelf={'stretch'}
              className="modalContent" marginTop={3} spacing={1}>

            <>   {gatewayList.map((item: GatewayItem) => (
                <Grid item xs={12}>
                    <ProviderBtnStyled variant={'contained'} size={'medium'} className={
                        providerName === item.key ? 'selected' : ''
                    } fullWidth
                                       endIcon={<img src={item.imgSrc} alt={item.key} height={18}/>}
                                       key={item.key}
                                       onClick={item.handleSelect ? item.handleSelect : (event: React.MouseEvent) => {
                                           if (handleSelect) {
                                               handleSelect(event, item.key);
                                           }
                                       }}>
                        {t(item.key)}
                    </ProviderBtnStyled>
                </Grid>
            ))}
            </>

        </Grid>
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
