import React from "react";
import {
  myLog,
  OffRampStatus,
  VendorProviders,
} from "@loopring-web/common-resources";
import { OffFaitCommon, offFaitService, OffOderUIItem } from "./offFaitService";
import { Box } from "@mui/material";
import { Button } from "@loopring-web/component-lib";
import { useTranslation } from "react-i18next";
import { useHistory } from "react-router-dom";
import { store, useModalData } from "../../stores";
import { BanxaCheck, banxaService } from "./banxaService";
import { useLocation } from "react-use";

export * from "./banxaService";
export * from "./offFaitService";

export function useOffFaitModal() {
  const { t } = useTranslation("common");
  const subject = React.useMemo(() => offFaitService.onSocket(), []);
  const [open, setOpen] = React.useState(false);
  const handleClose = () => {
    setOpen(false);
  };
  const { updateOffBanxaData } = useModalData();
  const { href } = useLocation();
  // const {pathname,search}= useLocation()
  // const {  updateTransferBanxaData } = useModalData();
  // const match: any = useRouteMatch("/trade/fiat/:tab?");

  const [order, setOrder] = React.useState<any>({});
  const actionEle = React.useMemo(() => {
    return (
      <Box
        display={"inline-flex"}
        justifyContent={"flex-end"}
        flexDirection={"row-reverse"}
      >
        <Button
          sx={{ marginLeft: 1 }}
          variant={"outlined"}
          size={"medium"}
          color={"primary"}
          onClick={() => {
            updateOffBanxaData({ order });
            banxaService.KYCDone();
            handleClose();
          }}
        >
          {t("labelOrderOpen")}
        </Button>
        <Button
          sx={{ marginLeft: 1 }}
          variant={"text"}
          size={"medium"}
          onClick={() => {
            setOpen(false);
            handleClose();
          }}
        >
          {t("labelOrderCancel")}
        </Button>
      </Box>
    );
  }, [order]);
  const handleShowUI = React.useCallback((props: OffOderUIItem) => {
    if (!/trade\/fiat\/sell\?orderId/gi.test(href ?? "")) {
      setOrder(props.order);
      setOpen(true);
    }
    //todo props.product
  }, []);

  React.useEffect(() => {
    const subscription = subject.subscribe(({ data, status }) => {
      switch (status) {
        case OffFaitCommon.ShowUI:
          if (
            (
              data as {
                order: any;
                orderStatus: OffRampStatus;
                product: VendorProviders;
              }
            ).orderStatus == OffRampStatus.watingForCreateOrder
          ) {
            handleShowUI(data as OffOderUIItem);
          }
          break;
      }
    });
    return () => {
      subscription.unsubscribe();
    };
  }, [subject]);
  return {
    open,
    actionEle,
    handleClose,
  };
}

export const useOffRampHandler = () => {
  const subject = React.useMemo(() => banxaService.onSocket(), []);
  const history = useHistory();

  React.useEffect(() => {
    const subscription = subject.subscribe((props) => {
      myLog("Banxa subscription ", props);
      switch (props.status) {
        case BanxaCheck.OrderHide:
          myLog("Banxa Order OrderHide");
          const {
            _router_modalData: { offBanxaValue },
          } = store.getState();
          if (props.data?.reason == "KYCDone" && offBanxaValue) {
            history.push(`/trade/fiat/sell?orderId=${offBanxaValue.id}`);
          }
          break;
        default:
          break;
      }
    });
    return () => {
      subscription.unsubscribe();
    };
  }, [subject]);
};
