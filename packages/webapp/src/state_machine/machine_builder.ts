export const buildMachine = <S, E>(spec: any) => (currentState: S, event: E) => {
    // We get all possible transitions for the current State
    const stateTransitions = spec.states[currentState]

    // No transitions? Error!
    if (stateTransitions === undefined) {
        throw new Error(`No transitions defined for ${currentState}`)
    }

    // We try to transition to the next state
    const nextState = stateTransitions[event]

    // No next state? Error!
    if (nextState === undefined) {
        throw new Error(
            `Unknown transition for event ${event} in state ${currentState}`
        )
    }

   // console.log('got nextState:', nextState)

    // We return the new state
    return nextState
}
