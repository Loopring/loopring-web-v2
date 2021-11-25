import { Trans, WithTranslation } from 'react-i18next';
import React, { ChangeEvent, useState } from 'react';
import { Box, Grid, IconProps, Typography } from '@mui/material';
import { bindHover } from 'material-ui-popup-state/es';
import { bindPopper, usePopupState } from 'material-ui-popup-state/hooks';
import {
    CloseIcon,
    copyToClipBoard,
    DropDownIcon,
    FeeChargeOrderDefault,
    // getFormattedHash,
    getValuePrecisionThousand,
    globalSetup,
    HelpIcon,
    IBData,
    myLog,
    NFTWholeINFO,
    TOAST_TIME,
    LoadingIcon,
} from '@loopring-web/common-resources';
import { Button, IconClearStyled, TextField, Toast, TradeBtnStatus } from '../../index';
import { PopoverPure } from '../../'
import { TransferViewProps } from './Interface';
import { BasicACoinTrade } from './BasicACoinTrade';
import * as _ from 'lodash'
import { ToggleButtonGroup } from '../../basic-lib';
import { useSettings } from '../../../stores'
import styled from '@emotion/styled'
import {  NFTInput } from './BasicANFTTrade';
import { AddressError } from './Interface'

const FeeTokenItemWrapper = styled(Box)`
  background-color: var(--color-global-bg);
`

const IconLoadingStyled = styled(LoadingIcon)`
  position: absolute;
  top: 20px;
  right: 4px;
` as typeof LoadingIcon

const DropdownIconStyled = styled(DropDownIcon)<IconProps>`
  transform: rotate(${({status}: any) => {
    return status === 'down' ? '0deg' : '180deg';
  }});
` as (props: IconProps & { status: string }) => JSX.Element

const OriginBoxStyled = styled(Box)`
    background-color: var(--field-opacity);
    // width: 100%; 
    height: ${({theme}: any) => theme.unit * 4 }px;
    border-radius: ${({theme}: any) => theme.unit / 2 }px;
    cursor: pointer;
    color: var(--color-text-primary);
    padding: 0.3rem;
    padding-left: 1.6rem;
    display: flex;
    align-items: center;
    border: 1px solid ${({thememode, status}: any) => status === 'down'
            ? 'var(--color-border-hover)'
            : thememode === 'dark'
                ? '#41445E'
                : '#EEF1FA'};

    &:hover {
        border: 1px solid var(--color-border-hover);
    }
` as any

const OriginDropdownStyled = styled(Box)`
    background-color: var(--color-disable);
    width: 100%;
    border-radius: ${({theme}: any) => theme.unit / 2 }px;
    color: var(--color-text-primary);
    padding: 1.6rem;
`

const UpIconWrapper = styled(Box)`
    position: absolute;
    right: 0.8rem;
    top: 28px;
    transform: translateY(30%);
`

