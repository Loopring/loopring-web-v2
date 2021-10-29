import { AccountStatus, NFTInfo, SagaStatus } from '@loopring-web/common-resources'
import { useAccount } from '../../../stores/account'
import React from 'react'
import { LoopringAPI, NFTWholeINFO } from 'api_wrapper'
import { connectProvides } from '@loopring-web/web3-provider';
import { sleep } from '@loopring-web/loopring-sdk';
import { useSystem } from '../../../stores/system';
import { useWalletLayer2 } from '../../../stores/walletLayer2';

export const useMyNFT = () => {
    const [NFTList, setNFTList] = React.useState<any[]>([])
    const {account, status: accountStatus} = useAccount();
    const [isShow, setIsShow] = React.useState(false);
    const [popItem, setPopItem] = React.useState<NFTWholeINFO | undefined>(undefined);
    const { status: walletLayer2Status, nftLayer2 } = useWalletLayer2();

    const {etherscanBaseUrl} = useSystem();

    const onDetailClose = React.useCallback(() => setIsShow(false), [])

    const onDetail = React.useCallback(async (item: any) => {
        //FIX:Hard code = 0xa5A961dD9930C1407C1eB152e3489c1Bcf379E3b
       const nftData = '0x2738e9f9be67ad206da00e7839cdde53481a94340d527081b54776fa3a866a8b'
       const nftInfo =  await  LoopringAPI.nftInfo.getInfoForNFTTokens({nftDatas:
                // [item.tokenAddress]
            [nftData]
        })
        // debugger
        setPopItem({...item,...(nftInfo && nftInfo[nftData])
                ?nftInfo[nftData]:{}})
        setIsShow(true)
    }, [setIsShow])

    React.useEffect(() => {
        if (account.readyState === AccountStatus.ACTIVATED
            && walletLayer2Status == SagaStatus.UNSET) {
            initNFT()
        }
    }, [walletLayer2Status]);
    const initNFT = React.useCallback(async () => {
            let mediaPromise: any[] = [];
            console.log('NFTBalances',nftLayer2)
            for (const {nftId, tokenAddress} of nftLayer2) {
                if( tokenAddress ){
                    mediaPromise.push(LoopringAPI?.contract.getContractNFTMeta({
                        _id: parseInt(nftId??'').toString(),
                        web3: connectProvides.usedWeb3,
                        contractAddress: tokenAddress
                    }))
                }

                // LoopringAPI?.contract.getContractNFTMeta({_id: nftId, web3:connectProvides.usedWeb3,contractAddress: tokenAddress})
            }
            const meta: any[] = await Promise.all(mediaPromise);
            // console.log(meta)
        debugger
            setNFTList(nftLayer2.map((item, index) => {
                return {...item, ...meta[ index ],etherscanBaseUrl}
            }))
            // setNFTList()
        }
        // [
        //            {
        //                source: '',
        //                name: 'xxxxx',
        //                id: 'xxxxx',
        //                timestamp: Date.now(),
        //                hash: 'xxxxxxxxxxxx',
        //                standed: 'xxxxxx',
        //                contractAddress: 'xssssaaaaxx'
        //            },
        //            {
        //                source: '',
        //                name: 'xxxxx',
        //                id: 'xxxxx',
        //                timestamp: Date.now(),
        //                hash: 'xxxxxxxxxxxx',
        //                standed: 'xxxxxx',
        //                contractAddress: 'xssssaaaaxx'
        //            },
        //            {
        //                source: '',
        //                name: 'xxxxx',
        //                id: 'eeffx',
        //                timestamp: Date.now(),
        //                hash: 'xxxxxxxxxxxx',
        //                standed: 'xxxxxx',
        //                contractAddress: 'xssssaaaaxx'
        //            },
        //            {
        //                source: '',
        //                name: 'xxxxx',
        //                id: 'aabbx',
        //                timestamp: Date.now(),
        //                hash: 'xxxxxxxxxxxx',
        //                standed: 'xxxxxx',
        //                contractAddress: 'xssssaaaaxx'
        //            },
        //            {
        //                source: '',
        //                name: 'xxxxx',
        //                id: 'ccddx',
        //                timestamp: Date.now(),
        //                hash: 'xxxxxxxxxxxx',
        //                standed: 'xxxxxx',
        //                contractAddress: 'xssssaaaaxx'
        //            }
        //        ]
        , [nftLayer2])

    return {
        NFTList,
        isShow,
        popItem,
        onDetail,
        etherscanBaseUrl,
        onDetailClose,
    }


}
