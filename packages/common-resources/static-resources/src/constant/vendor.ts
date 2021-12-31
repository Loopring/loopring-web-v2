import { VendorItem } from "../loopring-interface";

export enum VendorProviders {
  Ramp = "Ramp",
  Banxa = "Banxa",
}

export const vendorList: VendorItem[] = [
  {
    key: VendorProviders.Ramp,
    svgIcon: "RampIcon",
    // handleSelect: () => {},
  },
  {
    key: VendorProviders.Banxa,
    svgIcon: "BanxaIcon",
    // handleSelect: () => {},
  },
];
