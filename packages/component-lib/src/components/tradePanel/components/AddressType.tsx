import { Box, MenuItem, Radio, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import styled from "@emotion/styled";
import React, { ForwardedRef } from "react";
import {
  AddressItemType,
  EXCHANGE_TYPE,
  WALLET_TYPE,
} from "@loopring-web/common-resources";
import { MenuItemProps, TextField } from "../../basic-lib";
import { useAddressTypeLists, useOpenModals } from "../../../stores";

const MenuItemStyle = styled(MenuItem)<
  MenuItemProps<any> & { maxWidth?: string | number }
>`
  display: flex;
  flex-direction: column;
  height: auto;
  justify-content: center;
  align-items: flex-start;
  max-width: ${({ maxWidth }) => (maxWidth ? maxWidth : "fit-content")};
  .MuiTypography-root {
    white-space: break-spaces;
  }
  //.MuiMenuItem-root {
  //
  //  display: flex;
  //  flex-direction: ;
  //}
` as (
  props: MenuItemProps<any> & { maxWidth?: string | number }
) => JSX.Element;

export const WalletItemOptions = React.memo(
  React.forwardRef(
    <T extends WALLET_TYPE | EXCHANGE_TYPE>(
      {
        description,
        label,
        myValue,
        selectedValue,
        maxWidth,
        disabled = false,
        handleSelected,
      }: {
        myValue: T;
        handleSelected: (value: WALLET_TYPE | EXCHANGE_TYPE) => void;
        selectedValue: T | undefined;
      } & AddressItemType<T>,
      ref: ForwardedRef<any>
    ) => {
      return (
        <MenuItemStyle
          ref={ref}
          disabled={disabled}
          value={myValue}
          maxWidth={maxWidth}
          // onClick={}
          // sx={{ maxWidth: maxWidth ? maxWidth : "fit-content" }}
          onClick={() => {
            handleSelected(myValue);
          }}
        >
          <Typography
            width={"100%"}
            component={"span"}
            display={"inline-flex"}
            alignItems={"center"}
            justifyContent={"space-between"}
          >
            <Typography color={"textPrimary"}>{label}</Typography>
            <Radio
              size={"medium"}
              checked={selectedValue === myValue}
              disabled={disabled}
            />
          </Typography>
          <Typography
            component={"span"}
            whiteSpace={"pre-line"}
            variant={"body2"}
            color={"textSecondary"}
          >
            {description}
          </Typography>
        </MenuItemStyle>
      );
    }
  )
);
export const TransferAddressType = <T extends WALLET_TYPE>({
  selectedValue,
  handleSelected,
  disabled,
  detectedWalletType,
}: {
  selectedValue: WALLET_TYPE | EXCHANGE_TYPE | undefined;
  handleSelected: (value: WALLET_TYPE | EXCHANGE_TYPE) => void;
  disabled: boolean;
  detectedWalletType: WALLET_TYPE;
}) => {
  const { t } = useTranslation("common");
  const { walletListFn } = useAddressTypeLists<T>();
  const desMenuItem = React.useMemo(() => {
    return (
      <MenuItemStyle disabled={true} value={-1}>
        <Typography component={"span"}>{t("labelWalletTypeDes")}</Typography>
      </MenuItemStyle>
    );
  }, [t]);

  const [open, setOpen] = React.useState(false);
  const onClose = () => {
    setOpen(false);
  };
  const {
    setShowOtherExchange,
    modals: { isShowOtherExchange },
  } = useOpenModals();

  React.useEffect(() => {
    if (isShowOtherExchange.agree) {
      handleSelected(EXCHANGE_TYPE.Others);
      onClose();
    }
  }, [isShowOtherExchange.agree]);

  const onOpen = () => {
    setOpen(true);
    setShowOtherExchange({ isShow: false, agree: false });
  };
  // const walletType = WALLET_TYPE.EOA
  return (
    <TextField
      select
      disabled={disabled}
      fullWidth
      variant="outlined"
      value={selectedValue ?? ""}
      SelectProps={{
        open,
        onClose,
        onOpen,
        autoWidth: false,
        renderValue: (selectedValue) =>
          walletListFn(detectedWalletType).find(
            (item) => item.value === selectedValue
          )?.label ?? "",
      }}
      label={t("labelL2toL2AddressType")}
      // inputProps={{}}
    >
      <Box maxWidth={"470px"}>
        {desMenuItem}
        {walletListFn(detectedWalletType).map(
          ({ value, label, description, disabled, maxWidth }) => (
            <WalletItemOptions
              key={value}
              value={value}
              myValue={value}
              handleSelected={(value) => {
                if (value === EXCHANGE_TYPE.Others) {
                  setShowOtherExchange({ isShow: true });
                } else {
                  handleSelected(value as T);
                  onClose();
                }
                // handleSelected(value);
                // onClose();
              }}
              maxWidth={maxWidth}
              selectedValue={selectedValue}
              label={label}
              description={description}
              disabled={disabled}
            />
          )
        )}
      </Box>
    </TextField>
  );
};

export const WithdrawAddressType = <T extends EXCHANGE_TYPE>({
  selectedValue,
  handleSelected,
  disabled,
  detectedWalletType,
}: {
  selectedValue: WALLET_TYPE | EXCHANGE_TYPE | undefined;
  handleSelected: (value: WALLET_TYPE | EXCHANGE_TYPE) => void;
  disabled: boolean;
  detectedWalletType: WALLET_TYPE;
}) => {
  const { t } = useTranslation("common");
  const { walletListFn } = useAddressTypeLists<T>();
  const {
    setShowOtherExchange,
    modals: { isShowOtherExchange },
  } = useOpenModals();
  const [open, setOpen] = React.useState(false);
  const onClose = () => {
    setOpen(false);
  };
  React.useEffect(() => {
    if (isShowOtherExchange.agree) {
      handleSelected(EXCHANGE_TYPE.Others);
      onClose();
    }
  }, [isShowOtherExchange.agree]);

  const onOpen = () => {
    setOpen(true);
    setShowOtherExchange({ isShow: false, agree: false });
  };

  return (
    <TextField
      select
      disabled={disabled}
      fullWidth
      variant="outlined"
      value={selectedValue ?? ""}
      SelectProps={{
        open,
        onClose,
        onOpen,
        autoWidth: false,
        renderValue: (selectedValue) =>
          walletListFn(detectedWalletType).find(
            (item) => item.value === selectedValue
          )?.label ?? "",
      }}
      label={t("labelL2toL1AddressType")}
      // inputProps={{}}
    >
      <Box maxWidth={"470px"}>
        <MenuItemStyle disabled={true} value={-1}>
          <Typography component={"span"}>
            {t("labelExchangeTypeDes")}
          </Typography>
        </MenuItemStyle>
        {walletListFn(detectedWalletType).map(
          ({ value, label, description, disabled, maxWidth }) => (
            <WalletItemOptions
              key={value}
              value={value}
              myValue={value}
              handleSelected={async (value) => {
                if (value === EXCHANGE_TYPE.Others) {
                  setShowOtherExchange({ isShow: true });
                } else {
                  handleSelected(value);
                  onClose();
                }
              }}
              selectedValue={selectedValue}
              label={label}
              maxWidth={maxWidth}
              description={description}
              disabled={disabled}
            />
          )
        )}
      </Box>
    </TextField>
  );
};
