import { WithTranslation, withTranslation } from 'react-i18next';
import {
    AccountStepNew as AccountStep,
    Button,
    DepositPanel,
    FailedUnlock,
    HadAccount,
    ModalAccount,
    ModalQRCode,
    NoAccount,
    ProcessUnlock,
    QRAddressPanel,
    SuccessUnlock,
    Toast,
    useOpenModals,

    UpdateAccount,

    Deposit_Approve_WaitForAuth,
    Deposit_Approve_Refused,
    Deposit_Approve_Submited,
    Deposit_WaitForAuth,
    Deposit_Refused,
    Deposit_Failed,
    Deposit_Submited,

    Transfer_WaitForAuth,
    Transfer_First_Method_Refused,
    Transfer_User_Refused,
    Transfer_In_Progress,
    Transfer_Success,
    Transfer_Failed,

    Withdraw_WaitForAuth,
    Withdraw_First_Method_Refused,
    Withdraw_User_Refused,
    Withdraw_In_Progress,
    Withdraw_Success,
    Withdraw_Failed,

    CreateAccount_Approve_WaitForAuth,
    CreateAccount_Approve_Refused,
    CreateAccount_Approve_Submited,
    CreateAccount_WaitForAuth,
    CreateAccount_Refused,
    CreateAccount_Failed,
    CreateAccount_Submited,

    UpdateAccount_Approve_WaitForAuth,
    UpdateAccount_First_Method_Refused,
    UpdateAccount_User_Refused,
    UpdateAccount_Success,
    UpdateAccount_Submited,
    UpdateAccount_Failed,
    ModalPanel,
} from '@loopring-web/component-lib';
import { walletServices } from '@loopring-web/web3-provider';
import { sleep } from 'loopring-sdk';

import React, { useState } from 'react';
import { copyToClipBoard } from 'utils/obj_tools';
import { updateAccountStatus, useAccount } from 'stores/account';
import { ActionResult, ActionResultCode, REFRESH_RATE, TOAST_TIME } from 'defs/common_defs';
import { getShortAddr } from '@loopring-web/common-resources';
import { updateAccountFromServer } from 'services/account/activateAccount';
import { lockAccount } from 'services/account/lockAccount';
import { unlockAccount } from 'services/account/unlockAccount';
import { useTokenMap } from 'stores/token';
import { myLog } from 'utils/log_tools';
import { useDeposit } from 'hooks/useractions/useDeposit';

import { accountServices } from '../../services/account/accountServices'

import { LoopringAPI } from 'api_wrapper';
import { useWalletInfo } from 'stores/localStore/walletInfo';

import store from 'stores'
import { useTransfer } from 'hooks/useractions/useTransfer';
import { useWithdraw } from 'hooks/useractions/useWithdraw';

