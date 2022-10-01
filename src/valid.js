/* eslint-disable object-shorthand */
/* eslint-disable func-names */
/* eslint-disable import/prefer-default-export */

export const VALID = {
  dateFormat: 'YYYY-MM-DD HH:mm:ss.SSS',

  phoneNumber: function (param) {
    if (/^([0-9]){10}$/.test(param)) {
      return true
    }
    return false
  },

  uuid: function (param) {
    if (
      /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/gi.test(
        param,
      )
    ) {
      return true
    }
    return false
  },

  nickName: function (param) {
    if (/^([a-zA-Z0-9_-]){4,30}$/.test(param)) {
      return true
    }
    return false
  },

  smsCode: function (param) {
    if (/^([a-zA-Z0-9]){4}$/.test(param)) {
      return true
    }
    return false
  },

  token: function (param) {
    if (/^([a-zA-Z0-9]){128}$/.test(param)) {
      return true
    }
    return false
  },
}
