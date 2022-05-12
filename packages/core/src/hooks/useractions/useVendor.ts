import { VendorItem, VendorList } from "@loopring-web/common-resources";

import { useAccount, useSystem } from "../../index";
import { RampInstantSDK } from "@ramp-network/ramp-instant-sdk";
import { useOpenModals } from "@loopring-web/component-lib";

export const useVendor = () => {
  const { account } = useAccount();
  const {
    allowTrade: { raw_data },
  } = useSystem();
  const legalEnable = (raw_data as any)?.legal?.enable;
  const legalShow = (raw_data as any)?.legal?.show;
  const { setShowDeposit } = useOpenModals();
  // url = Uri.Builder()
  //   .scheme("https")
  //   .authority("buy.ramp.network")
  //   .appendQueryParameter("hostAppName", "Loopring")
  //   .appendQueryParameter(
  //     "swapAsset",
  //     "LOOPRING_ETH,LOOPRING_USDC,LOOPRING_LRC"
  //   )
  //   .appendQueryParameter(
  //     "userAddress",
  //     WalletUtil.getCurrentWalletAddress(APP.getInstance())
  //   )
  //   .appendQueryParameter("hostApiKey", "v6955rqfuvny5ts6sjh5y2eedjgc3sobjswhzw65")
  //   .appendQueryParameter("fiatCurrency", "USD")
  //   .appendQueryParameter("fiatValue", depositValue)
  //   .appendQueryParameter("variant", "mobile")
  //   .build()
  //   .toString()
  const vendorList: VendorItem[] = legalShow
    ? [
        {
          // key: VendorProviders.Ramp,
          // svgIcon: "RampIcon",
          ...VendorList.Ramp,
          handleSelect: () => {
            setShowDeposit({ isShow: false });
            if (legalEnable) {
              if (account && account.accountId && account.accountId !== -1) {
                new RampInstantSDK({
                  hostAppName: "Loopring",
                  hostLogoUrl: "https://ramp.network/assets/images/Logo.svg",
                  swapAsset: "LOOPRING_*",
                  userAddress: account.accAddress,
                  hostApiKey: "syxdszpr5q6c9vcnuz8sanr77ammsph59umop68d",
                }).show();
              } else {
                new RampInstantSDK({
                  hostAppName: "Loopring",
                  hostLogoUrl: "https://ramp.network/assets/images/Logo.svg",
                  swapAsset: "LOOPRING_ETH,LOOPRING_USDC,LOOPRING_LRC",
                  userAddress: account.accAddress,
                  hostApiKey: "v6955rqfuvny5ts6sjh5y2eedjgc3sobjswhzw65",
                }).show();
              }
            }
          },
        },
        {
          ...VendorList.Banxa,
          handleSelect: () => {
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
  return { vendorList, vendorForce: undefined };
};
