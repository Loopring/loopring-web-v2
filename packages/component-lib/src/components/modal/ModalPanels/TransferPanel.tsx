import { WithTranslation, withTranslation } from "react-i18next";
import {
  ModalBackButton,
  SwitchPanel,
  SwitchPanelProps,
} from "../../basic-lib";
import { IBData, TRADE_TYPE } from "@loopring-web/common-resources";
import React from "react";
import { TransferProps } from "../../tradePanel";
import {
  TradeMenuList,
  TransferWrap,
  useBasicTrade,
} from "../../tradePanel/components";
import { TransferConfirm } from "../../tradePanel/components/TransferConfirm";
import { LoopringAPI, RootState, useAccount } from "@loopring-web/core";
import { ContactSelection } from "../../tradePanel/components/ContactSelection";
import { createImageFromInitials } from "@loopring-web/core";
import { useDispatch, useSelector } from "react-redux";
import { updateContacts } from "@loopring-web/core/src/stores/contacts/reducer";
import { AddressType } from "@loopring-web/loopring-sdk";
import { useTheme } from "@emotion/react";

const checkIsHebao = (accountAddress: string) =>
  LoopringAPI.walletAPI!.getWalletType({
    wallet: accountAddress,
  }).then((walletType) => {
    return walletType?.walletType?.loopringWalletContractVersion !== "";
  });
type DisplayContact = {
  name: string;
  address: string;
  avatarURL: string;
  editing: boolean;
  addressType: AddressType;
};
export const getAllContacts = async (
  offset: number,
  accountId: number,
  apiKey: string,
  accountAddress: string,
  color: string
) => {
  const limit = 100;
  const recursiveLoad = async (offset: number): Promise<DisplayContact[]> => {
    const isHebao = await checkIsHebao(accountAddress);
    const response = await LoopringAPI.contactAPI!.getContacts(
      {
        isHebao,
        accountId,
        limit,
        offset,
      },
      apiKey
    );
    const displayContacts = response.contacts
      .filter((contact) => contact.addressType !== AddressType.OFFICIAL)
      .map((contact) => {
        return {
          name: contact.contactName,
          address: contact.contactAddress,
          avatarURL: createImageFromInitials(32, contact.contactName, color),
          editing: false,
          addressType: contact.addressType,
        } as DisplayContact;
      });
    if (response.total > offset + limit) {
      const rest = await recursiveLoad(offset + limit);
      return displayContacts.concat(rest);
    } else {
      return displayContacts;
    }
  };
  return recursiveLoad(offset);
};

export const TransferPanel = withTranslation(["common", "error"], {
  withRef: true,
})(
  <T extends IBData<I>, I>({
    walletMap = {},
    coinMap = {},
    isThumb = true,
    type = TRADE_TYPE.TOKEN,
    chargeFeeTokenList,
    onTransferClick,
    transferBtnStatus,
    assetsData,
    addrStatus,
    isAddressCheckLoading,
    onBack,
    isFromContact,
    contact,
    ...rest
  }: TransferProps<T, I> & WithTranslation & { assetsData: any[] }) => {
    const { onChangeEvent, index, switchData } = useBasicTrade({
      ...rest,
      walletMap,
      coinMap,
      type,
    });
    const [panelIndex, setPanelIndex] = React.useState(index + 1);
    const handleConfirm = (index: number) => {
      setPanelIndex(index);
    };
    // const hanleConfirm = () => {};
    React.useEffect(() => {
      setPanelIndex(index + 1);
    }, [index]);
    const contacts = useSelector((state: RootState) => state.contacts.contacts);
    const dispatch = useDispatch();
    const {
      account: { accountId, apiKey, accAddress },
    } = useAccount();
    const theme = useTheme();
    const loadContacts = async () => {
      dispatch(updateContacts(undefined));
      try {
        const allContacts = await getAllContacts(
          0,
          accountId,
          apiKey,
          accAddress,
          theme.colorBase.warning
        );
        dispatch(updateContacts(allContacts));
      } catch (e) {
        dispatch(updateContacts([]));
      }
    };
    React.useEffect(() => {
      loadContacts();
    }, [accountId]);
    const confirmPanel = {
      key: "confirm",
      element: React.useMemo(
        () => (
          <TransferConfirm
            {...{
              ...rest,
              onTransferClick,
              type,
              tradeData: switchData.tradeData,
              isThumb,
              handleConfirm,
            }}
          />
        ),
        [rest, onTransferClick, type, switchData.tradeData, isThumb]
      ),
      toolBarItem: (
        <ModalBackButton
          marginTop={0}
          marginLeft={-2}
          onBack={() => {
            setPanelIndex(1);
          }}
          {...rest}
        />
      ),
    };
    const tradePanel = {
      key: "trade",
      element: React.useMemo(
        () => (
          // @ts-ignore
          <TransferWrap
            key={"trade"}
            {...{
              ...rest,
              type,
              walletMap,
              coinMap,
              chargeFeeTokenList: chargeFeeTokenList || [],
              tradeData: switchData.tradeData,
              onChangeEvent,
              isThumb,
              disabled: !!rest.disabled,
              handleConfirm,
              // onTransferClick,
              transferBtnStatus,
              assetsData,
              addrStatus,
              isAddressCheckLoading,
              isFromContact,
              contact,
              onClickContact: () => {
                setPanelIndex(3); // todo handle tradeMenuList
                // rest.handleOnAddressChange(address)
              },
            }}
          />
        ),
        [
          rest,
          type,
          chargeFeeTokenList,
          switchData.tradeData,
          onChangeEvent,
          isThumb,
          onTransferClick,
          transferBtnStatus,
          assetsData,
          addrStatus,
          isAddressCheckLoading,
        ]
      ),
      toolBarItem: React.useMemo(
        () => (
          <>
            {onBack ? (
              <ModalBackButton
                marginTop={0}
                marginLeft={-2}
                onBack={() => {
                  onBack();
                }}
                {...rest}
              />
            ) : (
              <></>
            )}
          </>
        ),
        [onBack]
      ),
    };
    const tokenSelectionPanel = {
      key: "tradeMenuList",
      element: React.useMemo(
        () => (
          <TradeMenuList
            {...{
              nonZero: true,
              sorted: true,
              ...rest,
              onChangeEvent,
              walletMap,
              coinMap,
              selected: switchData.tradeData.belong,
              tradeData: switchData.tradeData,
              //oinMap
            }}
          />
        ),
        [switchData, rest, onChangeEvent]
      ),
      // toolBarItem: undefined,
      toolBarItem: undefined,
    };
    const contactSelectionPanel = {
      key: "contactSelection",
      element: React.useMemo(
        () => (
          <ContactSelection
            key={"contactSelection"}
            contacts={contacts}
            onSelect={(address) => {
              setPanelIndex(1);
              rest.handleOnAddressChange(address, true);
            }}
            scrollHeight={"380px"}
          />
        ),
        [contacts]
      ),
      toolBarItem: React.useMemo(
        () => (
          <ModalBackButton
            marginTop={0}
            marginLeft={-2}
            onBack={() => {
              setPanelIndex(1);
            }}
            {...rest}
          />
        ),
        [onBack]
      ),
    };
    const props: SwitchPanelProps<string> = {
      index: panelIndex,
      panelList: [
        confirmPanel,
        tradePanel,
        tokenSelectionPanel,
        contactSelectionPanel,
      ],
    };

    return <SwitchPanel {...{ ...rest, ...props }} />;
  }
) as <T, I>(
  props: TransferProps<T, I> & React.RefAttributes<any>
) => JSX.Element;
