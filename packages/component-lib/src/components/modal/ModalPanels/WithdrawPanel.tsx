import { WithTranslation, withTranslation } from "react-i18next";
import {
  ModalBackButton,
  SwitchPanel,
  SwitchPanelProps,
} from "../../basic-lib";
import { WithdrawProps } from "../../tradePanel/Interface";
import { IBData, TRADE_TYPE } from "@loopring-web/common-resources";
import {
  TradeMenuList,
  useBasicTrade,
  WithdrawWrap,
} from "../../tradePanel/components";
import React, { useEffect, useRef } from "react";
import { cloneDeep, debounce } from "lodash";
import { WithdrawConfirm } from "../../tradePanel/components/WithdrawConfirm";
import { ContactSelection } from "../../tradePanel/components/ContactSelection";
import {
  LoopringAPI,
  RootState,
  useAccount,
  useIsHebao,
} from "@loopring-web/core";
import { createImageFromInitials } from "@loopring-web/core";
import { useDispatch, useSelector } from "react-redux";
import { updateContacts } from "@loopring-web/core/src/stores/contacts/reducer";

export const WithdrawPanel = withTranslation(["common", "error"], {
  withRef: true,
})(
  <T extends IBData<I>, I>({
    type = TRADE_TYPE.TOKEN,
    chargeFeeTokenList,
    onWithdrawClick,
    withdrawBtnStatus,
    assetsData,
    walletMap = {},
    coinMap = {},
    onBack,
    isFromContact,
    contact,
    ...rest
  }: WithdrawProps<T, I> & WithTranslation & { assetsData: any[] }) => {
    const { onChangeEvent, index, switchData } = useBasicTrade({
      ...rest,
      coinMap,
      type,
      walletMap,
    });

    const [panelIndex, setPanelIndex] = React.useState(index + 1);
    const handleConfirm = (index: number) => {
      setPanelIndex(index);
    };
    // const hanleConfirm = () => {};
    React.useEffect(() => {
      setPanelIndex(index + 1);
    }, [index]);

    // LP token should not exist in withdraw panel for now
    const getWalletMapWithoutLP = React.useCallback(() => {
      const clonedWalletMap = cloneDeep(walletMap ?? {});
      const keyList = Object.keys(clonedWalletMap);
      keyList.forEach((key) => {
        const [first] = key.split("-");
        if (first === "LP") {
          delete clonedWalletMap[key];
        }
      });
      return clonedWalletMap;
    }, [walletMap]);
    type DisplayContact = {
      name: string;
      address: string;
      avatarURL: string;
      editing: boolean;
    };
    // const [contacts, setContacts] = React.useState([] as DisplayContact[]);
    const dispatch = useDispatch();
    const contacts = useSelector((state: RootState) => state.contacts.contacts);
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
          console.log("dasjkdhakjshdkjashdkjashkjdh");
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
        .then((x) => {
          const displayContacts = x.contacts.map((xx) => {
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
    }, [isHebao]);
    const confirmPanel = {
      key: "confirm",
      element: React.useMemo(
        () => (
          <WithdrawConfirm
            {...{
              ...rest,
              onWithdrawClick,
              type,
              tradeData: switchData.tradeData,
              handleConfirm,
            }}
          />
        ),
        [onWithdrawClick, rest, switchData.tradeData, type]
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
          <WithdrawWrap
            key={"transfer"}
            {...{
              ...rest,
              type,
              handleConfirm,
              chargeFeeTokenList: chargeFeeTokenList ? chargeFeeTokenList : [],
              tradeData: switchData.tradeData,
              onChangeEvent,
              coinMap,
              disabled: !!rest.disabled,
              // onWithdrawClick,
              withdrawBtnStatus,
              assetsData,
              walletMap,

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
          coinMap,
          onWithdrawClick,
          withdrawBtnStatus,
          assetsData,
          walletMap,
        ]
      ),
      toolBarItem: React.useMemo(
        () => (
          <>
            {/* {(onBack && !isFromContact ) ? ( */}
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
              coinMap,
              selected: switchData.tradeData.belong,
              tradeData: switchData.tradeData,
              walletMap: getWalletMapWithoutLP(),
              //oinMap
            }}
          />
        ),
        [switchData, rest, onChangeEvent, getWalletMapWithoutLP]
      ),
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
            onScroll={(eventTarget) => {
              throttled.current({ isHebao, contacts, eventTarget });
            }}
            scrollHeight={"320px"}
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
      index: panelIndex, // show default show
      panelList: [
        confirmPanel,
        tradePanel,
        tokenSelectionPanel,
        contactSelectionPanel,
      ],

      // [
      //   {
      //     key: "confirm",
      //     element: React.useMemo(
      //       () => (
      //         <WithdrawConfirm
      //           {...{
      //             ...rest,
      //             onWithdrawClick,
      //             type,
      //             tradeData: switchData.tradeData,
      //             handleConfirm,
      //           }}
      //         />
      //       ),
      //       [onWithdrawClick, rest, switchData.tradeData, type]
      //     ),
      //     toolBarItem: (
      //       <ModalBackButton
      //         marginTop={0}
      //         marginLeft={-2}
      //         onBack={() => {
      //           setPanelIndex(1);
      //         }}
      //         {...rest}
      //       />
      //     ),
      //   },
      //   {
      //     key: "trade",
      //     element: React.useMemo(
      //       () => (
      //         // @ts-ignore
      //         <WithdrawWrap
      //           key={"transfer"}

      //           {...{
      //             ...rest,
      //             type,
      //             handleConfirm,
      //             chargeFeeTokenList: chargeFeeTokenList
      //               ? chargeFeeTokenList
      //               : [],
      //             tradeData: switchData.tradeData,
      //             onChangeEvent,
      //             coinMap,
      //             disabled: !!rest.disabled,
      //             // onWithdrawClick,
      //             withdrawBtnStatus,
      //             assetsData,
      //             walletMap,
      //             isFromContact,
      //             contact,
      //             onClickContact: () => {
      //               setPanelIndex(2); // todo handle tradeMenuList
      //               // rest.handleOnAddressChange(address)
      //             }
      //           }}
      //         />
      //       ),
      //       [
      //         rest,
      //         type,
      //         chargeFeeTokenList,
      //         switchData.tradeData,
      //         onChangeEvent,
      //         coinMap,
      //         onWithdrawClick,
      //         withdrawBtnStatus,
      //         assetsData,
      //         walletMap,
      //       ]
      //     ),
      //     toolBarItem: React.useMemo(
      //       () => (
      //         <>
      //           {(onBack && !isFromContact) ? (
      //             <ModalBackButton
      //               marginTop={0}
      //               marginLeft={-2}
      //               onBack={() => {
      //                 onBack();
      //               }}
      //               {...rest}
      //             />
      //           ) : (
      //             <></>
      //           )}
      //         </>
      //       ),
      //       [onBack]
      //     ),
      //   },
      //   {
      //     key: "contactSelection",
      //     element: React.useMemo(
      //       () => (
      //         // @ts-ignore
      //         <ContactSelection
      //           key={"contactSelection"}
      //           contacts={contacts}
      //           onSelect={(address) => {
      //             setPanelIndex(1);
      //             rest.handleOnAddressChange(address)
      //           }}
      //         />
      //       ),
      //       [contacts]
      //     ),
      //     toolBarItem: React.useMemo(
      //       () => (
      //         <ModalBackButton
      //           marginTop={0}
      //           marginLeft={-2}
      //           onBack={() => {
      //             setPanelIndex(1);
      //           }}
      //           {...rest}
      //         />
      //       ),
      //       [onBack]
      //     ),
      //   },
      // ].concat(
      //   type === "TOKEN"
      //     ? ([
      //         {
      //           key: "tradeMenuList",
      //           element: React.useMemo(
      //             () => (
      //               <TradeMenuList
      //                 {...{
      //                   nonZero: true,
      //                   sorted: true,
      //                   ...rest,
      //                   onChangeEvent,
      //                   coinMap,
      //                   selected: switchData.tradeData.belong,
      //                   tradeData: switchData.tradeData,
      //                   walletMap: getWalletMapWithoutLP(),
      //                   //oinMap
      //                 }}
      //               />
      //             ),
      //             [switchData, rest, onChangeEvent, getWalletMapWithoutLP]
      //           ),
      //           toolBarItem: undefined,
      //         },
      //       ] as any)
      //     : []
      // ),
    };
    return <SwitchPanel {...{ ...rest, ...props }} />;
  }
) as <T, I>(
  props: WithdrawProps<T, I> & React.RefAttributes<any>
) => JSX.Element;
