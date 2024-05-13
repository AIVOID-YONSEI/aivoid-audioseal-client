import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import { assert } from "./utils";

const $root = document.getElementById("root");

assert($root !== null, "root element가 없음");

ReactDOM.createRoot($root).render(<App />);
