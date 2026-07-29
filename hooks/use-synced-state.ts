"use client"

import { useState } from "react"

function sameDeps(a: readonly unknown[], b: readonly unknown[]) {
  if (a.length !== b.length) return false
  for (let i = 0; i < a.length; i++) {
    if (!Object.is(a[i], b[i])) return false
  }
  return true
}

/**
 * Local state that re-seeds itself whenever an external value changes.
 *
 * This is React's documented "adjusting state when a prop changes" pattern:
 * compare against the previous value during render and call the setter right
 * there. React throws away the in-progress render and re-runs the component
 * before anything reaches the DOM — so unlike the effect version
 * (`useEffect(() => setX(fromProp), [fromProp])`) the user never sees a frame
 * with the stale value, and it does not trip `react-hooks/set-state-in-effect`.
 *
 * `deps` is compared element-wise with `Object.is`, exactly like an effect
 * dependency array. `derive` may return `undefined` to leave the current state
 * alone — used where a URL param disappearing should not clear a filter the
 * user has since set by hand, or where a sheet closing should not wipe a draft
 * mid-animation.
 */
export function useSyncedState<TState>(
  deps: readonly unknown[],
  derive: () => TState | undefined,
  initial: () => TState,
): [TState, React.Dispatch<React.SetStateAction<TState>>] {
  const [state, setState] = useState<TState>(initial)
  const [prevDeps, setPrevDeps] = useState(deps)

  if (!sameDeps(deps, prevDeps)) {
    setPrevDeps(deps)
    const next = derive()
    if (next !== undefined) setState(next)
  }

  return [state, setState]
}
