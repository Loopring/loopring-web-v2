export enum WsState {
    Unknown = 'Unknown',
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

export const WebsocketMachineSpec = (initialState: WsState = WsState.Unknown) => {
    return {
        initialState: initialState,
        states: {
            Unknown: {
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
