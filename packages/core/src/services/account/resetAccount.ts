import { resetUserRewards } from "../../stores/userRewards/reducer";
import { reset as resetWalletLayer1 } from "../../stores/walletLayer1/reducer";
import { reset as resetWalletLayer2 } from "../../stores/walletLayer2/reducer";
import { reset as resetwalletLayer2NFT } from "../../stores/walletLayer2NFT/reducer";

import { resetAmount } from "../../stores/amount/reducer";
import { store } from "../../stores";
import { resetTokenPrices } from "../../stores/tokenPrices/reducer";
import { resetTicker } from "../../stores/ticker/reducer";

export function resetLayer12Data() {
  store.dispatch(resetAmount(undefined));
  store.dispatch(resetUserRewards(undefined));
  store.dispatch(resetWalletLayer1(undefined));
  store.dispatch(resetWalletLayer2(undefined));
  store.dispatch(resetwalletLayer2NFT(undefined));
}

export function resetSystemData() {
  store.dispatch(resetTokenPrices(undefined));
  store.dispatch(resetTicker(undefined));
}

export function resetLayer2Data() {
  store.dispatch(resetAmount(undefined));
  store.dispatch(resetUserRewards(undefined));
  store.dispatch(resetWalletLayer2(undefined));
  store.dispatch(resetwalletLayer2NFT(undefined));
}
