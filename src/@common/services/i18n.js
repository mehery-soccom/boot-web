import Vue from "vue";
import VueI18n from "vue-i18n";
import { localize } from 'vee-validate';
import ar from "vee-validate/dist/locale/ar.json";
import en from "vee-validate/dist/locale/en.json";

Vue.use(VueI18n);

console.log("i18NLoaded");

let i18nConfig = {
  locale: "en",
  messages: {
    ar: {
      fields: {
        email: "البريد الاليكتروني",
        password: "كلمة السر"
      },
      validation: ar.messages
    },
    en: {
      fields: {
        email: "E-mail",
        name: "Name",
        phone : "Phone",
        company : "Company Name",
        country : "Country",
        role : "Role",
        password: "Password"
      },
      validation: en.messages,
      errors : {
        'NotNull' : "The {_field_} is required",
        'ValidPhone' : 'Enter valid {_field_} eg +91 XXXXX XXXXX',
        'ValidPhonesPerLine' : 'Enter valid mobile number eg 91XXXXXXXXXX per line',
        'ValidEmail' : "Enter valid email address eg you@company.com",
        'ValidURL' : "Enter valid URL address eg https://company.com/some/path/to_file",
        'Pattern' : "Enter valid {_field_}",
        'LessVariable' : "Insufficent number of valiables in {_field_}",
        'ExtraVariable' : "More than allowed valiables in {_field_}",
        'InvalidVariable' : "Invalid valiables in {_field_}",
        'InvalidVariableSeq' : "Invalid valiables sequence in {_field_}",
        'PositionVariable' : "Invalid position of valiables in {_field_}",
      }
    }
  }
}

localize(i18nConfig);
const i18n = new VueI18n(i18nConfig);
export { i18n };
