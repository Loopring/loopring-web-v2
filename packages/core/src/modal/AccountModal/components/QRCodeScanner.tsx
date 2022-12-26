import { ImportRedPacketWrap } from "@loopring-web/component-lib";
import { useQrcodeScan } from "../../../services";
import React from "react";
import { myLog } from "@loopring-web/common-resources";

export const ImportRedPacket = () => {
  const ref = React.useRef();
  const handleFailedUpload = React.useCallback((data: any) => {
    myLog("handleFailedUpload", data);
  }, []);
  const handleSuccessUpload = React.useCallback((data: any) => {
    myLog("handleSuccessUpload", data);
  }, []);
  const { h5QrcodeScannerProvides } = useQrcodeScan({
    handleFailedUpload,
    handleSuccessUpload,
  });
  React.useEffect(() => {
    if (ref.current) {
      h5QrcodeScannerProvides.render();
    } else {
      h5QrcodeScannerProvides.clear();
    }
    return () => {
      h5QrcodeScannerProvides.clear();
    };
  }, [ref.current]);
  return <ImportRedPacketWrap ref={ref} />;
};
