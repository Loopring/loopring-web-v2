import { Subject, Subscription } from 'rxjs'

const subject = new Subject<void>()
var refreshSubscription: Subscription | undefined  = undefined
const successSubject = new Subject<void>()
var successSubscription: Subscription | undefined  = undefined

export const redpacketService = {
  refresh: () => {
    subject.next()
  },
  onRefresh: (callBack: () => void) => {
    if (refreshSubscription) refreshSubscription.unsubscribe()
    refreshSubscription = subject.asObservable().subscribe(() => {
      callBack()
    })
  },
  success: () => {
    successSubject.next()
  },
  onSuccess: (callBack: () => void) => {
    if (successSubscription) successSubscription.unsubscribe()
    successSubscription = successSubject.asObservable().subscribe(() => {
      callBack()
    })
  },
}
