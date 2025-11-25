
import { createRoot } from "react-dom/client";
import { HashRouter } from "react-router-dom";
import { Provider } from "react-redux";
import { store } from "./redux/store.js";
import App from "./App.jsx";
import "./index.css";
import { Toaster } from "./components/ui/sonner"; // Import the Toaster component

const root = createRoot(document.getElementById("root"));
root.render(
  <Provider store={store}>
    <HashRouter>
      <App />
      <Toaster /> {/* Render the Toaster component here */}
    </HashRouter>
  </Provider>
);
