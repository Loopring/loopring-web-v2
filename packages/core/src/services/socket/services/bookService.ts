import { OrderDetail } from '@loopring-web/loopring-sdk'
import { Subject } from 'rxjs'

const subject = new Subject<{ bookMap: BookMap<{ [key: string]: any }> }>()

export type BookMap<R> = {
  [key in keyof R]: OrderDetail
}
// <R extends {[key:string]:any}>

export const bookService = {
  sendBook: (bookMap: BookMap<{ [key: string]: any }>) => subject.next({ bookMap }),
  // clearMessages: () => subject.next(),
  onSocket: () => subject.asObservable(),
}
