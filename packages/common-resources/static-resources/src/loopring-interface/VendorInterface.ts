import { VendorProviders } from "../constant/vendor";

export interface VendorItem {
  key: VendorProviders;
  svgIcon: string;
  flag?: {
    startDate: number;
    endDate: number;
    tag?: string;
    highLight?: string;
  };
  handleSelect?: (event?: React.MouseEvent) => void;
}
