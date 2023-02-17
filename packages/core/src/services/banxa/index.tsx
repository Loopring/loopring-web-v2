import React from "react";
import { OffRampStatus, VendorProviders } from "@loopring-web/common-resources";
import { OffFaitCommon, offFaitService, OffOderUIItem } from "./offFaitService";
import { Box } from "@mui/material";
import { Button } from "@loopring-web/component-lib";
import { useTranslation } from "react-i18next";
import { useHistory } from "react-router-dom";
import { useModalData } from "../../stores";
import { banxaService } from "./banxaService";
import { useLocation } from "react-use";

export * from "./banxaService";
export * from "./offFaitService";

export function useOffFaitModal() {
  const { t } = useTranslation("common");
  const subject = React.useMemo(() => offFaitService.onSocket(), []);
  const history = useHistory();
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
            history.push(`/trade/fiat/sell?orderId=${order.id}`);
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
