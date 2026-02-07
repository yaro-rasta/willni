// .vitepress/theme/index.js
import DefaultTheme from 'vitepress/theme'
import RegistrationForm from './components/RegistrationForm.vue'
import './custom.css'

export default {
  ...DefaultTheme,
  enhanceApp({ app }) {
    app.component('RegistrationForm', RegistrationForm)
  }
}
