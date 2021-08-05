import { Box, Checkbox, FormControlLabel as MuiFormControlLabel } from '@material-ui/core';
import { Trans, WithTranslation } from 'react-i18next';
import styled from '@emotion/styled';
import { ProviderMenuProps } from './Interface';
import { Grid, Link, Typography } from '@material-ui/core/';
import { Button } from '../../basic-lib';
import { CheckBoxIcon, CheckedIcon, ConnectProviders, GatewayItem } from '@loopring-web/common-resources';
import React from 'react';


const ProviderBtnStyled = styled(Button)`
  background-color: ${({theme}) => theme.colorBase.background().field};

  &:hover {                                    <Typography variant={'body2'} color={'textSecondary'}
    background-color: ${({theme}) => theme.colorBase.background().hover};
  }

  // width: var(--gateway-icon-size);
  // height: var(--gateway-icon-size);
  // border-radius: 50%;
  .MuiButton-label {
    display: flex;
    text-indent: 1em;
    justify-content: space-between;
    align-items: center;
  }

  padding: 0 ${({theme}) => theme.unit * 5 / 3}px;

  &.selected {
    position: relative;

    &:after {
      position: absolute;
      content: "\u25CF";
      color: ${({theme}) => theme.colorBase.success};
      //width: 100%;
      display: flex;
      left: 0;
      padding-left: ${({theme}) => theme.unit * 2}px;
      //justify-content: ;
      align-items: center;
      font-size: ${({theme}) => theme.fontDefault.h5};
    }

  }
` as typeof Button;
//${({theme}) => theme.border.defaultFrame({c_key: 'blur', d_R: 1 / 2, d_W:1})};

const BoxStyle = styled(Box)`
  ${({theme}) => theme.border.defaultFrame({c_key: 'blur', d_R: 1 / 2, d_W:0})};
  background-color: ${({theme}) => theme.colorBase.background().fieldOpacity};

  padding: 0 ${({theme}) => theme.unit * 5 / 3}px;
  .MuiFormControlLabel-root{
    font-size: ${({theme}) => theme.fontDefault.h6};
    align-items: flex-start;
    .MuiTypography-root{
      padding: ${({theme}) => theme.unit}px 0;
    }
  }
  
` as typeof Box;
const WalletConnectPanelStyled = styled(Box)`
  //width: var(--transfer-modal-width);
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
        <Typography component={'h3'} variant={'h2'} marginBottom={3}>{t('labelConnectWallet')}</Typography>
        <BoxStyle  maxWidth={'var(--account-modal-box-width)'}  display={'flex'} flexDirection={'row'} alignItems={'flex-start'}>
            <MuiFormControlLabel  
                control={<Checkbox defaultChecked checkedIcon={<CheckedIcon/>} icon={<CheckBoxIcon/>}
                                   color="default"/>} label={<Trans i18nKey="labelAgree">I have read, understand, and agree to the <Link component={'a'} href={'./'} target={'_parent'}>Terms of Service</Link>.</Trans>}/>
        </BoxStyle>

        <Grid container maxWidth={'var(--account-modal-box-width)'} display={'flex'} flexDirection={'column'} justifyContent={'space-evenly'}
              flex={1} alignItems={'stretch'}
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
