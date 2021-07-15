import { useRef } from 'react'

// import Qrcode from 'components/qrcodes/Qrcode'


import { useAccount } from 'stores/account/hook'

import { useGetExchangeInfo, useGetGas, useGetMarkets, useGetTokens } from 'hooks/exchange/useExchangeAPI'

import { useAmmpoolWs } from 'hooks/common/useWebsocketApi'
import { useQuotePageWs } from 'hooks/exchange/useWsAPI'

const DebugPage = () => {

  const {ticker} = useQuotePageWs()

  return (
    <div>
      Debug
      <div>wsdata: {JSON.stringify(ticker)}</div>
    </div>
  )

}

export default DebugPage
