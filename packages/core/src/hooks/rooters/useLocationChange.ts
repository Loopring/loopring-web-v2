import { useLocation } from 'react-router-dom'
import { Location } from 'history'
import React from 'react'

const usePrevious = (value: Location<any>): Location<any> => {
  const ref = React.useRef<Location<any>>()
  React.useEffect(() => {
    ref.current = value
  })
  return ref.current as Location<any>
}
export const useLocationChange = (
  action: (locatin: Location<any>, prevLocation: Location<any>) => void,
) => {
  const location = useLocation()
  const prevLocation = usePrevious(location)
  React.useEffect(() => {
    action(location, prevLocation)
  }, [location])
}
