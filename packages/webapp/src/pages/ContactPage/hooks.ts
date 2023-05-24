import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  LoopringAPI,
  RootState,
  store,
  useAccount,
  useAppDispatch,
  useIsHebao,
  volumeToCount,
  volumeToCountAsBigNumber,
} from "@loopring-web/core";
import { ethers, utils } from "ethers";
import {
  RawDataTransactionItem,
  TransactionStatus,
  useOpenModals,
} from "@loopring-web/component-lib";
import { createImageFromInitials } from "./genAvatar";
import { AddressType, RESULT_INFO } from "@loopring-web/loopring-sdk";
import { useTranslation } from "react-i18next";
import * as sdk from "@loopring-web/loopring-sdk";
import { useRouteMatch } from "react-router";
import { SDK_ERROR_MAP_TO_UI } from "@loopring-web/common-resources";
import { connectProvides } from "@loopring-web/web3-provider";
import { useDebounce } from "react-use";
import { debounce, throttle } from "lodash";
import { updateContacts } from "@loopring-web/core/src/stores/contacts/reducer";
import {
  DefaultRootState,
  RootStateOrAny,
  useDispatch,
  useSelector,
} from "react-redux";
import { useTheme } from "@emotion/react";

export type Contact = {
  name: string;
  address: string;
  addressType?: AddressType;
  // id: string
};
type Network = "L1" | "L2";
const RowHeight = 78;
export const viewHeightRatio = 0.85;
export const viewHeightOffset = 130;
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
const getAllContacts = async (
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

export const useContact = () => {
  const [addOpen, setAddOpen] = React.useState(false);
  const [deleteInfo, setDeleteInfo] = React.useState({
    open: false,
    selected: undefined as Contact | undefined,
  });
  const [sendInfo, setSendInfo] = React.useState({
    open: false,
    selected: undefined as Contact | undefined,
  });
  const [searchValue, setSearchValue] = React.useState("");
  const {
    account: { accountId, apiKey, accAddress },
  } = useAccount();
  const dispatch = useDispatch();
  const contacts = useSelector((state: RootState) => state.contacts.contacts);
  const { t } = useTranslation();
  const [tableHeight] = useState(
    window.innerHeight * viewHeightRatio - viewHeightOffset
  );
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(undefined as number | undefined);
  const [page, setPage] = useState(1);
  const pageSize = Math.floor(tableHeight / RowHeight);
  const pagination = total
    ? {
        page,
        pageSize,
        total,
      }
    : undefined;
  const theme = useTheme();
  const loadContacts = async (offset: number) => {
    if (!apiKey || accountId == -1) {
      return;
    }
    dispatch(updateContacts(undefined));
    setLoading(true);

    try {
      const allContacts = await getAllContacts(
        offset,
        accountId,
        apiKey,
        accAddress,
        theme.colorBase.warning
      );
      dispatch(contacts ? updateContacts(allContacts) : updateContacts([]));
      setTotal(allContacts.length);
    } catch {
      dispatch(updateContacts([]));
    }
    setLoading(false);
  };
  useEffect(() => {
    loadContacts(0);
  }, [accountId, apiKey]);

  const onChangeSearch = React.useCallback((input: string) => {
    setSearchValue(input);
  }, []);
  const onClearSearch = React.useCallback(() => {
    setSearchValue("");
  }, []);
  const onClickEditing = React.useCallback(
    (address: string) => {
      dispatch(
        updateContacts(
          contacts!.map((x) => {
            return {
              ...x,
              editing: x.address === address,
            };
          })
        )
      );
    },
    [contacts]
  );
  const onClickDelete = React.useCallback((address: string, name: string) => {
    setDeleteInfo({
      open: true,
      selected: {
        address,
        name,
      },
    });
  }, []);
  const onCloseDelete = React.useCallback(() => {
    setDeleteInfo({
      open: false,
      selected: undefined,
    });
  }, []);

  const onClickSend = React.useCallback(
    (address: string, name: string, addressType: AddressType) => {
      setSendInfo({
        open: true,
        selected: {
          address,
          name,
          addressType,
        },
      });
    },
    []
  );
  const onCloseSend = React.useCallback(() => {
    setSendInfo({
      open: false,
      selected: undefined,
    });
  }, []);
  const [toastInfo, setToastInfo] = React.useState<{
    open: boolean;
    isSuccess: boolean | undefined;
    type: "Add" | "Delete" | "Edit" | "Send" | "Copy" | undefined;
    customerText?: string;
  }>({
    open: false,
    isSuccess: undefined,
    type: undefined,
  });

  const onInputBlue = React.useCallback(
    async (address: string) => {
      dispatch(
        updateContacts(
          contacts!.map((x) => {
            return {
              ...x,
              editing: false,
            };
          })
        )
      );
      const isHebao = await checkIsHebao(accAddress);
      const found = contacts!.find((x) => x.address === address)!;

      LoopringAPI.contactAPI!.updateContact(
        {
          contactAddress: address,
          isHebao,
          contactName: found.name,
          accountId,
        },
        apiKey
      )
        .then((response) => {
          if (response === true) {
            setToastInfo({
              open: true,
              isSuccess: true,
              type: "Edit",
            });
          } else {
            throw (response.resultInfo as RESULT_INFO).message;
          }
        })
        .catch((e) => {
          setToastInfo({
            open: true,
            isSuccess: false,
            type: "Edit",
          });
        });
    },
    [contacts, apiKey, accAddress]
  );
  const onChangeInput = React.useCallback(
    (address: string, inputValue) => {
      // updateContacts
      dispatch(
        updateContacts(
          contacts!.map((x) => {
            return {
              ...x,
              name: x.address === address ? inputValue : x.name,
            };
          })
        )
      );
    },
    [contacts]
  );
  const [deleteLoading, setDeleteLoading] = React.useState(false);
  const onCloseToast = React.useCallback(() => {
    setToastInfo({
      open: false,
      isSuccess: undefined,
      type: undefined,
    });
  }, []);
  const submitDeleteContact = React.useCallback(
    async (address: string, name: string) => {
      setDeleteLoading(true);
      const isHebao = await checkIsHebao(accAddress);
      LoopringAPI.contactAPI!.deleteContact(
        {
          accountId,
          isHebao,
          contactAddress: address,
          contactName: name,
        },
        apiKey
      )
        .then((response) => {
          if (response === true) {
            loadContacts(0);
            // loadContacts()
            setToastInfo({
              open: true,
              isSuccess: true,
              type: "Delete",
            });
            setDeleteInfo({
              open: false,
              selected: undefined,
            });
          } else {
            throw (response.resultInfo as RESULT_INFO).message;
          }
        })
        .catch((e) => {
          setToastInfo({
            open: true,
            isSuccess: false,
            type: "Delete",
          });
        })
        .finally(() => {
          setDeleteLoading(false);
        });
    },
    [apiKey]
  );
  const [addLoading, setAddLoading] = React.useState(false);
  const submitAddContact = React.useCallback(
    async (
      address: string,
      name: string,
      callBack: (success: boolean) => void
    ) => {
      setAddLoading(true);
      const isHebao = await checkIsHebao(accAddress);
      LoopringAPI.contactAPI!.createContact(
        {
          accountId,
          isHebao,
          contactAddress: address,
          contactName: name,
        },
        apiKey
      )
        .then(async (response) => {
          await LoopringAPI.walletAPI
            ?.getWalletType({
              wallet: address,
            })
            .then((response2) => {
              let addressType: AddressType | undefined = undefined;
              if (response2.walletType?.loopringWalletContractVersion) {
                const map: [string, AddressType][] = [
                  ["V2_1_0", AddressType.LOOPRING_HEBAO_CONTRACT_2_1_0],
                  ["V2_0_0", AddressType.LOOPRING_HEBAO_CONTRACT_2_0_0],
                  ["V1_2_0", AddressType.LOOPRING_HEBAO_CONTRACT_1_2_0],
                  ["V1_1_6", AddressType.LOOPRING_HEBAO_CONTRACT_1_1_6],
                ];
                addressType = map.find(
                  (x) =>
                    x[0] === response2.walletType?.loopringWalletContractVersion
                )![1];
              } else if (response2.walletType?.isInCounterFactualStatus) {
                addressType = AddressType.LOOPRING_HEBAO_CF;
              } else if (response2.walletType?.isContract) {
                addressType = AddressType.CONTRACT;
              }
              if (addressType) {
                return LoopringAPI.contactAPI
                  ?.updateContact(
                    {
                      accountId: accountId,
                      isHebao,
                      addressType: addressType,
                      contactAddress: address,
                      contactName: name,
                    },
                    apiKey
                  )
                  .then((x) => {
                    dispatch(
                      updateContacts(
                        contacts?.map((x) => {
                          if (x.address === address) {
                            return { ...x, addressType };
                          } else {
                            return x;
                          }
                        })
                      )
                    );
                  });
              }
            });
          if (response === true) {
            loadContacts(total ?? 0);
            setToastInfo({
              open: true,
              isSuccess: true,
              type: "Add",
            });
            setAddOpen(false);
            callBack(true);
          } else {
            throw (response.resultInfo as RESULT_INFO).message;
          }
        })
        .catch((e) => {
          if (e === "contact already existed") {
            callBack(false);
            setToastInfo({
              open: true,
              isSuccess: false,
              type: "Add",
              customerText: t("labelContactsContactExisted"),
            });
          } else {
            callBack(false);
            setToastInfo({
              open: true,
              isSuccess: false,
              type: "Add",
            });
          }
        })
        .finally(() => {
          setAddLoading(false);
        });
    },
    [apiKey]
  );

  const onPageChange = React.useCallback((page: number) => {
    setSearchValue("");
    setPage(page);
  }, []);
  const showPagination = total !== undefined && searchValue === "";

  return {
    contacts:
      contacts &&
      (searchValue === ""
        ? contacts.slice(
            (page - 1) * pageSize,
            page * pageSize >= contacts.length
              ? contacts.length
              : page * pageSize
          )
        : contacts.filter((x) => {
            return (
              x.address.toLowerCase().includes(searchValue.toLowerCase()) ||
              x.name.toLowerCase().includes(searchValue.toLowerCase())
            );
            // ? x.address.toLowerCase().includes(searchValue.toLowerCase()) || x.name.toLowerCase().includes(searchValue.toLowerCase())
            // : true
          })),
    onClickEditing,
    onChangeInput,
    onInputBlue,
    onChangeSearch,
    onClearSearch,
    searchValue,
    toastInfo,
    setToastInfo,
    onCloseToast,

    onClickDelete,
    deleteInfo,
    onCloseDelete,
    submitDeleteContact,
    deleteLoading,

    addOpen,
    setAddOpen,
    addLoading,
    submitAddContact,

    onClickSend,
    onCloseSend,
    sendInfo,

    pagination,
    onPageChange,
    loading,
    showPagination,
    // onScroll
  };
};
export const useContactAdd = () => {
  const [addLoading, setAddLoading] = React.useState(false);
  const [addAddress, setAddAddress] = React.useState("");
  const [addName, setAddName] = React.useState("");
  const [toastStatus, setToastStatus] = React.useState(
    "Succuss" as "Succuss" | "Error" | "Init"
  );

  const {
    account: { accountId, apiKey },
  } = useAccount();

  const onChangeName = React.useCallback((input: string) => {
    if (new TextEncoder().encode(input).length <= 48) {
      setAddName(input);
    }
  }, []);

  const [ensResolvedAddress, setEnsResolvedAddress] = useState(
    undefined as undefined | false | string
  );
  const addButtonDisable =
    (!utils.isAddress(addAddress) && !ensResolvedAddress) || addName === "";
  const debounceCheckEns = debounce((input: string) => {
    (connectProvides.usedWeb3
      ? connectProvides.usedWeb3.eth.ens.getAddress(input)
      : Promise.reject("no web3")
    )
      .then((addressResovled: string) => {
        setEnsResolvedAddress(addressResovled);
      })
      .catch((e) => {
        setEnsResolvedAddress(false);
      });
  }, 100);

  const onChangeAddress = React.useCallback((input: string) => {
    debounceCheckEns(input);
    setAddAddress(input);
  }, []);
  const addShowInvalidAddress =
    addAddress !== "" &&
    !utils.isAddress(addAddress) &&
    ensResolvedAddress === false;

  const displayEnsResolvedAddress =
    ensResolvedAddress !== undefined && ensResolvedAddress !== false
      ? ensResolvedAddress
      : undefined;

  return {
    addLoading,
    setAddLoading,
    addAddress,
    onChangeAddress,
    addName,
    onChangeName,
    toastStatus,
    setToastStatus,
    addShowInvalidAddress,
    addButtonDisable,
    displayEnsResolvedAddress,
    // submitAddingContact,
  };
};

export const useContactSend = () => {
  const [sendNetwork, setSendNetwork] = React.useState("L1" as Network);
  const { setShowTransfer, setShowWithdraw } = useOpenModals();
  const submitSendingContact = React.useCallback(
    (contact: Contact, network: Network, onClose: () => void) => {
      if (network === "L1") {
        setShowWithdraw({
          isShow: true,
          address: contact.address,
          name: contact.name,
          addressType: contact.addressType,
          symbol: "ETH",
          info: {
            onCloseCallBack: onClose,
          },
        });
      } else {
        setShowTransfer({
          isShow: true,
          address: contact.address,
          name: contact.name,
          addressType: contact.addressType,
          symbol: "ETH",
          info: {
            onCloseCallBack: onClose,
          },
        });
      }
    },
    []
  );

  return {
    submitSendingContact,
    sendNetwork,
    setSendNetwork,
  };
};

type TxsFilterProps = {
  // accountId: number;
  tokenSymbol?: string;
  start?: number;
  end?: number;
  offset?: number;
  limit?: number;
  types?: sdk.UserTxTypes[] | string;
};

export function useTransactions() {
  const {
    account: { accountId, apiKey },
  } = useAccount();
  const { tokenMap } = store.getState().tokenMap;
  const { t } = useTranslation(["error"]);
  const [txs, setTxs] = useState<RawDataTransactionItem[]>([]);
  const [txsTotal, setTxsTotal] = useState(0);
  const [showLoading, setShowLoading] = useState(false);
  // const [showLoading, setShowLoading] = user(false);
  const routeMatch = useRouteMatch();
  // routeMatch.params[0]

  const getTxnStatus = (status: string) => {
    return status === ""
      ? TransactionStatus.processing
      : status === "PROCESSED"
      ? TransactionStatus.processed
      : status === "PROCESSING"
      ? TransactionStatus.processing
      : status === "RECEIVED"
      ? TransactionStatus.received
      : TransactionStatus.failed;
  };

  const getUserTxnList = useCallback(
    async ({
      tokenSymbol,
      start,
      end,
      limit,
      offset,
      types,
    }: TxsFilterProps) => {
      const address = routeMatch.params[0];
      const tokenId = tokenSymbol ? tokenMap[tokenSymbol!].tokenId : undefined;
      const response = await LoopringAPI.userAPI!.getUserBills(
        {
          accountId,
          tokenSymbol,
          tokenId,
          fromAddress: address,
          transferAddress: address,
          start,
          end,
          limit,
          offset,
          // @ts-ignore
          billType: "1,2,4",
        },
        apiKey
      );
      if (
        (response as sdk.RESULT_INFO).code ||
        (response as sdk.RESULT_INFO).message
      ) {
        const errorItem =
          SDK_ERROR_MAP_TO_UI[(response as sdk.RESULT_INFO)?.code ?? 700001];
        // setToastOpen({
        //   open: true,
        //    type: ToastType.error,
        //   content:
        //     "error : " + errorItem
        //       ? t(errorItem.messageKey)
        //       : (response as sdk.RESULT_INFO).message,
        // });
      } else {
        const formattedList: RawDataTransactionItem[] = (
          response as any
        ).raw_data.bills.map((o: any) => {
          const feePrecision = tokenMap
            ? tokenMap[o.tokenF].precision
            : undefined;
          return {
            ...o,
            txType: o.billType,
            side: o.billType as any,
            amount: {
              unit: o.token || "",
              value: Number(volumeToCount(o.token, o.amount)),
            },
            fee: {
              unit: o.tokenF || "",
              value: Number(volumeToCountAsBigNumber(o.tokenF, o.amountF || 0)),
            },
            memo: o.memo || "",
            time: o.timestamp,
            txnHash: o.hash,
            status: getTxnStatus(o.status),
            feePrecision: feePrecision,
            receiverAddress: o.to,
            senderAddress: o.from,
          } as RawDataTransactionItem;
        });
        setTxs(formattedList);

        setTxsTotal(response.totalNum);
        setShowLoading(false);
      }
      // .then(x => {

      //   debugger
      // })
      // .catch(x => {
      //   debugger
      // })

      // if (LoopringAPI && LoopringAPI.userAPI && accountId && apiKey) {
      //   setShowLoading(true);
      //   const response = await LoopringAPI.userAPI.getUserTxs(
      //     {
      //       accountId,
      //       limit,
      //       tokenSymbol,
      //       start,
      //       end,
      //       offset,
      //       types,
      //     },
      //     apiKey
      //   );
      //   if (
      //     (response as sdk.RESULT_INFO).code ||
      //     (response as sdk.RESULT_INFO).message
      //   ) {
      //     const errorItem =
      //       SDK_ERROR_MAP_TO_UI[(response as sdk.RESULT_INFO)?.code ?? 700001];
      //     setToastOpen({
      //       open: true,
      //        type: ToastType.error,
      //       content:
      //         "error : " + errorItem
      //           ? t(errorItem.messageKey)
      //           : (response as sdk.RESULT_INFO).message,
      //     });
      //   } else {
      //     const formattedList: RawDataTransactionItem[] = response.userTxs.map(
      //       (o) => {
      //         const feePrecision = tokenMap
      //           ? tokenMap[o.feeTokenSymbol].precision
      //           : undefined;
      //         return {
      //           ...o,
      //           side: o.txType as any,
      //           amount: {
      //             unit: o.symbol || "",
      //             value: Number(volumeToCount(o.symbol, o.amount)),
      //           },
      //           fee: {
      //             unit: o.feeTokenSymbol || "",
      //             value: Number(
      //               volumeToCountAsBigNumber(o.feeTokenSymbol, o.feeAmount || 0)
      //             ),
      //           },
      //           memo: o.memo || "",
      //           time: o.timestamp,
      //           txnHash: o.hash,
      //           status: getTxnStatus(o.status),
      //           feePrecision: feePrecision,
      //         } as RawDataTransactionItem;
      //       }
      //     );
      //     setTxs(formattedList);
      //     setTxsTotal(response.totalNum);
      //     setShowLoading(false);
      //   }
      // }
    },
    [accountId, apiKey, t, tokenMap]
  );

  return {
    txs,
    txsTotal,
    showLoading,
    getUserTxnList,
  };
}
