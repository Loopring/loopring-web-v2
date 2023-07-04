import { RESULT_INFO } from '@loopring-web/loopring-sdk'
import { TOptions } from 'i18next'
import { useTranslation } from 'react-i18next'
import { useSettings } from '../../stores'
import { L1L2_NAME_DEFINED, MapChainId, SDK_ERROR_MAP_TO_UI } from '@loopring-web/common-resources'

export const TransErrorHelp = ({
  error,
  options = {},
}: {
  error: RESULT_INFO
  options?: TOptions<any> | string
}) => {
  const { t } = useTranslation(['error'])
  const { defaultNetwork } = useSettings()
  const network = MapChainId[defaultNetwork] ?? MapChainId[1]
  const errorItem = SDK_ERROR_MAP_TO_UI[error?.code ?? 700001]
  const _options = { ...errorItem?.options, ...options }
  if (errorItem) {
    return (
      <>
        {t(errorItem.messageKey, {
          ..._options,
          layer2: L1L2_NAME_DEFINED[network].layer2,
          l1ChainName: L1L2_NAME_DEFINED[network].l1ChainName,
          loopringL2: L1L2_NAME_DEFINED[network].loopringL2,
          l2Symbol: L1L2_NAME_DEFINED[network].l2Symbol,
          l1Symbol: L1L2_NAME_DEFINED[network].l1Symbol,
          ethereumL1: L1L2_NAME_DEFINED[network].ethereumL1,
        })}
      </>
    )
  } else {
    return <>{error.message}</>
  }
}
