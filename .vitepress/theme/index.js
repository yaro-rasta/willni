// .vitepress/theme/index.js
import DefaultTheme from "vitepress/theme";
import Layout from "./Layout.vue";
import RegistrationForm from "./components/RegistrationForm.vue";
import LoginForm from "./components/LoginForm.vue";
import HomePage from "./components/HomePage.vue";
import AuthGate from "./components/AuthGate.vue";
import ChatWidget from "./components/ChatWidget.vue";
import LandingPage from "./components/LandingPage.vue";
import CryptoPayment from "./components/CryptoPayment.vue";
import "./custom.css";

export default {
  ...DefaultTheme,
  Layout,
  enhanceApp({ app }) {
    app.component("RegistrationForm", RegistrationForm);
    app.component("LoginForm", LoginForm);
    app.component("HomePage", HomePage);
    app.component("AuthGate", AuthGate);
    app.component("ChatWidget", ChatWidget);
    app.component("LandingPage", LandingPage);
    app.component("CryptoPayment", CryptoPayment);
  },
};
