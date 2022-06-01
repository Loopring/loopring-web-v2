import { Divider, MenuItem, Radio, TextField, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import styled from "@emotion/styled";
import React, { ForwardedRef } from "react";
import {
  AddressItemType,
  EXCHANGE_TYPE,
  useAddressTypeLists,
  WALLET_TYPE,
} from "@loopring-web/common-resources";
import { MenuItemProps } from "../../basic-lib";
import { useOpenModals } from "../../../stores";

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
}: {
  selectedValue: T | undefined;
  handleSelected: (value: T) => void;
  disabled: boolean;
}) => {
  const { t } = useTranslation("common");
  const { walletList } = useAddressTypeLists<T>();
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

  const onOpen = () => {
    setOpen(true);
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
          walletList.find((item) => item.value === selectedValue)?.label ?? "",
      }}
      label={t("labelL2toL2AddressType")}
      // inputProps={{}}
    >
      {desMenuItem}
      {walletList.map(({ value, label, description, disabled, maxWidth }) => (
        <WalletItemOptions
          key={value}
          value={value}
          myValue={value}
          handleSelected={(value) => {
            handleSelected(value as T);
            onClose();
          }}
          maxWidth={maxWidth}
          selectedValue={selectedValue}
          label={label}
          description={description}
          disabled={disabled}
        />
      ))}
    </TextField>
  );
};

export const WithdrawAddressType = <T extends EXCHANGE_TYPE>({
  selectedValue,
  handleSelected,
  disabled,
}: {
  selectedValue: T | undefined;
  handleSelected: (value: T | any) => void;
  disabled: boolean;
}) => {
  const { t } = useTranslation("common");
  const { nonExchangeList, exchangeList } = useAddressTypeLists<T>();
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
          [...nonExchangeList, ...exchangeList].find(
            (item) => item.value === selectedValue
          )?.label ?? "",
      }}
      label={t("labelL2toL1AddressType")}
      // inputProps={{}}
    >
      <MenuItemStyle disabled={true} value={-1}>
        <Typography component={"span"}>{t("labelExchangeTypeDes")}</Typography>
      </MenuItemStyle>
      <WalletItemOptions
        selectedValue={selectedValue}
        value={nonExchangeList[0].value}
        handleSelected={(value) => {
          handleSelected(value as T);
          onClose();
        }}
        label={nonExchangeList[0].label}
        myValue={nonExchangeList[0].value}
        disabled={nonExchangeList[0].disabled}
        description={nonExchangeList[0].description}
      />
      <Divider />
      {exchangeList.map(({ value, label, description, disabled, maxWidth }) => (
        <WalletItemOptions
          key={value}
          value={value}
          myValue={value}
          handleSelected={async (value) => {
            if (value === EXCHANGE_TYPE.Others) {
              setShowOtherExchange({ isShow: true });
            } else {
              handleSelected(value as T);
              onClose();
            }
          }}
          selectedValue={selectedValue}
          label={label}
          maxWidth={maxWidth}
          description={description}
          disabled={disabled}
        />
      ))}
    </TextField>
  );
};
