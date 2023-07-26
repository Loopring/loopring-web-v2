import { Subject, Subscription } from 'rxjs'

const subject = new Subject<void>()
const successSubject = new Subject<void>()
export const redpacketService = {
  refresh: () => {
    subject.next()
  },
  onRefresh: () => subject.asObservable(),
  success: () => {
    successSubject.next()
  },
  onSuccess: () => successSubject.asObservable(),
}
