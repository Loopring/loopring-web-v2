import { WindowScroller } from "react-virtualized"

export interface IEventCallback {
  event: string;
  callback: (result: any) => void
}

// -- EventController --------------------------------------------------------- //

export class EventController {
  private _eventCallbacks: IEventCallback[]

  constructor() {
    this._eventCallbacks = []
  }

  public on(eventCallback: IEventCallback) {
    this._eventCallbacks.push(eventCallback)
  }

  public off(eventObj?: Partial<IEventCallback>) {
    // remove specific event callback
    if (eventObj) {
      if (eventObj.callback) {
        this._eventCallbacks = this._eventCallbacks.filter(
          (eventCallback: IEventCallback) =>
            eventCallback.event !== eventObj.event ||
            eventCallback.callback !== eventObj.callback
        )
      } // No callback to remove, remove entire event
      else {
        this._eventCallbacks = this._eventCallbacks.filter(
          (eventCallback: IEventCallback) =>
            eventCallback.event !== eventObj.event
        )
      }
    } else {
      this._eventCallbacks = []
    }
  }

  public trigger(event: string, result?: any): void {
    let eventCallbacks: IEventCallback[] = this._eventCallbacks.filter(
      (eventCallback: IEventCallback) => eventCallback.event === event
    )

    if (eventCallbacks && eventCallbacks.length) {
      eventCallbacks.forEach((eventCallback: IEventCallback) => {
        eventCallback.callback(result);
      })
    }
  }
}

export const ev = (() => { return new EventController() })()
