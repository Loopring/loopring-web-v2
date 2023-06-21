export enum VendorProviders {
  Ramp = 'Ramp',
  Banxa = 'Banxa',
}

// export const vendorList: VendorItem[] = [
//   {
//     key: VendorProviders.Ramp,
//     svgIcon: "RampIcon",
//     // handleSelect: () => {},
//   },
//   {
//     key: VendorProviders.Banxa,
//     svgIcon: "BanxaIcon",
//     flag: {
//       startDate: Date.now() - 100, //1649688436000,
//       endDate: 1650844800000,
//       tag: "🔥",
//       highLight: "lableBanxaFeeFree",
//     },
//     // handleSelect: () => {},
//   },
// ];
export const VendorList = {
  Ramp: {
    key: VendorProviders.Ramp,
    svgIcon: 'RampIcon',
    // handleSelect: () => {},
  },
  Banxa: {
    key: VendorProviders.Banxa,
    svgIcon: 'BanxaIcon',
    flag: {
      startDate: 1649635200000,
      endDate: 1650844800000,
      tag: '🔥',
      highLight: 'labelBanxaFeeFree',
    },
    // handleSelect: () => {},
  },
}
