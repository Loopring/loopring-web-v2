import { AccountStatus, NFTInfo, SagaStatus } from '@loopring-web/common-resources'
import { useAccount } from '../../../stores/account'
import React from 'react'
import { LoopringAPI, NFTWholeINFO } from 'api_wrapper'
import { connectProvides } from '@loopring-web/web3-provider';
import { sleep } from '@loopring-web/loopring-sdk';
import { useSystem } from '../../../stores/system';

export const useMyNFT = () => {
    const [NFTList, setNFTList] = React.useState<any[]>([])
    const {account, status: accountStatus} = useAccount();
    const [isShow, setIsShow] = React.useState(false);
    const [popItem, setPopItem] = React.useState<NFTWholeINFO | undefined>(undefined);
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
        if (accountStatus === SagaStatus.UNSET && account.readyState === AccountStatus.ACTIVATED) {
            initNFT()
        }
    }, [accountStatus]);
    const initNFT = React.useCallback(async () => {
            // LoopringAPI.getContractNFTMeta
            let userNFTBalances:any[]  = []
            if(LoopringAPI.userAPI) {
                userNFTBalances =  (await LoopringAPI.userAPI
                    .getUserNFTBalances({accountId: account.accountId}, account.apiKey)).userNFTBalances
                console.log('NFTBalances',userNFTBalances)
            }
            await sleep(1000);
            let mediaPromise: any[] = [];
            // const demo = [{"nftId": "1", tokenAddress: '0x46f101f3b08a6156e8f3553945500e1f62e72a37'},
            //     {"nftId": "1", tokenAddress: '0xa8cf067c340b1b1851737f85bf04baea3156c870'},
            //     {"nftId": "122", tokenAddress: '0x942c4199312902b45e8032051ebad08be34a318c'}
            // ]
            // const demo = [{
            //     "tokenAddress": "0x64d9317f43b816c905ea09e4198b4f92ce89dc8c",
            //     tokenId: 32769,
            //     "nftData": "0x25111f604bef74ff6e7094e408783d0b232a4df5200d8a671157911086443ef0",
            //     "nftId": "139414297126165134441448130901307428303546258629632697827333",
            //     "total": "1"
            // }, {
            //     "tokenAddress": "0x64d9317f43b816c905ea09e4198b4f92ce89dc8c",
            //     tokenId: 32729,
            //     "nftData": "0x1928118fb21747b59e42af46bfab9c8d47fdbd391f231fa1fb6050d4ddbcb942",
            //     "nftId": "139414297126165134441448130901307428303546258629632697827335",
            //     "total": "1"
            // }, {
            //     "tokenAddress": "0x64d9317f43b816c905ea09e4198b4f92ce89dc8c",
            //     tokenId: 32799,
            //     "nftData": "0x11a9e3ccd80414c44a3a4c91beeb7b1a1a3de3c68a4d901fcf31a00c95f245c2",
            //     "nftId": "139414297126165134441448130901307428303546258629632697827332",
            //     "total": "1"
            // }, {
            //     "tokenAddress": "0x64d9317f43b816c905ea09e4198b4f92ce89dc8c",
            //     tokenId: 31799,
            //     "nftData": "0xa0a3ab833753edfcec952494f49f9cafc474eb500e2fcd854d804a6ba342563",
            //     "nftId": "139414297126165134441448130901307428303546258629632697827331",
            //     "amount": "1"
            // }]
            // {
            //     "totalNum" : 1,
            //     "data" : [
            //         {
            //             "accountId" : 10,
            //             "tokenId" : 10,
            //             "nftData" : "100",
            //             "tokenAddress" : "100",
            //             "nftId" : "100",
            //             "total" : "100",
            //             "locked" : "100",
            //             "pending" : {
            //                 "withdraw" : "1",
            //                 "deposit" : "1"
            //             }
            //         }
            //     ]
            // }
            userNFTBalances.forEach(async ({nftId, tokenAddress}) => {
                mediaPromise.push(LoopringAPI?.contract.getContractNFTMeta({
                    _id: parseInt(nftId).toString(),
                    web3: connectProvides.usedWeb3,
                    contractAddress: tokenAddress
                }))
                // LoopringAPI?.contract.getContractNFTMeta({_id: nftId, web3:connectProvides.usedWeb3,contractAddress: tokenAddress})
            })
            const meta: any[] = await Promise.all(mediaPromise);
            // console.log(meta)
            // debugger

            setNFTList(userNFTBalances.map((item, index) => {
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
        , [])

    return {
        NFTList,
        isShow,
        popItem,
        onDetail,
        etherscanBaseUrl,
        onDetailClose,
    }


}
