import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import { ChakraProvider } from "@chakra-ui/react";
import { Font } from "./components";
import { assert } from "./utils";

const $root = document.getElementById("root");

assert($root !== null, "root element가 없음");

ReactDOM.createRoot($root).render(
  <>
    <Font />
    <ChakraProvider>
      <App />
    </ChakraProvider>
  </>
);
