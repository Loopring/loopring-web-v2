import {
	AccountStatus,
	CollectionMeta, ErrorType,
	IPFS_HEAD_URL,
	IPFS_LOOPRING_SITE, MINT_LIMIT, myLog,
	SagaStatus, UIERROR_CODE,
} from "@loopring-web/common-resources";
import { collectionService, ipfsService, useBtnStatus, useIPFS, useModalData } from "@loopring-web/core";
import { BigNumber } from "bignumber.js";
import React from "react";
import { useAccount } from "@loopring-web/core";
import { IpfsFile, useToggle } from '@loopring-web/component-lib';
import { useRouteMatch } from 'react-router-dom';
import * as sdk from '@loopring-web/loopring-sdk';
import { AddResult } from 'ipfs-core-types/src/root';

const enum MINT_VIEW_STEP {
	METADATA,
	MINT_CONFIRM,
}

BigNumber.config({EXPONENTIAL_AT: 100});
export const useCollectionPanel = <T extends CollectionMeta>({isEdit = false}: { isEdit?: boolean }) => {
	let match: any = useRouteMatch("/NFT/:item");
	const {toggle: {collectionNFT}} = useToggle();
	const [disabled, _setDisabled] = React.useState(!collectionNFT.enable);
	const {collectionValue, updateCollectionData} = useModalData();
	// const [isLoading, setIsLoading] = React.useState(true);
	const [keys, setKeys] = React.useState<{ [ key: string ]: undefined | IpfsFile }>(() => {
		return isEdit ? {} : {
			banner: undefined,
			name: undefined,
			tileUri: undefined,
			avatar: undefined,
			thumbnail: undefined
		}
	});

	const {account, status: accountStatus} = useAccount();

	const {
		btnStatus,
		btnInfo,
		enableBtn,
		disableBtn,
		setLabelAndParams,
		resetBtnInfo,
		setLoadingBtn,
	} = useBtnStatus();
	const updateBtnStatus = React.useCallback(
		(error?: ErrorType & any) => {
			resetBtnInfo();

			const ipfsProcessing = Reflect.ownKeys(keys).find((key) => keys[ key as string ]?.isProcessing === true);

			if (
				!error &&
				collectionValue &&
				collectionValue.name &&
				collectionValue.tileUri &&
				ipfsProcessing == undefined
			) {
				enableBtn();
				return;
			}
			if (!collectionValue.name) {
				setLabelAndParams("labelCollectionRequiredName", {});
			}
			if (!collectionValue.tileUri) {
				setLabelAndParams("labelCollectionRequiredTileUri", {});
			}

			if (ipfsProcessing) {
				setLoadingBtn();
				return;
			}

			disableBtn();
			myLog("try to disable nftMint btn!");
		},
		[
			keys,
			resetBtnInfo,
			collectionValue,
			disableBtn,
			enableBtn,
			setLabelAndParams,
		]
	);

	React.useEffect(() => {
		updateBtnStatus();
	}, [
		collectionValue,
		updateBtnStatus,
		keys,
	]);

	const handleOnDataChange = React.useCallback((key: string, value: any) => {
		updateCollectionData({...collectionValue, [ key ]: value});
	}, [collectionValue]);


	const onDelete = React.useCallback((key: string) => {
		setKeys((state) => {
			return {
				...state, [ key ]: undefined
			}
		});
		handleOnDataChange(key, undefined)

	}, [handleOnDataChange]);


	const handleFailedUpload = React.useCallback(
		(data: { uniqueId: string; error: sdk.RESULT_INFO }) => {
			setKeys((state) => {
				const key: string = Reflect.ownKeys(state).find((key) => {
					return state[ key as any ]?.uniqueId === data.uniqueId
				}) as string;
				if (key) {
					handleOnDataChange(key, undefined);
					return {
						...state,
						[ key ]: {
							...state[ key ],
							isProcessing: false,
							...{
								error: data.error
									? data.error
									: {
										code: UIERROR_CODE.UNKNOWN,
										message: `Ipfs Error ${data}`,
									},
							}
						} as IpfsFile
					}
				} else {
					return state;
				}

			});
		},
		[handleOnDataChange]
	);
	const handleSuccessUpload = React.useCallback(
		(data: AddResult & { uniqueId: string }) => {
			setKeys((state) => {
				const key: string = Reflect.ownKeys(state).find((key) => {
					return state[ key as any ]?.uniqueId === data.uniqueId
				}) as string;
				if (key) {
					const cid = data.cid.toString();
					handleOnDataChange(key, `${IPFS_HEAD_URL}${data.path}`);
					return {
						...state,
						[ key as any ]: {
							...state[ key as any ],
							...{
								cid: cid,
								fullSrc: `${IPFS_LOOPRING_SITE}${data.path}`,
								isProcessing: false,
							}
						}
					}
				} else {
					return state;
				}
			});
		}, [handleOnDataChange]
	);

	const {ipfsProvides} = useIPFS({
		handleSuccessUpload,
		handleFailedUpload,
	});

	const onFilesLoad = React.useCallback(
		(key: string, value: IpfsFile) => {
			let uniqueId = key + '|' + Date.now();
			value.isUpdateIPFS = true;
			ipfsService.addFile({
				ipfs: ipfsProvides.ipfs,
				file: value.file,
				uniqueId: uniqueId,
			});
			setKeys((state) => {
				return {
					...state, [ key ]: {
						file: value.file,
						isProcessing: true,
						error: undefined,
						uniqueId: uniqueId,
						isUpdateIPFS: true,
						cid: '',
					}
				}
			});
		},
		[ipfsProvides.ipfs]
	);


	React.useEffect(() => {
		if (
			accountStatus === SagaStatus.UNSET &&
			account.readyState === AccountStatus.ACTIVATED &&
			match?.params.item === 'addCollection'
		) {
			collectionService.emptyData();
		}
	}, [accountStatus, account.readyState]);

	return {
		// ipfsProvides,
		// isLoading,
		keys,
		onFilesLoad,
		onDelete,
		btnStatus,
		btnInfo,
		disabled,
		handleOnDataChange,
		collectionValue,
	};
};
