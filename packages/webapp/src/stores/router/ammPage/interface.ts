export type PageAmmJoin = {
}

export type PageAmmExit = {
}

export type PageAmmPoolStatus = {
    ammJoin: PageAmmJoin,
    ammExit: PageAmmExit,
    __SUBMIT_LOCK_TIMER__: 1000;
    __TOAST_AUTO_CLOSE_TIMER__: 3000
}