export const TransferWrap = <T extends IBData<I> & Partial<NFTWholeINFO>,
    I>({
           t, disabled, walletMap,
           tradeData, coinMap, transferI18nKey,
           chargeFeeToken = 'ETH', type,
           chargeFeeTokenList,
           onTransferClick,
           handleFeeChange,
           isThumb,
           transferBtnStatus,
           addressDefault,
           handleOnAddressChange,
           handleAddressError,
           wait = globalSetup.wait,
           assetsData = [],
           realAddr,
           isLoopringAddress,
           addrStatus,
           isAddressCheckLoading,
           ...rest
       }: TransferViewProps<T, I> & WithTranslation & { assetsData: any[] }) => {


        // myLog({addrStatus})
    const inputBtnRef = React.useRef();
    const getDisabled = () => {
        if (disabled || tradeData === undefined || walletMap === undefined || coinMap === undefined || isFeeNotEnough) {
            return true
        } else {
            return false
        }
    };
    const inputButtonDefaultProps = {
        label: t('transferLabelEnterToken'),
    }


    const [address, setAddress] = React.useState<string | undefined>(addressDefault ? addressDefault : '');
    const [addressError, setAddressError] = React.useState<{ error: boolean, message?: string | React.ElementType<HTMLElement> } | undefined>();

    const [memo, setMemo] = React.useState('');
    const [feeToken, setFeeToken] = React.useState('')
    const [dropdownStatus, setDropdownStatus] = React.useState<'up' | 'down'>('down')
    const [isFeeNotEnough, setIsFeeNotEnough] = React.useState(false)
    const [addressOrigin, setAddressOrigin] = React.useState('')
    const [addressOriginDropdownStatus, setAddressOriginDropdownStatus] = React.useState<'up' | 'down'>('up')
    const [isConfirmTransfer, setIsConfirmTransfer] = React.useState(false)

    const ITEM_MARGIN = isConfirmTransfer ? 3 : 2

    let {feeChargeOrder, themeMode} = useSettings()
    feeChargeOrder = feeChargeOrder ?? FeeChargeOrderDefault;
    const popupState = usePopupState({variant: 'popover', popupId: `popupId-transfer`});
    const toggleData: any[] = chargeFeeTokenList.sort((a, b) =>
        feeChargeOrder.indexOf(a.belong) - feeChargeOrder.indexOf(b.belong)).map(({belong, fee, __raw__,}
    ) => ({
        key: belong,
        value: belong,
        fee,
        __raw__,
    }))

    const getTokenFee = React.useCallback((token: string) => {
        const raw = toggleData.find(o => o.key === token)?.fee
        // myLog('......raw:', raw, typeof raw, getValuePrecisionThousand(raw))
        return getValuePrecisionThousand(raw, undefined, undefined, undefined, false, {isTrade: true, floor: false})
    }, [toggleData])

    const debounceAddress = React.useCallback(_.debounce(({address}: any) => {
        if (handleOnAddressChange) {
            handleOnAddressChange(address)
        }
    }, 500), [])
    const _handleOnAddressChange = (event: ChangeEvent<HTMLInputElement>) => {
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

    const _handleOnMemoChange = React.useCallback((e: ChangeEvent<HTMLInputElement>) => {
        setMemo(e.target.value)
    }, [])

    const handleClear = React.useCallback(() => {
        setAddress('')
        if (handleAddressError) {
            const error = handleAddressError('')
            if (error?.error) {
                setAddressError(error)
            }
        }
    }, [setAddress, handleAddressError, setAddressError])

    React.useEffect(() => {
        if (!!chargeFeeTokenList.length && !feeToken && assetsData) {
            const defaultToken = chargeFeeTokenList.find(o => o.fee !== undefined && assetsData.find(item => item.name === o.belong)?.available > o.fee)?.belong || 'ETH'
            setFeeToken(defaultToken)
            const currFee = toggleData.find(o => o.key === defaultToken)?.fee || '--'
            const currFeeRaw = toggleData.find(o => o.key === defaultToken)?.__raw__ || '--'
            handleFeeChange({
                belong: defaultToken,
                fee: currFee,
                __raw__: currFeeRaw,
            })
        }
    }, [chargeFeeTokenList, feeToken, assetsData, handleFeeChange, toggleData])

    const checkFeeTokenEnough = React.useCallback((token: string, fee: number) => {
        const tokenAssets = assetsData.find(o => o.name === token)?.available
        return tokenAssets && Number(tokenAssets) > fee
    }, [assetsData])

    const [copyToastOpen, setCopyToastOpen] = useState(false);
    const onCopy = React.useCallback(async (content: string) => {
        copyToClipBoard(content);
        setCopyToastOpen(true)
    }, [setCopyToastOpen,])
    const handleToggleChange = React.useCallback((_e: React.MouseEvent<HTMLElement, MouseEvent>, value: string) => {
        if (value === null) return
        const currFeeRaw = toggleData.find(o => o.key === value)?.__raw__ || '--'
        setFeeToken(value)
        handleFeeChange({
            belong: value,
            fee: getTokenFee(value),
            __raw__: currFeeRaw,
        })
    }, [handleFeeChange, getTokenFee, toggleData])

    React.useEffect(() => {
        if (!!chargeFeeTokenList.length && assetsData && !checkFeeTokenEnough(feeToken, Number(getTokenFee(feeToken)))) {
            setIsFeeNotEnough(true)
            return
        }
        setIsFeeNotEnough(false)
    }, [chargeFeeTokenList, assetsData, checkFeeTokenEnough, getTokenFee, feeToken])

    const getTransferConfirmTemplate = React.useCallback((label: string, content: string) => {
        return (
            <Box>
                <Typography fontSize={16} lineHeight={'24px'} color={'var(--color-text-third)'}>{label}</Typography>
                <Typography fontSize={16} lineHeight={'24px'}>{content}</Typography>
            </Box>
        )
    }, [])

    const isInvalidAddressOrENS = !isAddressCheckLoading && address && addrStatus === AddressError.InvalidAddr

    return <Grid className={walletMap ? 'transfer-wrap' : 'loading'} paddingLeft={5 / 2} paddingRight={5 / 2} container
                 direction={"column"}
                //  justifyContent={'space-between'}
                //  alignItems={"stretch"} flex={1} height={'100%'} flexWrap={'nowrap'}
                alignItems={"stretch"} flex={1} height={'100%'} flexWrap={'nowrap'}
    >
        <Grid item>
            <Box display={'flex'} flexDirection={'row'} justifyContent={'center'} alignItems={'center'}
                marginBottom={2}>
                <Typography component={'h4'} variant={'h3'} marginRight={1}>{t('transferTitle')}</Typography>
                <HelpIcon {...bindHover(popupState)} fontSize={'large'} htmlColor={'var(--color-text-third)'}/>
            </Box>
            <PopoverPure
                className={'arrow-center'}
                {...bindPopper(popupState)}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'center',
                }}
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'center',
                }}
            >
                <Typography padding={2} maxWidth={450} fontSize={14} variant={'body2'} whiteSpace={'pre-line'}>
                    <Trans i18nKey="transferDescription">
                        Transfer to any valid Ethereum addresses instantly. Please make
                        sure the recipient address accepts Loopring
                        layer-2 payments before you proceed.
                    </Trans>
                </Typography>
            </PopoverPure>
        </Grid>
        {/*{tradeData.tokenId} {tradeData.balance }*/}
        <Grid item /* marginTop={3} */ alignSelf={"stretch"}>
            {isConfirmTransfer ? (
                getTransferConfirmTemplate(t('labelTransferTokenAmount'), `${tradeData?.tradeValue} ${tradeData?.belong}`)
            ) : type === 'NFT' ? <NFTInput
                {...{...rest,
                    isThumb,
                    type,
                    onCopy,
                    t,
                    disabled,
                    walletMap,
                    tradeData,
                    coinMap,
                    inputNFTDefaultProps:{label: ''},
                    inputNFTRef : inputBtnRef,}}
            />: <BasicACoinTrade {...{
                ...rest,
                type,
                t,
                disabled,
                walletMap,
                tradeData,
                coinMap,
                inputButtonDefaultProps,
                inputBtnRef: inputBtnRef,

            }} />}
        </Grid>
        <Grid item marginTop={ITEM_MARGIN} alignSelf={"stretch"} position={'relative'}>
            {isConfirmTransfer ? (getTransferConfirmTemplate(t('labelTransferAddress'), tradeData['address'])) : (
                <>
                    <TextField
                        value={address}
                        error={addressError && addressError.error ? true : false}
                        label={t('transferLabelAddress')}
                        placeholder={t('transferLabelAddressInput')}
                        onChange={_handleOnAddressChange}
                        disabled={chargeFeeTokenList.length ? false : true}
                        SelectProps={{IconComponent: DropDownIcon}}
                        // required={true}
                        // inputRef={addressInput}
                        helperText={<Typography
                            variant={'body2'}
                            component={'span'}>{addressError && addressError.error ? addressError.message : ''}</Typography>}
                        fullWidth={true}
                    />
                    {address !== ''
                        ? isAddressCheckLoading
                            ? (<IconLoadingStyled width={24} style={{top: '32px', right: '8px'}} />)
                            : (
                                <IconClearStyled 
                                    color={'inherit'} 
                                    size={'small'} 
                                    style={{top: '30px'}} 
                                    aria-label="Clear"
                                    onClick={handleClear}>
                                <CloseIcon/>
                            </IconClearStyled>)
                        : ''}
                    <Box marginLeft={1 / 2}>
                    {isInvalidAddressOrENS ? (
                        <Typography color={'var(--color-error)'} fontSize={14} alignSelf={"stretch"} position={'relative'}>
                            {t('labelTransferInvalidAddress')}
                        </Typography>
                    ) : (
                        <>
                            {realAddr && !isAddressCheckLoading && (
                                <Typography color={'var(--color-text-primary)'} variant={'body2'} marginTop={1 / 4}>{realAddr}</Typography>
                            )}
                            {!isAddressCheckLoading && address && addrStatus === AddressError.NoError && !isLoopringAddress && (
                                <Typography color={'var(--color-error)'} lineHeight={1} fontSize={'1.4rem'} marginTop={1 / 4}>
                                    {t('labelTransferAddressNotLoopring')}
                                </Typography>
                            )}
                        </>
                    )}
                </Box>
                </>
            )}
            
        </Grid>

        {isConfirmTransfer ? (
            <Grid item color={'var(--color-error)'} alignSelf={"stretch"} position={'relative'} marginTop={ITEM_MARGIN}>
                {getTransferConfirmTemplate(t('labelTransferAddressOrigin'), 'Wallet')}
            </Grid>
        ) : (
            <Grid item color={'var(--color-error)'} alignSelf={"stretch"} position={'relative'} marginTop={ITEM_MARGIN}>
            <Typography marginBottom={1 / 2} color={'var(--color-text-secondary)'}>{t('labelTransferAddressOrigin')}</Typography>
            <Box onClick={() => setAddressOriginDropdownStatus(prev => prev === 'down' ? 'up' : 'down')}>
                <UpIconWrapper>
                    {<DropDownIcon htmlColor={'var(--color-text-secondary)'} style={{
                        cursor: 'pointer',
                        transform: (addressOriginDropdownStatus === 'up' ? '' : 'rotate(-180deg)')
                    }}/>}
                </UpIconWrapper>
                <OriginBoxStyled 
                    thememode={themeMode}
                    status={addressOriginDropdownStatus}
                    fontSize={14}
                >{addressOrigin}</OriginBoxStyled>
            </Box>
            <OriginDropdownStyled fontSize={14} style={{ display: addressOriginDropdownStatus === 'down' ? 'block' : 'none' }}>
                <Typography variant={'body2'} color={'var(--color-text-secondary)'}>{t('labelTransferOriginDesc')}</Typography>
                <Grid container marginTop={1} spacing={1}>
                    <Grid item xs={6}>
                        <Button fullWidth disabled variant={'outlined'}>{t('labelTransferOriginBtnExchange')}</Button>
                    </Grid>
                    <Grid item xs={6}>
                        <Button 
                            style={{ 
                                borderColor: addressOrigin === 'Wallet' ? 'var(--color-text-primary)' : 'undefined',
                                color: addressOrigin === 'Wallet' ? 'var(--color-text-primary)' : 'undefined',
                            }}
                            onClick={() => {
                                setAddressOrigin('Wallet');
                                setAddressOriginDropdownStatus('up');
                            }} 
                            fullWidth 
                            variant={'outlined'}>{t('labelTransferOriginBtnWallet')}</Button>
                    </Grid>
                </Grid>
            </OriginDropdownStyled>
        </Grid>
        )}

        

        <Grid item marginTop={ITEM_MARGIN} alignSelf={"stretch"} position={'relative'}>
            {isConfirmTransfer ? (
                getTransferConfirmTemplate(t('labelTransferMemo'), memo)
            ) : (
                <TextField
                    value={memo}
                    // error={addressError && addressError.error ? true : false}
                    label={t('transferLabelMemo')}
                    placeholder={t('transferLabelMemoPlaceholder')}
                    onChange={_handleOnMemoChange}
                    fullWidth={true}
                />
            )}
        </Grid>

        {!isConfirmTransfer && (
            <Grid item marginTop={2} alignSelf={"stretch"} position={'relative'}>
            {!toggleData?.length ?
                <Typography>{t('labelCalculating')}</Typography> :
                <>
                    <Typography component={'span'} display={'flex'}  flexWrap={'wrap'} alignItems={'center'} variant={'body1'}
                                color={'var(--color-text-secondary)'} marginBottom={1}>
                        <Typography component={'span'}  color={'inherit'} minWidth={28}>{t('transferLabelFee')}：</Typography>
                        <Box component={'span'} display={'flex'} alignItems={'center'} style={{cursor: 'pointer'}}
                             onClick={() => setDropdownStatus(prev => prev === 'up' ? 'down' : 'up')}>
                            {getTokenFee(feeToken) || '--'} {feeToken}
                            <DropdownIconStyled status={dropdownStatus} fontSize={'medium'}/>
                            <Typography marginLeft={1} component={'span'} color={'var(--color-error)'}>
                                {isFeeNotEnough && t('transferLabelFeeNotEnough')}
                            </Typography>
                        </Box>
                    </Typography>
                    {dropdownStatus === 'up' && (
                        <FeeTokenItemWrapper padding={2}>
                            <Typography variant={'body2'} color={'var(--color-text-third)'}
                                        marginBottom={1}>{t('transferLabelFeeChoose')}</Typography>
                            <ToggleButtonGroup exclusive size={'small'} {...{data: toggleData, value: feeToken, t, ...rest}}
                                               onChange={handleToggleChange}/>
                        </FeeTokenItemWrapper>
                    )}
                </>
            }
        </Grid>
        )}
        
        <Grid item marginTop={ITEM_MARGIN} alignSelf={'stretch'}>
            <Button fullWidth variant={'contained'} size={'medium'} color={'primary'} onClick={isConfirmTransfer ? () => {
                const tradeDataWithMemo = {...tradeData, memo: memo}
                // onTransferClick(tradeData)
                onTransferClick(tradeDataWithMemo)
            } : () => { setIsConfirmTransfer(true) }}
                    loading={!getDisabled() && transferBtnStatus === TradeBtnStatus.LOADING ? 'true' : 'false'}
                    disabled={getDisabled() || transferBtnStatus === TradeBtnStatus.DISABLED || transferBtnStatus === TradeBtnStatus.LOADING ? true : false || !addressOrigin || isAddressCheckLoading}
            >{isConfirmTransfer ? (t('labelConfirm')) : t(transferI18nKey ?? `transferLabelBtn`)}
            </Button>
        </Grid>
        <Toast alertText={t('labelCopyAddClip')} open={copyToastOpen}
               autoHideDuration={TOAST_TIME} onClose={() => {
            setCopyToastOpen(false)
        }} severity={"success"}/>
    </Grid>;
}
