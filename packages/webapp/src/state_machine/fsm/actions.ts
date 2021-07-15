import { TRANSITION } from "./actionTypes"

export const transition = (event: any, payload: any) => ({
  type: TRANSITION,
  event: event.toUpperCase(),
  payload
})
