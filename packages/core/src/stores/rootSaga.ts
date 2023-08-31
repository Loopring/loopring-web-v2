import { all } from 'redux-saga/effects'
import { tokenSaga } from './token/saga'
import { ammForks } from './Amm'
import { tickerForks } from './ticker/saga'
import { systemForks } from './system/saga'
import { walletLayer1Fork } from './walletLayer1/saga'
import { walletLayer2Fork } from './walletLayer2/saga'
import { userRewardsForks } from './userRewards/saga'
import { socketForks } from './socket/saga'
import { accountFork } from './account/saga'
import { amountForks } from './amount/saga'
import { tokenPricesSaga } from './tokenPrices/saga'
import { notifyForks } from './notify/saga'
import { walletLayer2NFTFork } from './walletLayer2NFT/saga'
import { layer1ActionHistoryForks } from './localStore/layer1Store/saga'
import { investForks } from './invest'
import { walletL2CollectionFork } from './walletL2Collection/saga'
import { walletL2NFTCollectionFork } from './walletL2NFTCollection/saga'
import { redPacketConfigsSaga } from './redPacket/saga'
import { vaultLayer2Fork } from './vault/saga'

function* mySaga() {
  yield all([
    ...tokenSaga,
    ...tokenPricesSaga,
    ...redPacketConfigsSaga,
    ...walletLayer1Fork,
    ...walletLayer2Fork,
    ...walletLayer2NFTFork,
    ...walletL2CollectionFork,
    ...walletL2NFTCollectionFork,
    ...systemForks,
    ...ammForks,
    ...investForks,
    ...tickerForks,
    ...userRewardsForks,
    ...socketForks,
    ...accountFork,
    ...amountForks,
    ...notifyForks,
    ...layer1ActionHistoryForks,
    ...vaultLayer2Fork,
  ])
}

export default mySaga
