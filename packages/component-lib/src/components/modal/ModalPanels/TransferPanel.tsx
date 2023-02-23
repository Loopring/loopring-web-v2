import { WithTranslation, withTranslation } from "react-i18next";
import {
  ModalBackButton,
  SwitchPanel,
  SwitchPanelProps,
} from "../../basic-lib";
import { IBData, TRADE_TYPE } from "@loopring-web/common-resources";
import React, { useEffect }from "react";
import { TransferProps } from "../../tradePanel";
import {
  TradeMenuList,
  TransferWrap,
  useBasicTrade,
} from "../../tradePanel/components";
import { TransferConfirm } from "../../tradePanel/components/TransferConfirm";
import { LoopringAPI, useAccount } from "@loopring-web/core";
import { ContactSelection } from "../../tradePanel/components/ContactSelection";
import { createImageFromInitials } from "@loopring-web/core";

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
      name: string
      address: string
      avatarURL: string
      editing: boolean
    }
    const [contacts, setContacts] = React.useState([] as DisplayContact[]);
    const {
      account: { accountId, apiKey },
    } = useAccount();
    useEffect(() => {
      LoopringAPI.contactAPI!.getContacts({
        isHebao: false,
        accountId
      }, apiKey)
        .then((x: any) => {
          const displayContacts = x.contacts.map((xx: any) => {

            return {
              name: xx.contactName,
              address: xx.contactAddress,
              
              avatarURL: createImageFromInitials(32, xx.contactName, "#FFC178"), //todo
              editing: false
            } as DisplayContact
          })
          setContacts(displayContacts)
        })
    }, [])
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
    }
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
              }
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
    }
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
    }
    const contactSelectionPanel =  {
      key: "contactSelection",
      element: React.useMemo(
        () => (
          // @ts-ignore
          <ContactSelection
            key={"contactSelection"}
            contacts={contacts}
            onSelect={(address) => {
              setPanelIndex(1);
              rest.handleOnAddressChange(address)
            }}
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
      ]
    }


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
