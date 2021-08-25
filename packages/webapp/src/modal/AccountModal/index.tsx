import { WithTranslation, withTranslation } from 'react-i18next';
import {
    AccountStepNew as AccountStep,
    ActiveAccountProcess,
    ApproveAccount,
    Button,
    Depositing,
    DepositingProcess,
    DepositPanel,
    FailedDeposit,
    FailedTokenAccess,
    FailedUnlock,
    HadAccount,
    ModalAccount,
    ModalQRCode,
    NoAccount,
    ProcessUnlock,
    QRAddressPanel,
    SuccessUnlock,
    Toast,
    TokenAccessProcess,
    UpdateAccSigWarning,
    UpdateAccUserDenied,
    useOpenModals,

    Deposit_Approve_WaitForAuth,
    Deposit_Approve_Refused,
    Deposit_Approve_Submited,
    Deposit_WaitForAuth,
    Deposit_Refused,
    Deposit_Failed,
    Deposit_Submited,

    Transfer_WaitForAuth,
    Transfer_Refused,
    Transfer_In_Progress,
    Transfer_Success,
    Transfer_Failed,

    Withdraw_WaitForAuth,
    Withdraw_Refused,
    Withdraw_In_Progress,
    Withdraw_Success,
    Withdraw_Failed,
} from '@loopring-web/component-lib';
import { walletServices } from '@loopring-web/web3-provider';
import { ConnectorError, sleep } from 'loopring-sdk';

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
    const {
        account,
        shouldShow,
        updateAccount,
        setShouldShow,
        resetAccount,
    } = useAccount();

    const { depositProps } = useDeposit()
    const { modals: { isShowAccount }, setShowConnect, setShowAccount, 
    setShowDeposit, setShowTransfer, setShowWithdraw } = useOpenModals()

    const [openQRCode, setOpenQRCode] = useState(false)
    const addressShort = getShortAddr(account.accAddress)

    const { coinMap } = useTokenMap()

    const [copyToastOpen, setCopyToastOpen] = useState(false);

    const { walletInfo, updateDepositHashWrapper, } = useWalletInfo()

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
    }, [])
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

        setShowAccount({ isShow: true, step: AccountStep.UpdateAccountInProcess });

        const isHWAddr = isFirstTime ? !!walletInfo?.walletTypeMap[account.accAddress] : !walletInfo?.walletTypeMap[account.accAddress]

        myLog('goUpdateAccount.... isHWAddr:', isHWAddr)

        const updateAccAndCheck = async (isHWAddr: boolean) => {
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
                            setShowAccount({ isShow: true, step: AccountStep.UpdateAccountSigWarning })
                            return
                        case 'USER_DENIED':
                            myLog(' 11111---- got USER_DENIED')
                            setShowAccount({ isShow: true, step: AccountStep.UpdateAccountUserDenied })
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

        updateAccAndCheck(isHWAddr)

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
                return true
            }
        }
    }, [])

    const backToTransferBtnInfo = React.useMemo(() => {
        return {
            btnTxt: t('labelRetry'),
            callback: () => {
                setShowAccount({ isShow: false, })
                setShowTransfer({ isShow: true, })
                return true
            }
        }
    }, [])

    const backToWithdrawBtnInfo = React.useMemo(() => {
        return {
            btnTxt: t('labelRetry'),
            callback: () => {
                setShowAccount({ isShow: false, })
                setShowWithdraw({ isShow: true, })
                return true
            }
        }
    }, [])

    const closeBtnInfo = React.useMemo(() => {
        return {
            btnTxt: t('labelClose'),
            callback: (e: any) => {
                setShouldShow(false);
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
                view: <QRAddressPanel  {...{
                    ...rest,
                    ...account,
                    etherscanUrl,
                    t
                }} />, onBack, noClose: true
            },
            [AccountStep.Deposit]: {
                view: <DepositPanel title={title} {...{
                    ...rest,
                    _height: 'var(--modal-height)',
                    _width: 'var(--modal-width)',
                    ...depositProps,
                    t
                }} />
            },
            [AccountStep.UpdateAccount]: {
                view: <ApproveAccount {...{
                    ...account,
                    etherscanUrl,
                    onSwitch, onCopy,
                    onViewQRCode, onDisconnect, addressShort,
                }} goUpdateAccount={() => {
                    goUpdateAccount()
                }}  {...{ ...rest, t }} />, onQRClick
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
            [AccountStep.UpdateAccountInProcess]: {
                view: <ActiveAccountProcess label={title} providerName={account.connectName} {...{
                    ...rest,
                    t
                }} />,
            },
            [AccountStep.UpdateAccountFailed]: {
                view: <FailedUnlock label={title} onRetry={() => {
                    goUpdateAccount()
                }} {...{ ...rest, t }} />, onBack: () => {
                    setShowAccount({ isShow: true, step: AccountStep.UpdateAccount });
                }
            },
            [AccountStep.UpdateAccountSigWarning]: {
                view: <UpdateAccSigWarning onTryAnother={() => {
                    myLog('.......UpdateAccountSigWarning..............')
                    goUpdateAccount(false)
                }} {...{
                    ...rest,
                    t
                }} />,
            },
            [AccountStep.UpdateAccountUserDenied]: {
                view: <UpdateAccUserDenied onRetry={() => {
                    myLog('.......UpdateAccountUserDenied..............')
                    goUpdateAccount()
                }} {...{
                    ...rest,
                    t
                }} />,
            },

            // new 
            // deposit
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
            [AccountStep.Transfer_Refused]: {
                view: <Transfer_Refused btnInfo={backToTransferBtnInfo} {...{
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
            [AccountStep.Withdraw_Refused]: {
                view: <Withdraw_Refused btnInfo={backToWithdrawBtnInfo} {...{
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

        })
    }, [addressShort, account, depositProps, etherscanUrl, onCopy, onSwitch, onDisconnect, onViewQRCode, t, rest])

    const current = accountList[isShowAccount.step]

    // myLog('isShowAccount.step:', isShowAccount.step, ' ', AccountStep[isShowAccount.step])

    return <>
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
