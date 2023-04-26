import { WithTranslation, withTranslation } from "react-i18next";
import {
  ModalBackButton,
  SwitchPanel,
  SwitchPanelProps,
} from "../../basic-lib";
import { IBData, TRADE_TYPE } from "@loopring-web/common-resources";
import React, { useEffect, useRef } from "react";
import { TransferProps } from "../../tradePanel";
import {
  TradeMenuList,
  TransferWrap,
  useBasicTrade,
} from "../../tradePanel/components";
import { TransferConfirm } from "../../tradePanel/components/TransferConfirm";
import {
  LoopringAPI,
  RootState,
  useAccount,
  useIsHebao,
} from "@loopring-web/core";
import { ContactSelection } from "../../tradePanel/components/ContactSelection";
import {
  createImageFromInitials,
  addressToExWalletMapFn,
} from "@loopring-web/core";
import { debounce } from "lodash";
import { useDispatch, useSelector } from "react-redux";
import { updateContacts } from "@loopring-web/core/src/stores/contacts/reducer";
import { AddressType } from "@loopring-web/loopring-sdk";

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
    type DisplayContact = {
      name: string;
      address: string;
      avatarURL: string;
      editing: boolean;
      addressType: AddressType;
    };
    // const [contacts, setContacts] = React.useState(undefined as DisplayContact[] | undefined);
    const contacts = useSelector((state: RootState) => state.contacts.contacts);
    const dispatch = useDispatch();
    const {
      account: { accountId, apiKey, accAddress },
    } = useAccount();
    const { isHebao } = useIsHebao();

    const throttled = useRef(
      debounce(({ isHebao, contacts, eventTarget }) => {
        const _eventTarget = eventTarget as HTMLDivElement;
        if (
          _eventTarget.scrollTop + _eventTarget.clientHeight >=
          _eventTarget.scrollHeight
        ) {
          if (isHebao === undefined) return;
          LoopringAPI.contactAPI!.getContacts(
            {
              isHebao,
              accountId,
              offset: contacts?.length,
              limit: 10,
            },
            apiKey
          ).then((response) => {
            dispatch(
              updateContacts([
                ...(contacts ? contacts : []),
                ...response.contacts.map((xx) => {
                  return {
                    name: xx.contactName,
                    address: xx.contactAddress,
                    avatarURL: createImageFromInitials(
                      32,
                      xx.contactName,
                      "#FFC178"
                    ),
                    editing: false,
                    addressType: xx.addressType,
                  } as DisplayContact;
                }),
              ])
            );
          });
        }
      }, 1000)
    );

    useEffect(() => {
      if (isHebao === undefined || (contacts && contacts?.length > 0)) return;
      LoopringAPI.contactAPI!.getContacts(
        {
          isHebao,
          accountId,
          limit: 10,
        },
        apiKey
      )
        .then((x: any) => {
          const displayContacts = x.contacts.map((xx: any) => {
            return {
              name: xx.contactName,
              address: xx.contactAddress,
              avatarURL: createImageFromInitials(32, xx.contactName, "#FFC178"), //todo
              editing: false,
              addressType: xx.addressType,
            } as DisplayContact;
          });
          dispatch(updateContacts(displayContacts));
        })
        .catch((e) => {
          dispatch(updateContacts([]));
        });
    }, [isHebao, accountId]);
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
              // const contact = contacts?.find(x => x.address === address)
              // // if (contact) {
              // //   const v = addressToExWalletMapFn(contact.addressType)
              // //   v && rest.handleSureItsLayer2(v)
              // // }
              // && addressToExWalletMapFn(contact?.addressType)

              // addressTo
              // contact?.addressType
              // add
              // address
            }}
            onScroll={(eventTarget) => {
              throttled.current({ isHebao, contacts, eventTarget });
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

    // const props: SwitchPanelProps<string> = {
    //   index: panelIndex, // show default show
    //   panelList: [
    //     {
    //       key: "confirm",
    //       element: React.useMemo(
    //         () => (
    //           <TransferConfirm
    //             {...{
    //               ...rest,
    //               onTransferClick,
    //               type,
    //               tradeData: switchData.tradeData,
    //               isThumb,
    //               handleConfirm,
    //             }}
    //           />
    //         ),
    //         [rest, onTransferClick, type, switchData.tradeData, isThumb]
    //       ),
    //       toolBarItem: (
    //         <ModalBackButton
    //           marginTop={0}
    //           marginLeft={-2}
    //           onBack={() => {
    //             setPanelIndex(1);
    //           }}
    //           {...rest}
    //         />
    //       ),
    //     },
    //     {
    //       key: "trade",
    //       element: React.useMemo(
    //         () => (
    //           // @ts-ignore
    //           <TransferWrap
    //             key={"trade"}
    //             {...{
    //               ...rest,
    //               type,
    //               walletMap,
    //               coinMap,
    //               chargeFeeTokenList: chargeFeeTokenList || [],
    //               tradeData: switchData.tradeData,
    //               onChangeEvent,
    //               isThumb,
    //               disabled: !!rest.disabled,
    //               handleConfirm,
    //               // onTransferClick,
    //               transferBtnStatus,
    //               assetsData,
    //               addrStatus,
    //               isAddressCheckLoading,
    //             }}
    //           />
    //         ),
    //         [
    //           rest,
    //           type,
    //           chargeFeeTokenList,
    //           switchData.tradeData,
    //           onChangeEvent,
    //           isThumb,
    //           onTransferClick,
    //           transferBtnStatus,
    //           assetsData,
    //           addrStatus,
    //           isAddressCheckLoading,
    //         ]
    //       ),
    //       toolBarItem: React.useMemo(
    //         () => (
    //           <>
    //             {onBack ? (
    //               <ModalBackButton
    //                 marginTop={0}
    //                 marginLeft={-2}
    //                 onBack={() => {
    //                   onBack();
    //                 }}
    //                 {...rest}
    //               />
    //             ) : (
    //               <></>
    //             )}
    //           </>
    //         ),
    //         [onBack]
    //       ),
    //     },
    //   ].concat(
    //     type === "TOKEN"
    //       ? ([
    //           {
    //             key: "tradeMenuList",
    //             element: React.useMemo(
    //               () => (
    //                 <TradeMenuList
    //                   {...{
    //                     nonZero: true,
    //                     sorted: true,
    //                     ...rest,
    //                     onChangeEvent,
    //                     walletMap,
    //                     coinMap,
    //                     selected: switchData.tradeData.belong,
    //                     tradeData: switchData.tradeData,
    //                     //oinMap
    //                   }}
    //                 />
    //               ),
    //               [switchData, rest, onChangeEvent]
    //             ),
    //             // toolBarItem: undefined,
    //             toolBarItem: undefined,
    //           },
    //         ] as any)
    //       : []
    //   ),
    // };
    return <SwitchPanel {...{ ...rest, ...props }} />;
  }
) as <T, I>(
  props: TransferProps<T, I> & React.RefAttributes<any>
) => JSX.Element;
