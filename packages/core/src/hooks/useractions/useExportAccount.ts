import React from 'react'

import { AccountStatus } from '@loopring-web/common-resources'
import { useAccount } from '../../index'
import { useTranslation } from 'react-i18next'

export const useExportAccount = <_T>() => {
  const { t } = useTranslation('common')
  const { account } = useAccount()
  const [accountInfo, setAccountInfo] = React.useState({
    address: '',
    accountId: 0,
    level: '',
    nonce: 0 as number | undefined,
    apiKey: '',
    publicX: '',
    publicY: '',
    privateKey: '',
  })
  const [exportAccountToastOpen, setExportAccountToastOpen] = React.useState(false)
  const exportAccountAlertText = t('labelCopyClipBoard')

  React.useEffect(() => {
    if (account.readyState !== AccountStatus.ACTIVATED) {
      return undefined
    }

    const accInfo = {
      address: account.accAddress,
      accountId: account.accountId,
      level: account.level,
      nonce: account.nonce,
      apiKey: account.apiKey,
      publicX: account.eddsaKey.formatedPx,
      publicY: account.eddsaKey.formatedPy,
      privateKey: account.eddsaKey.sk,
    }
    setAccountInfo(accInfo)
  }, [account.readyState, account.nonce])

  const exportAccountProps = {
    accountInfo,
  }

  return {
    exportAccountProps: exportAccountProps,
    exportAccountAlertText,
    exportAccountToastOpen,
    setExportAccountToastOpen,
  }
}
