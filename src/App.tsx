import LandingPage from "./pages/landing-page";
import { ChakraProvider } from "@chakra-ui/react";
import { Font } from "./components";
import { OverlayConsumer, OverlayProvider } from "./contexts/overlay-context.tsx";

export default function App() {
  return (
    <>
      <Font />
      <ChakraProvider>
        <OverlayProvider>
          <OverlayConsumer />
          {/* TOOO: replace with routing...? */}
          <LandingPage />
        </OverlayProvider>
      </ChakraProvider>
    </>
  );
}
