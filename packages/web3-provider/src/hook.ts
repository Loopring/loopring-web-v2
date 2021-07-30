import React from 'react';
import { walletServices } from './walletServices';
import { Commands, ProcessingType,ErrorType } from './command';
import {  provider } from 'web3-core';

export  function  useConnectHook(
    {  handleChainChanged, handleConnect, handleAccountDisconnect,handleError,handleProcessing
    } :{
        handleProcessing?:(props:{type: keyof typeof ProcessingType, opts: any})=>void,
        handleError?:(proPs:{type:keyof typeof ErrorType,errorObj: any})=>void,
        handleChainChanged?:(chainId:string)=>void,
        handleConnect?:(accounts:string,provider:provider)=>void,
        handleAccountDisconnect?:()=>void
    }
){
    const subject = React.useMemo(() => walletServices.onSocket(),[]);

    // const handleChainChanged = React.useCallback((chainId)=>{
    //     debugger
    //     console.log(chainId)
    // },[])
    // const handleConnect = React.useCallback((accounts,provider)=>{
    //     debugger
    //     console.log(accounts,provider)
    // },[])
    // const handleAccountDisconnect = React.useCallback(()=>{
    //     debugger
    //     console.log('Disconnect')
    // },[])
    React.useEffect(() => {
        const subscription = subject.subscribe(({data, status}: { status: keyof typeof Commands, data?: any }) => {
            switch (status) {
                case 'Error':
                    handleError?handleError(data):undefined;
                    break
                case 'Processing':
                    handleProcessing?handleProcessing(data):{}
                    break
                case 'ChangeNetwork':
                    // @ts-ignore
                    const {chainId} = data ? data : {chainId: undefined};
                    handleChainChanged?handleChainChanged(chainId): undefined;
                    // systemState.updateSystem({ chainId })
                    // window.location.reload();
                    // console.log(data)
                    break
                case 'ConnectWallet':
                    const {accounts,provider} = data ? data : {accounts: undefined,provider:undefined};
                    handleConnect?handleConnect(accounts,provider):undefined
                    break
                case 'DisConnect':
                    handleAccountDisconnect?handleAccountDisconnect():undefined
                    //TODO reset
                    console.log(data)

            }
        });
        return () => subscription.unsubscribe();
    }, [subject]);
}
