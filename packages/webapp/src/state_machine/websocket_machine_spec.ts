export enum WsState {
    unknown = 'unknown',
    Inited = 'Inited',
    HasError = 'HasError',
    Closed = 'Closed',
    Finished = 'Finished',
}

export enum StatusChangeEvent {
    Initializing = 'Initializing',
    Closing = 'Closing',
    GetError = 'GetError',
    ForceQuit = 'ForceQuit',
}

export const WebsocketMachineSpec = (initialState: WsState = WsState.unknown) => {
    return {
        initialState: initialState,
        states: {
            unknown: {
                Initializing: WsState.Inited,
                ForceQuit: WsState.Finished,
                Closing: WsState.Closed,
            },
            Inited: {
                Closing: WsState.Closed,
                ForceQuit: WsState.Finished,
                GetError: WsState.HasError,
            },
            HasError: {
                ForceQuit: WsState.Finished,
            },
            Closed: {
                Initializing: WsState.Inited,
                ForceQuit: WsState.Finished,
            }
        },
    }
}
