import { Portal } from "@chakra-ui/react";
import { noop } from "@fxts/core";
import { Fragment, PropsWithChildren, ReactElement, createContext, useCallback, useContext, useState } from "react";

const OverlayStateContext = createContext<ReactElement[]>([]);

const OverlayMutationContext = createContext<{
  push: (overlay: ReactElement) => void;
  pop: () => void;
}>({
  push: noop,
  pop: noop,
});

// eslint-disable-next-line react-refresh/only-export-components
export const useOverlay = () => useContext(OverlayMutationContext);

export function OverlayProvider({ children }: PropsWithChildren) {
  const [overlays, setOverlays] = useState<ReactElement[]>([]);

  const push = useCallback((overlay: ReactElement) => setOverlays((prev) => [...prev, overlay]), []);

  const pop = useCallback(() => setOverlays((prev) => prev.slice(0, prev.length - 1)), []);

  return (
    <OverlayStateContext.Provider value={overlays}>
      <OverlayMutationContext.Provider value={{ push, pop }}>{children}</OverlayMutationContext.Provider>
    </OverlayStateContext.Provider>
  );
}

export function OverlayConsumer() {
  const overlays = useContext(OverlayStateContext);

  return (
    <Portal>
      {overlays.map((overlay, index) => (
        <Fragment key={index}>{overlay}</Fragment>
      ))}
    </Portal>
  );
}
