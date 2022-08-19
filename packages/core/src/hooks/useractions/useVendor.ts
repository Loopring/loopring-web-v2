import { VendorItem, VendorList } from "@loopring-web/common-resources";

import { useAccount, useSystem } from "../../index";
import { RampInstantSDK } from "@ramp-network/ramp-instant-sdk";
import { useOpenModals } from "@loopring-web/component-lib";
import React from "react";

export const useVendor = () => {
  const { account } = useAccount();
  const {
    allowTrade: { raw_data },
  } = useSystem();
  const legalEnable = (raw_data as any)?.legal?.enable;
  const legalShow = (raw_data as any)?.legal?.show;
  const { setShowAccount } = useOpenModals();

  // const { isMobile } = useSettings();
  const [instance, setInstance] = React.useState<RampInstantSDK>(() => {
    let config: any = {
      hostAppName: "Loopring",
      hostLogoUrl: "https://ramp.network/assets/images/Logo.svg",
      userAddress: account.accAddress,
      defaultFlow: "ONRAMP",
      enabledFlows: ["OFFRAMP", "ONRAMP"],
    };
    if (account && account.accountId && account.accountId !== -1) {
      config = {
        ...config,
        swapAsset: "LOOPRING_*",
        hostApiKey: "r6e232on45rt3ukdb7zbcvh3avdwbqpore5rbht7",
      };
    } else {
      config = {
        ...config,
        swapAsset: "LOOPRING_ETH,LOOPRING_USDC,LOOPRING_LRC",
        hostApiKey: "xqh8ej6ye2rpoj528xd6rkghsgmyrk4hxb7kxarz",
      };
    }
    return new RampInstantSDK({
      ...config,
    }); //.show();
  });
  React.useEffect(() => {
    setInstance((state) => {
      if (state) {
        state.unsubscribe("*", () => undefined);
      }
      let config: any = {
        hostAppName: "Loopring",
        hostLogoUrl: "https://ramp.network/assets/images/Logo.svg",
        userAddress: account.accAddress,
        defaultFlow: "ONRAMP",
        enabledFlows: ["OFFRAMP", "ONRAMP"],
      };
      if (account && account.accountId && account.accountId !== -1) {
        config = {
          ...config,
          swapAsset: "LOOPRING_*",
          hostApiKey: "r6e232on45rt3ukdb7zbcvh3avdwbqpore5rbht7",
        };
      } else {
        config = {
          ...config,
          swapAsset: "LOOPRING_ETH,LOOPRING_USDC,LOOPRING_LRC",
          hostApiKey: "xqh8ej6ye2rpoj528xd6rkghsgmyrk4hxb7kxarz",
        };
      }
      return new RampInstantSDK({
        ...config,
      }); //.show();
    });
    return () => {
      if (instance) {
        instance.unsubscribe("*", () => undefined);
      }
    };
  }, [account?.accountId]);
  const vendorListBuy: VendorItem[] = legalShow
    ? [
        {
          // key: VendorProviders.Ramp,
          // svgIcon: "RampIcon",
          ...VendorList.Ramp,
          handleSelect: () => {
            setShowAccount({ isShow: false });
            if (legalEnable) {
              instance.show();
            }
          },
        },
        {
          ...VendorList.Banxa,
          handleSelect: () => {
            setShowAccount({ isShow: false });
            if (legalEnable) {
              window.open(
                "https://loopring.banxa.com/iframe?code=1fe263e17175561954c6&buyMode&walletAddress=" +
                  account.accAddress,
                "_blank"
              );
              window.opener = null;
            }
          },
        },
      ]
    : [];
  const vendorListSell: VendorItem[] = legalShow
    ? [
        {
          // key: VendorProviders.Ramp,
          // svgIcon: "RampIcon",
          ...VendorList.Ramp,
          handleSelect: () => {
            setShowAccount({ isShow: false });
            if (legalEnable) {
              instance.show();
            }
          },
        },
        // {
        //   ...VendorList.Banxa,
        //   handleSelect: () => {
        //     setShowAccount({ isShow: false });
        //     if (legalEnable) {
        //       window.open(
        //         "https://loopring.banxa.com/iframe?code=1fe263e17175561954c6&buyMode&walletAddress=" +
        //         account.accAddress,
        //         "_blank"
        //       );
        //       window.opener = null;
        //     }
        //   },
        // },
      ]
    : [];
  return { vendorListBuy, vendorListSell, vendorForce: undefined };
};

// export const useVendorSell = () => {
//   const { account } = useAccount();
//   const {
//     allowTrade: { raw_data },
//   } = useSystem();
//   const legalEnable = (raw_data as any)?.legal?.enable;
//   const legalShow = (raw_data as any)?.legal?.show;
//   const { setShowAccount } = useOpenModals();
//
//
//   return { vendorList, vendorForce: undefined };
// };
