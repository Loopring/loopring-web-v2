import { Subject } from 'rxjs'

const subject = new Subject<void>()
export const redpacketService = {
  refresh: () => {
    subject.next()
  },
  onRefresh: () => subject.asObservable()
}
