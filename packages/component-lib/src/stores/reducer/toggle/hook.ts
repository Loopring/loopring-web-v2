import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@loopring-web/webapp/src/stores";
import { ToggleState } from "./interface";
import { updateToggleStatus } from "./reducer";
import React from "react";

export function useToggle() {
  const toggle: ToggleState = useSelector((state: RootState) => state.toggle);
  const dispatch = useDispatch();

  return {
    toggle,
    updateToggleStatus: React.useCallback(
      () => dispatch(updateToggleStatus(undefined)),
      [dispatch]
    ),
  };
}
