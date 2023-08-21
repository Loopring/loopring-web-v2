import React from 'react'
import { languageMap, myLog, url_path, url_test_path } from '@loopring-web/common-resources'
import { useHistory, useLocation, useRouteMatch } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Config_INFO_URL, EventData } from './interface'
import { useSystem } from '@loopring-web/core'
import moment from 'moment'

export enum EVENT_STATUS {
  EVENT_START = 'labelTradeRaceStart',
  EVENT_READY = 'labelTradeRaceReady',
  EVENT_END = 'labelTradeRaceEnd',
}

export const useTradeRace = () => {
  const match: any = useRouteMatch('/race-event/:path')
  const nodeTimer = React.useRef<NodeJS.Timeout | -1>(-1)
  const { i18n } = useTranslation()
  const { baseURL } = useSystem()
  const { search } = useLocation()
  const searchParams = new URLSearchParams(search)
  const history = useHistory()

  const [eventData, setEventData] = React.useState<EventData>()
  const [eventsList, setEventsList] = React.useState<Array<EventData & { type: string }>>([])
  const [eventStatus, setEventStatus] = React.useState<EVENT_STATUS | undefined>()

  const [countDown, setCountDown] = React.useState<{
    days: undefined | string
    hours: undefined | string
    seconds: undefined | string
    minutes: undefined | string
  }>()

  React.useEffect(() => {
    if (baseURL) {
      try {
        // follow /2021/01/2021-01-01.en.json
        const [year, month] = match?.params.path.split('-')
        const type = searchParams.get('type')
        const path = `${/uat/gi.test(baseURL) ? url_test_path : url_path}/${year}/${month}/`
        if (year && month && type) {
          fetch(`${path}activities.${languageMap[i18n.language]}.json`)
            .then((response) => {
              if (response.ok) {
                return response.json()
              } else {
                history.replace(`/race-event?${searchParams.toString()}`)
              }
            })
            .then((input: { [key: string]: EventData }) => input[type])
            .then(async (eventData: EventData) => {
              myLog('useTradeRace eventData', eventData)
              if (eventData) {
                // https://uat2.loopring.io/api/v3/activity/getFilterInfo?version=1
                const configUrl = `${baseURL}/${Config_INFO_URL}?version=${eventData.api?.version}`
                myLog('baseURL', configUrl)
                const config: [{ [key: string]: any }, string] = await Promise.all([
                  fetch(configUrl).then((response) => {
                    if (response.ok) {
                      return response.json()
                    } else {
                      return {}
                    }
                  }),
                  fetch(`${path}activities/${eventData.rule?.split('/').pop()}`)
                    .then((response) => response.text())
                    .then((input) => {
                      return input
                    })
                    .catch(() => {
                      return ''
                    }),
                ])
                const startUnix =
                  config[0].start ??
                  moment.utc(eventData.duration.startDate, 'MM/DD/YYYY HH:mm:ss').valueOf()
                const endUnix =
                  config[0].end ??
                  moment.utc(eventData.duration.endDate, 'MM/DD/YYYY HH:mm:ss').valueOf()

                setEventData({
                  ...eventData,
                  banner: {
                    pad: eventData.banner?.pad
                      ? /uat/gi.test(baseURL)
                        ? `${path}activities/${eventData.banner?.pad?.split('/').pop()}`
                        : eventData.banner.pad //`${path}/`
                      : undefined,
                    laptop: eventData.banner?.laptop
                      ? /uat/gi.test(baseURL)
                        ? `${path}activities/${eventData.banner?.laptop?.split('/').pop()}`
                        : eventData.banner.laptop //`${path}/`
                      : undefined,
                    mobile: eventData.banner?.mobile
                      ? /uat/gi.test(baseURL)
                        ? `${path}activities/${eventData.banner?.mobile?.split('/').pop()}`
                        : eventData.banner.mobile
                      : undefined,
                  },
                  duration: {
                    ...eventData.duration,
                    startDate: startUnix,
                    endDate: endUnix,
                  },
                  ruleMarkdown: config[1],
                  api: {
                    ...eventData.api,
                    ...config[0],
                  },
                })

                if (startUnix > Date.now()) {
                  setEventStatus(EVENT_STATUS.EVENT_READY)
                } else if (endUnix > Date.now()) {
                  setEventStatus(EVENT_STATUS.EVENT_START)
                } else {
                  setEventStatus(EVENT_STATUS.EVENT_END)
                }
              } else {
                throw 'no EventData'
              }
            })
            .catch((e) => {
              searchParams.set('type', '')
              // history.push(match.url + "?" + searchParams.toString());
              window.open(`./#${match.url}?` + searchParams.toString(), '_self')
              window.opener = null
              window.location.reload()
            })
        } else if (year && month && !type) {
          fetch(`${path}activities.${languageMap[i18n.language]}.json`)
            .then((response) => {
              if (response.ok) {
                return response.json()
              } else {
                history.replace(`/race-event?${searchParams.toString()}`)
              }
            })
            .then((input) => {
              const eventsList = Reflect.ownKeys(input).map((key) => {
                // input[key]
                const startUnix = moment
                  .utc(input[key].duration?.startDate ?? '', 'MM/DD/YYYY HH:mm:ss')
                  .valueOf()
                const endUnix = moment
                  .utc(input[key].duration?.endDate ?? '', 'MM/DD/YYYY HH:mm:ss')
                  .valueOf()
                return {
                  ...input[key],
                  type: key,
                  duration: {
                    ...input[key].duration,
                    startDate: startUnix,
                    endDate: endUnix,
                  },
                }
              })
              setEventsList(eventsList)
            })
        } else {
          throw 'url format wrong'
        }
      } catch (e: any) {
        myLog(e?.message)
        history.push('/race-event')
      }
    }
  }, [baseURL, i18n.language])

  const scrollToRule = (event: React.MouseEvent<HTMLElement>) => {
    const anchor = ((event.target as HTMLElement).ownerDocument || document).querySelector(
      '#event-rule',
    )

    if (anchor) {
      anchor.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }

  const calculateTimeLeft = React.useCallback(() => {
    if (eventData && eventStatus) {
      if (eventStatus === EVENT_STATUS.EVENT_READY) {
        let difference = +new Date(eventData.duration.startDate) - Date.now()

        setCountDown({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)).toString(),
          hours: ('0' + Math.floor((difference / (1000 * 60 * 60)) % 24).toString()).slice(-2),
          minutes: ('0' + Math.floor((difference / 1000 / 60) % 60).toString()).slice(-2),
          seconds: ('0' + Math.floor((difference / 1000) % 60).toString()).slice(-2),
        })
      } else if (eventStatus === EVENT_STATUS.EVENT_START) {
        let difference = +new Date(eventData.duration.endDate) - Date.now()
        setCountDown({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)).toString(),
          hours: ('0' + Math.floor((difference / (1000 * 60 * 60)) % 24).toString()).slice(-2),
          minutes: ('0' + Math.floor((difference / 1000 / 60) % 60).toString()).slice(-2),
          seconds: ('0' + Math.floor((difference / 1000) % 60).toString()).slice(-2),
        })
      }
      if (nodeTimer.current !== -1) {
        clearTimeout(nodeTimer.current as NodeJS.Timeout)
      }
      nodeTimer.current = setTimeout(() => calculateTimeLeft(), 1000)
    }
  }, [eventData, eventStatus])
  React.useEffect(() => {
    if (eventStatus) {
      if (nodeTimer.current !== -1) {
        clearTimeout(nodeTimer.current as NodeJS.Timeout)
      }
      calculateTimeLeft()
    }
    return () => {
      if (nodeTimer.current !== -1) {
        clearTimeout(nodeTimer.current as NodeJS.Timeout)
      }
    }
  }, [eventStatus])

  return {
    eventData,
    match,
    // selected,
    // currMarketPair,
    filteredAmmViewMap: [],
    countDown,
    eventsList,
    // handleFilterChange,
    searchParams,
    // onChange,
    // duration,
    scrollToRule,
    // activityRule,
    eventStatus,
  }
}
