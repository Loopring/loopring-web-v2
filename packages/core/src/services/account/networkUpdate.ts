import { cleanLayer2, goErrorNetWork, store } from "../../index";

import { AvaiableNetwork } from "@loopring-web/web3-provider";
import { AccountStatus } from "@loopring-web/common-resources";
import { updateAccountStatus } from "../../stores/account/reducer";
import { updateSystem } from "../../stores/system/reducer";
import { setDefaultNetwork } from "@loopring-web/component-lib";

export const networkUpdate = (): boolean => {
  const { _chainId: accountChainId, readyState } = store.getState().account;
  const { defaultNetwork: userSettingChainId } = store.getState().settings;
  const { chainId: statusChainId } = store.getState().system;
  // accountChainId
  if (readyState !== AccountStatus.UN_CONNECT) {
    if (
      accountChainId !== undefined &&
      AvaiableNetwork.includes(accountChainId.toString())
    ) {
      store.dispatch(updateAccountStatus({ wrongChain: false }));
      store.dispatch(setDefaultNetwork({ chainId: accountChainId }));
      console.log("connected: networkUpdate updateSetting", accountChainId);
      cleanLayer2();
      if (statusChainId !== accountChainId) {
        console.log("connected: networkUpdate updateSystem", accountChainId);
        store.dispatch(updateSystem({ chainId: accountChainId }));
      }
      console.log("connected: networkUpdate");
      return true;
    } else {
      store.dispatch(updateAccountStatus({ wrongChain: true }));
      goErrorNetWork();
      return false;
    }
  } else {
    if (
      statusChainId !== userSettingChainId &&
      AvaiableNetwork.includes(userSettingChainId.toString())
    ) {
      console.log(
        "unconnected: networkUpdate updateSystem",
        userSettingChainId
      );
      store.dispatch(updateSystem({ chainId: userSettingChainId }));
      store.dispatch(
        updateAccountStatus({
          wrongChain: false,
          // _chainId: userSettingChainId
        })
      );
      return true;
    } else {
      store.dispatch(updateAccountStatus({ wrongChain: true }));
      return false;
    }
  }

  // const _chainId = store.getState().system.chainId;
  // if (chainId === "unknown") {
  //   store.dispatch(
  //     updateAccountStatus({ wrongChain: true, _chainId: chainId })
  //   );
  //   goErrorNetWork();
  //   return false;
  // } else if (
  //   chainId !== _chainId &&
  //   _chainId !== "unknown" &&
  //   chainId !== "unknown"
  // ) {
  //   store.dispatch(updateAccountStatus({ _chainId: chainId }));
  //   store.dispatch(updateSystem({ chainId }));
  //   cleanLayer2();
  //   // window.location.reload();
  //   return true;
  // } else {
  //   store.dispatch(
  //     updateAccountStatus({ wrongChain: false, _chainId: chainId })
  //   );
  //   return true;
  // }
};
