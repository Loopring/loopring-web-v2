import { WithTranslation, withTranslation } from 'react-i18next';
import {
    ModalAccount,
    ModalPanel,
    ModalQRCode,
    Toast,
} from '@loopring-web/component-lib';
import { TOAST_TIME } from 'defs/common_defs';
import { useAccountModalForUI } from './hook';

export const ModalAccountInfo = withTranslation('common')(({
                                                               onClose,
                                                               etherscanBaseUrl,
                                                               open,
                                                               t,
                                                               ...rest
                                                           }: {
    open: boolean,
    onClose?: (e: MouseEvent) => void,
    etherscanBaseUrl: string
} & WithTranslation) => {

    const {
        withdrawAlertText,
        withdrawToastOpen,
        setWithdrawToastOpen,
        transferProps,
        withdrawProps,
        depositProps,
        resetProps,
        assetsRawData,
        copyToastOpen,
        setCopyToastOpen,
        openQRCode,
        setOpenQRCode,
        isShowAccount,
        account,
        closeBtnInfo,
        accountList,
        currentModal,
    } = useAccountModalForUI({t, etherscanBaseUrl, rest, onClose})

    return <>

        <Toast alertText={withdrawAlertText as string} open={withdrawToastOpen}
               autoHideDuration={TOAST_TIME} onClose={() => {
            setWithdrawToastOpen(false)
        }}/>

        <Toast alertText={withdrawAlertText as string} open={withdrawToastOpen}
               autoHideDuration={TOAST_TIME} onClose={() => {
            setWithdrawToastOpen(false)
        }}/>

        <ModalPanel transferProps={transferProps}
                    withDrawProps={withdrawProps}
                    depositProps={depositProps}
                    resetProps={resetProps}
                    ammProps={{} as any}
                    swapProps={{} as any}
                    assetsData={assetsRawData}
                    {...{_height: 'var(--modal-height)', _width: 'var(--modal-width)'}}
        />

        <Toast alertText={t('Address Copied to Clipboard!')} open={copyToastOpen}
               autoHideDuration={TOAST_TIME} onClose={() => {
            setCopyToastOpen(false)
        }} severity={"success"}/>

        <ModalQRCode open={openQRCode} onClose={() => setOpenQRCode(false)} title={'ETH Address'}
                     description={account?.accAddress} url={account?.accAddress}/>

        <ModalAccount open={isShowAccount.isShow} onClose={closeBtnInfo.callback} panelList={accountList}
                      onBack={currentModal?.onBack}
                      onQRClick={currentModal?.onQRClick}
                      step={isShowAccount.step}/>
    </>
})
