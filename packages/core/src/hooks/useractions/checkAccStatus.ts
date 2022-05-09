import { AccountStatus } from "@loopring-web/common-resources";
import { store } from "../../index";

export function isAccActivated() {
  return store.getState().account.readyState === AccountStatus.ACTIVATED;
}
