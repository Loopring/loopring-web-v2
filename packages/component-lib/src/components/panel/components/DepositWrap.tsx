import { CloseIcon, globalSetup, IBData } from '@loopring-web/common-resources';
import { TradeBtnStatus } from '../Interface';
import { Trans, WithTranslation } from 'react-i18next';
import React, { ChangeEvent } from 'react';
import { Grid, Typography } from '@material-ui/core';
import { Button, IconClearStyled, TextField, TypographyGood } from '../../../index';
import { DepositViewProps } from './Interface';
import { BasicACoinTrade } from './BasicACoinTrade';
import * as _ from 'lodash'


//SelectReceiveCoin
export const DepositWrap = <T extends IBData<I>,
    I>({
           t, disabled, walletMap, tradeData, coinMap,
           //  onTransferClick,
           title, description,
           depositBtnStatus,
           onDepositClick,
           isNewAccount,
           handleError,
           addressDefault,
           handleOnAddressChange,
           handleAddressError,
           wait = globalSetup.wait,
           ...rest
       }: DepositViewProps<T, I> & WithTranslation) => {
    const inputBtnRef = React.useRef();
    const getDisabled = () => {
        if (disabled || tradeData === undefined || walletMap === undefined || coinMap === undefined) {
            return true
        } else {
            return false
        }
    };
    const [address, setAddress] = React.useState<string | undefined>(addressDefault ? addressDefault : '');
    const [addressError, setAddressError] = React.useState<{ error: boolean, message?: string | React.ElementType<HTMLElement> } | undefined>();
    // const [error, setError] = React.useState<{ error: boolean, message?: string | React.ElementType }>({
    //     error: false,
    //     message: ''
    // });
    const debounceAddress = React.useCallback(_.debounce(({address}: any) => {
        if (handleOnAddressChange) {
            handleOnAddressChange(address)
        }
    }, wait), [])
    const handleClear = React.useCallback(() => {
        // @ts-ignore
        // addressInput?.current?.value = "";
        setAddress('')
    }, [])
    const _handleOnAddressChange = (event:ChangeEvent<HTMLInputElement>) => {
        const address = event.target.value;
        if (handleAddressError) {
            const error = handleAddressError(address)
            if (error?.error) {
                setAddressError(error)
            }
        }
        setAddress(address);
        debounceAddress({address})
    }
    const inputButtonDefaultProps = {
        label: t('depositLabelEnterToken'),
    }
    return <Grid className={walletMap ? '' : 'loading'} paddingLeft={5 / 2} paddingRight={5 / 2} container
                 direction={"column"}
                 justifyContent={'space-between'} alignItems={"center"} flex={1} height={'100%'}>
        <Grid item>
            <Typography component={'h4'} textAlign={'center'} variant={'h3'} marginBottom={2}>
                {title ? title : t('depositTitle')}
            </Typography>
            <Typography component={'p'} variant="body1">
                <Trans i18nKey={description ? description : 'depositDescription'}>
                    Once your deposit is <TypographyGood component={'span'}>confirmed on Ethereum</TypographyGood>, it
                    will be added to your balance within <TypographyGood component={'span'}>2 minutes</TypographyGood>.
                </Trans>
            </Typography>
        </Grid>
        <Grid item marginTop={2} alignSelf={"stretch"}>
            <BasicACoinTrade {...{
                ...rest,
                t,
                disabled,
                walletMap,
                tradeData,
                coinMap,
                inputButtonDefaultProps,
                inputBtnRef: inputBtnRef,
            }} />
        </Grid>
        {isNewAccount ? <Grid item marginTop={2} alignSelf={"stretch"} position={'relative'}>
            <TextField
                value={address}
                error={addressError && addressError.error ? true : false}
                label={t('depositLabelRefer')}
                placeholder={t('depositLabelPlaceholder')}
                onChange={_handleOnAddressChange}
                // SelectProps={{IconComponent: DropDownIcon}}
                // required={true}
                // inputRef={addressInput}
                helperText={<Typography
                    variant={'body2'}
                    component={'span'}>{addressError && addressError.error ? addressError.message : ''}</Typography>}
                fullWidth={true}
            />
            {address !== '' ?
                <IconClearStyled size={'small'} style={{top: '30px'}} aria-label="Clear" onClick={handleClear}>
                    <CloseIcon  color={'inherit'}/>
                </IconClearStyled> : ''}
        </Grid> : <></>}
        <Grid item marginTop={2} alignSelf={'stretch'}>
            <Button fullWidth variant={'contained'} size={'medium'} color={'primary'} onClick={() => {
                onDepositClick(tradeData)
            }}
                // style={{width: '200px'}}
                    loading={!getDisabled() && depositBtnStatus === TradeBtnStatus.LOADING ? 'true' : 'false'}
                    disabled={getDisabled() || depositBtnStatus === TradeBtnStatus.DISABLED || depositBtnStatus === TradeBtnStatus.LOADING ? true : false}
            >{t(`depositLabelBtn`)}
            </Button>

        </Grid>
    </Grid>
}

