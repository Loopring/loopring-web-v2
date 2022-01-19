import { VendorProviders } from "../constant/vendor";

export interface VendorItem {
  key: VendorProviders;
  svgIcon: string;
  handleSelect?: (event?: React.MouseEvent) => void;
}