export const ModalAccountInfo = withTranslation('common')(({
    onClose,
    etherscanUrl,
    open,
    t,
    ...rest
}: {
    open: boolean,
    onClose?: (e: MouseEvent) => void,
    etherscanUrl: string
} & WithTranslation) => {

    const { modals: { isShowAccount }, setShowConnect, setShowAccount,
        setShowDeposit, setShowTransfer, setShowWithdraw } = useOpenModals()

    const {
        account,
        addressShort,
        shouldShow,
        updateAccount,
        setShouldShow,
        resetAccount,
    } = useAccount();

    const { walletInfo, updateDepositHashWrapper, checkHWAddr, } = useWalletInfo()

    const {
        withdrawAlertText,
        withdrawToastOpen,
        setWithdrawToastOpen,
        withdrawProps,
        processRequest,
        lastRequest,
    } = useWithdraw()

    const { depositProps } = useDeposit()

    const {
        transferAlertText,
        transferToastOpen,
        setTransferToastOpen,
        transferProps,
        lastRequest: transferLastRequest,
        processRequest: transferProcessRequest,
     } = useTransfer()

    const [openQRCode, setOpenQRCode] = useState(false)

    const { coinMap } = useTokenMap()

    const [copyToastOpen, setCopyToastOpen] = useState(false);

    const onSwitch = React.useCallback(() => {
        setShowAccount({ isShow: false })
        setShouldShow(true);
        setShowConnect({ isShow: shouldShow ?? false })
    }, [setShowConnect, setShowAccount, shouldShow])

    const onCopy = React.useCallback(async () => {
        copyToClipBoard(account.accAddress);
        setCopyToastOpen(true)
    }, [account, setCopyToastOpen,])

    const onViewQRCode = React.useCallback(() => {
        setOpenQRCode(true)
    }, [setOpenQRCode])

    const onDisconnect = React.useCallback(async () => {
        walletServices.sendDisconnect('', 'customer click disconnect');
        setShowAccount({ isShow: false })
    }, [resetAccount, setShowAccount])

    const goDeposit = React.useCallback(() => {

        setShowAccount({ isShow: true, step: AccountStep.Deposit });

    }, [setShowAccount])

    const goUpdateAccount = React.useCallback(async (isFirstTime: boolean = true) => {

        if (!account.accAddress) {
            myLog('account.accAddress is nil')
            return
        }

        setShowAccount({ isShow: true, step: AccountStep.UpdateAccount_Approve_WaitForAuth });

        const isHWAddr = checkHWAddr(account.accAddress)

        myLog('goUpdateAccount.... isHWAddr:', isHWAddr)

        const updateAccAndCheck = async () => {
            const result: ActionResult = await updateAccountFromServer({ isHWAddr })

            switch (result.code) {
                case ActionResultCode.NoError:

                    const eddsaKey = result?.data?.eddsaKey
                    myLog(' after NoError:', eddsaKey)
                    await sleep(REFRESH_RATE)

                    if (LoopringAPI.userAPI && LoopringAPI.exchangeAPI && eddsaKey) {

                        const { accInfo, error } = await LoopringAPI.exchangeAPI.getAccount({ owner: account.accAddress })

                        if (!error && accInfo) {

                            const { apiKey } = (await LoopringAPI.userAPI.getUserApiKey({
                                accountId: accInfo.accountId
                            }, eddsaKey.sk))

                            myLog('After connect >>, get apiKey', apiKey)

                            if (!isFirstTime && isHWAddr) {
                                updateDepositHashWrapper({ wallet: account.accAddress, isHWAddr, })
                            }

                            accountServices.sendAccountSigned(accInfo.accountId, apiKey, eddsaKey)

                        }

                    }

                    setShowAccount({ isShow: false })
                    break
                case ActionResultCode.GetAccError:
                case ActionResultCode.GenEddsaKeyError:
                case ActionResultCode.UpdateAccoutError:

                    let errMsg = result.data?.errorInfo?.errMsg

                    myLog('----------UpdateAccoutError errMsg:', errMsg)

                    const eddsaKey2 = result?.data?.eddsaKey

                    if (eddsaKey2) {
                        myLog('UpdateAccoutError:', eddsaKey2)
                        store.dispatch(updateAccountStatus({ eddsaKey: eddsaKey2, }))
                    }

                    switch (errMsg) {
                        case 'NOT_SUPPORT_ERROR':
                            myLog(' 00000---- got NOT_SUPPORT_ERROR')
                            setShowAccount({ isShow: true, step: AccountStep.UpdateAccount_First_Method_Refused })
                            return
                        case 'USER_DENIED':
                            myLog(' 11111---- got USER_DENIED')
                            setShowAccount({ isShow: true, step: AccountStep.UpdateAccount_User_Refused })
                            return
                        default:
                            accountServices.sendCheckAccount(account.accAddress)
                            break
                    }
                    break
                default:
                    break
            }

        }

        updateAccAndCheck()

    }, [account, setShowAccount, walletInfo])

    const onQRClick = React.useCallback(() => {
        setShowAccount({ isShow: true, step: AccountStep.QRCode })
    }, [])

    const unlockBtn = React.useMemo(() => {
        return <Button variant={'contained'} fullWidth size={'medium'} onClick={() => {
            setShouldShow(true);
            unlockAccount();
        }}>{t('labelUnLockLayer2')} </Button>
    }, [updateAccount, t]);

    const lockBtn = React.useMemo(() => {
        return <Button variant={'contained'} fullWidth size={'medium'} onClick={() => {
            lockAccount();
        }}>{t('labelLockLayer2')} </Button>
    }, [lockAccount, t]);

    const onBack = React.useCallback(() => {
        switch (account.readyState) {
            case 'NO_ACCOUNT':
            case 'DEPOSITING':
                setShowAccount({ isShow: true, step: AccountStep.NoAccount });
                break;
            case 'LOCKED':
            case 'ACTIVATED':
                setShowAccount({ isShow: true, step: AccountStep.HadAccount });
                break;
            default:
                setShowAccount({ isShow: false });

        }
    }, [account])

    const title = t("labelCreateLayer2Title")

    const backToDepositBtnInfo = React.useMemo(() => {
        return {
            btnTxt: t('labelRetry'),
            callback: () => {
                setShowAccount({ isShow: true, step: AccountStep.Deposit });
            }
        }
    }, [])

    const backToTransferBtnInfo = React.useMemo(() => {
        return {
            btnTxt: t('labelRetry'),
            callback: () => {
                setShowAccount({ isShow: false, })
                setShowTransfer({ isShow: true, })
            }
        }
    }, [])

    const backToWithdrawBtnInfo = React.useMemo(() => {
        return {
            btnTxt: t('labelRetry'),
            callback: () => {
                setShowAccount({ isShow: false })
                setShowWithdraw({ isShow: true })
            }
        }
    }, [setShowWithdraw, ])

    const backToUpdateAccountBtnInfo = React.useMemo(() => {
        return {
            btnTxt: t('labelRetry'),
            callback: () => {
                setShowAccount({ isShow: true, step: AccountStep.UpdateAccount })
            }
        }
    }, [setShowAccount, ])

    const TryNewTransferAuthBtnInfo = React.useMemo(() => {
        return {
            btnTxt: t('labelTryNext'),
            callback: () => {
                myLog('...labelTryNext...')
                setShowAccount({ isShow: true, step: AccountStep.Transfer_WaitForAuth })
                transferProcessRequest(transferLastRequest.request, false)
            }
        }
    }, [transferProcessRequest, transferLastRequest])

    const TryNewWithdrawAuthBtnInfo = React.useMemo(() => {
        return {
            btnTxt: t('labelTryNext'),
            callback: () => {
                myLog('...labelTryNext...')
                setShowAccount({ isShow: true, step: AccountStep.Withdraw_WaitForAuth })
                processRequest(lastRequest.request, false)
            }
        }
    }, [processRequest, lastRequest])

    const closeBtnInfo = React.useMemo(() => {
        return {
            btnTxt: t('labelClose'),
            callback: (e: any) => {
                setShouldShow(false);
                setShowTransfer({ isShow: false })
                setShowWithdraw({ isShow: false })
                setShowAccount({ isShow: false })
                if (onClose) {
                    onClose(e)
                }
            }
        }
    }, [])

    const accountList = React.useMemo(() => {
        return Object.values({
            [AccountStep.NoAccount]: {
                view: <NoAccount {...{
                    goDeposit,
                    ...account,
                    etherscanUrl,
                    onSwitch, onCopy,
                    onViewQRCode, onDisconnect, addressShort,
                }} />, onQRClick
            },
            [AccountStep.QRCode]: {
                view: <QRAddressPanel {...{
                    ...rest,
                    ...account,
                    etherscanUrl,
                    t
                }} />, onBack, noClose: true
            },
            [AccountStep.ProcessUnlock]: {
                view: <ProcessUnlock providerName={account.connectName} {...{
                    ...rest,
                    t
                }} />,
            },
            [AccountStep.SuccessUnlock]: {
                view: <SuccessUnlock providerName={account.connectName} onClose={closeBtnInfo.callback} {...{ ...rest, t }} />,
            },
            [AccountStep.FailedUnlock]: {
                view: <FailedUnlock onRetry={() => {
                    unlockAccount()
                }} {...{ ...rest, t }} />,
            },
            [AccountStep.HadAccount]: {
                view: <HadAccount {...{
                    ...account,
                    onSwitch, onCopy,
                    etherscanUrl,

                    // address: account.accAddress,
                    // connectBy: account.connectName,
                    onViewQRCode, onDisconnect, addressShort,
                    etherscanLink: etherscanUrl + account.accAddress,
                    mainBtn: account.readyState === 'ACTIVATED' ? lockBtn : unlockBtn
                }} />, onQRClick
            },

            // new 
            // deposit
            [AccountStep.Deposit]: {
                view: <DepositPanel title={title} {...{
                    ...rest,
                    _height: 'var(--modal-height)',
                    _width: 'var(--modal-width)',
                    ...depositProps,
                    t
                }} />
            },
            [AccountStep.Deposit_Approve_WaitForAuth]: {
                view: <Deposit_Approve_WaitForAuth
                    providerName={account.connectName} {...{
                        ...rest, t
                    }} />,
            },
            [AccountStep.Deposit_Approve_Refused]: {
                view: <Deposit_Approve_Refused btnInfo={backToDepositBtnInfo} {...{
                    ...rest, t
                }} />, onBack: () => {
                    setShowAccount({ isShow: true, step: AccountStep.Deposit });
                }
            },
            [AccountStep.Deposit_Approve_Submited]: {
                view: <Deposit_Approve_Submited btnInfo={closeBtnInfo} {...{
                    ...rest, t
                }} />, onBack: () => {
                    setShowAccount({ isShow: true, step: AccountStep.Deposit });
                }
            },
            [AccountStep.Deposit_WaitForAuth]: {
                view: <Deposit_WaitForAuth
                    providerName={account.connectName} {...{
                        ...rest, t
                    }} />, onBack: () => {
                        setShowAccount({ isShow: true, step: AccountStep.Deposit });
                    }
            },
            [AccountStep.Deposit_Refused]: {
                view: <Deposit_Refused btnInfo={backToDepositBtnInfo} {...{
                    ...rest, t
                }} />, onBack: () => {
                    setShowAccount({ isShow: true, step: AccountStep.Deposit });
                }
            },
            [AccountStep.Deposit_Failed]: {
                view: <Deposit_Failed btnInfo={closeBtnInfo} {...{
                    ...rest, t
                }} />, onBack: () => {
                    setShowAccount({ isShow: true, step: AccountStep.Deposit });
                }
            },
            [AccountStep.Deposit_Submited]: {
                view: <Deposit_Submited btnInfo={closeBtnInfo} {...{
                    ...rest, t
                }} />, onBack: () => {
                    setShowAccount({ isShow: true, step: AccountStep.Deposit });
                }
            },

            // transfer
            [AccountStep.Transfer_WaitForAuth]: {
                view: <Transfer_WaitForAuth
                    providerName={account.connectName} {...{
                        ...rest, t
                    }} />,
            },
            [AccountStep.Transfer_First_Method_Refused]: {
                view: <Transfer_First_Method_Refused btnInfo={TryNewTransferAuthBtnInfo} {...{
                    ...rest, t
                }} />,
            },
            [AccountStep.Transfer_User_Refused]: {
                view: <Transfer_User_Refused btnInfo={backToTransferBtnInfo} {...{
                    ...rest, t
                }} />,
            },
            [AccountStep.Transfer_In_Progress]: {
                view: <Transfer_In_Progress {...{
                    ...rest, t
                }} />,
            },
            [AccountStep.Transfer_Success]: {
                view: <Transfer_Success btnInfo={closeBtnInfo} {...{
                    ...rest, t
                }} />,
            },
            [AccountStep.Transfer_Failed]: {
                view: <Transfer_Failed btnInfo={closeBtnInfo} {...{
                    ...rest, t
                }} />,
            },

            // withdraw
            [AccountStep.Withdraw_WaitForAuth]: {
                view: <Withdraw_WaitForAuth
                    providerName={account.connectName} {...{
                        ...rest, t
                    }} />,
            },
            [AccountStep.Withdraw_First_Method_Refused]: {
                view: <Withdraw_First_Method_Refused btnInfo={TryNewWithdrawAuthBtnInfo} {...{
                    ...rest, t
                }} />,
            },
            [AccountStep.Withdraw_User_Refused]: {
                view: <Withdraw_User_Refused btnInfo={backToWithdrawBtnInfo} {...{
                    ...rest, t
                }} />,
            },
            [AccountStep.Withdraw_In_Progress]: {
                view: <Withdraw_In_Progress {...{
                    ...rest, t
                }} />,
            },
            [AccountStep.Withdraw_Success]: {
                view: <Withdraw_Success btnInfo={closeBtnInfo} {...{
                    ...rest, t
                }} />,
            },
            [AccountStep.Withdraw_Failed]: {
                view: <Withdraw_Failed btnInfo={closeBtnInfo} {...{
                    ...rest, t
                }} />,
            },

            //create account

            [AccountStep.CreateAccount_Approve_WaitForAuth]: {
                view: <CreateAccount_Approve_WaitForAuth
                    providerName={account.connectName} {...{
                        ...rest, t
                    }} />,
            },
            [AccountStep.CreateAccount_Approve_Refused]: {
                view: <CreateAccount_Approve_Refused
                    providerName={account.connectName} {...{
                        ...rest, t
                    }} />,
            },
            [AccountStep.CreateAccount_Approve_Submited]: {
                view: <CreateAccount_Approve_Submited
                    providerName={account.connectName} {...{
                        ...rest, t
                    }} />,
            },
            [AccountStep.CreateAccount_WaitForAuth]: {
                view: <CreateAccount_WaitForAuth
                    providerName={account.connectName} {...{
                        ...rest, t
                    }} />,
            },
            [AccountStep.CreateAccount_Refused]: {
                view: <CreateAccount_Refused
                    providerName={account.connectName} {...{
                        ...rest, t
                    }} />,
            },
            [AccountStep.CreateAccount_Failed]: {
                view: <CreateAccount_Failed
                    providerName={account.connectName} {...{
                        ...rest, t
                    }} />,
            },
            [AccountStep.CreateAccount_Submited]: {
                view: <CreateAccount_Submited
                    providerName={account.connectName} {...{
                        ...rest, t
                    }} />,
            },

            //update account

            [AccountStep.UpdateAccount]: {
                view: <UpdateAccount {...{
                    ...account,
                    etherscanUrl,
                    onSwitch, onCopy,
                    onViewQRCode, onDisconnect, addressShort,
                }} goUpdateAccount={() => {
                    goUpdateAccount()
                }}  {...{ ...rest, t }} />, onQRClick
            },
            [AccountStep.UpdateAccount_Approve_WaitForAuth]: {
                view: <UpdateAccount_Approve_WaitForAuth
                    providerName={account.connectName} {...{
                        ...rest, t
                    }} />,
            },
            [AccountStep.UpdateAccount_First_Method_Refused]: {
                view: <UpdateAccount_First_Method_Refused btnInfo={{
                    btnTxt: t('labelTryAnother'),
                    callback: (e?: any) => {
                        goUpdateAccount(false)
                    }
                }} {...{
                    ...rest, t
                }} />, onBack: () => {
                    backToUpdateAccountBtnInfo.callback()
                }
            },
            [AccountStep.UpdateAccount_User_Refused]: {
                view: <UpdateAccount_User_Refused btnInfo={backToUpdateAccountBtnInfo} {...{
                    ...rest, t
                }} />,
            },
            [AccountStep.UpdateAccount_Success]: {
                view: <UpdateAccount_Success btnInfo={closeBtnInfo}  {...{
                    ...rest, t
                }} />,
            },
            [AccountStep.UpdateAccount_Submited]: {
                view: <UpdateAccount_Submited btnInfo={closeBtnInfo} {...{
                    ...rest, t
                }} />,
            },
            [AccountStep.UpdateAccount_Failed]: {
                view: <UpdateAccount_Failed btnInfo={closeBtnInfo} {...{
                    ...rest, t
                }} />,
            },

        })
    }, [addressShort, account, depositProps, etherscanUrl, onCopy, onSwitch, onDisconnect, onViewQRCode, t, rest])

    const current = accountList[isShowAccount.step]

    // myLog('isShowAccount.step:', isShowAccount.step, ' ', AccountStep[isShowAccount.step])

    return <>

        <Toast alertText={withdrawAlertText as string} open={withdrawToastOpen}
            autoHideDuration={TOAST_TIME} onClose={() => {
                setWithdrawToastOpen(false)
            }} />

        <Toast alertText={withdrawAlertText as string} open={withdrawToastOpen}
            autoHideDuration={TOAST_TIME} onClose={() => {
                setWithdrawToastOpen(false)
            }} />

        <ModalPanel transferProps={transferProps}
            withDrawProps={withdrawProps}
            depositProps={depositProps}
            resetProps={{} as any}
            ammProps={{} as any}
            swapProps={{} as any}
            {...{ _height: 'var(--modal-height)', _width: 'var(--modal-width)' }}
        />

        <Toast alertText={t('Address Copied to Clipboard!')} open={copyToastOpen}
            autoHideDuration={TOAST_TIME} onClose={() => {
                setCopyToastOpen(false)
            }} severity={"success"} />

        <ModalQRCode open={openQRCode} onClose={() => setOpenQRCode(false)} title={'ETH Address'}
            description={account?.accAddress} url={account?.accAddress} />

        <ModalAccount open={isShowAccount.isShow} onClose={closeBtnInfo.callback} panelList={accountList}
            onBack={current?.onBack}
            onQRClick={current?.onQRClick}
            step={isShowAccount.step} />
    </>
})
