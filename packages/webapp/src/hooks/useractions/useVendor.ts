import { VendorItem, VendorProviders } from "@loopring-web/common-resources";

import { useAccount } from "stores/account";
import { RampInstantSDK } from "@ramp-network/ramp-instant-sdk";
import { useSystem } from "../../stores/system";
import { useOpenModals } from "@loopring-web/component-lib";

export const useVendor = () => {
  const { account } = useAccount();
  const {
    allowTrade: { raw_data },
  } = useSystem();
  const legalEnable = (raw_data as any)?.legal?.enable;
  const legalShow = (raw_data as any)?.legal?.show;
  const { setShowDeposit } = useOpenModals();
  const vendorList: VendorItem[] = legalShow
    ? [
        {
          key: VendorProviders.Ramp,
          svgIcon: "RampIcon",
          handleSelect: () => {
            setShowDeposit({ isShow: false });
            if (legalEnable) {
              new RampInstantSDK({
                hostAppName: "Loopring",
                hostLogoUrl: "https://ramp.network/assets/images/Logo.svg",
                swapAsset: "LOOPRING_*",
                userAddress: account.accAddress,
                hostApiKey: "syxdszpr5q6c9vcnuz8sanr77ammsph59umop68d",
              }).show();
            }
          },
        },
        {
          key: VendorProviders.Banxa,
          svgIcon: "BanxaIcon",
          handleSelect: () => {
            if (legalEnable) {
              window.open(
                "https://loopring.banxa.com/iframe?code=1fe263e17175561954c6&buyMode&walletAddress=" +
                  account.accAddress,
                "_blank"
              );
            }
          },
        },
      ]
    : [];
  return { vendorList, vendorForce: undefined };
};
