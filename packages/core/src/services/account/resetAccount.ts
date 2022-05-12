import { resetUserRewards } from "../../stores/userRewards/reducer";
import { reset as resetWalletLayer1 } from "../../stores/walletLayer1/reducer";
import { reset as resetWalletLayer2 } from "../../stores/walletLayer2/reducer";
import { resetAmount } from "../../stores/amount/reducer";
import { store } from "../../stores";

export function resetLayer12Data() {
  store.dispatch(resetAmount(undefined));
  store.dispatch(resetUserRewards(undefined));
  store.dispatch(resetWalletLayer1(undefined));
  store.dispatch(resetWalletLayer2(undefined));
}

export function resetLayer2Data() {
  store.dispatch(resetAmount(undefined));
  store.dispatch(resetUserRewards(undefined));
  store.dispatch(resetWalletLayer2(undefined));
}
