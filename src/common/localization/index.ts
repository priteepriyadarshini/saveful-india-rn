import { I18n } from 'i18n-js';

const i18n = new I18n({
  en: {
    welcome_title: 'Welcome!',
    purchase_count: {
      one: 'purchase',
      other: 'purchases',
    },
    signup_button: 'Create an account',
    login_button: 'Sign in',
  },
});

export default i18n;
