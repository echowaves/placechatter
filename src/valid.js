/* eslint-disable object-shorthand */
/* eslint-disable func-names */
/* eslint-disable import/prefer-default-export */

export const VALID = {
  dateFormat: 'YYYY-MM-DD HH:mm:ss.SSS',

  phoneNumber: function (param) {
    return /^([0-9]){10}$/.test(param)
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
    return /^([a-zA-Z0-9_-]){4,30}$/.test(param)
  },

  smsCode: function (param) {
    return /^([a-zA-Z0-9]){4}$/.test(param)
  },

  token: function (param) {
    return /^(\w){128}$/.test(param)
  },

  placeName: function (param) {
    return /^([\w_@./#&+-\s]){4,50}$/.test(param)
  },
  placeDescription: function (param) {
    return /^(.|\s){100,1024}$/.test(param)
  },
  streetAddress: function (param) {
    return /^([\w_@./#&+-\s]){2,50}$/.test(param)
  },
  city: function (param) {
    return /^([\w_@./#&+-\s]){2,50}$/.test(param)
  },
  region: function (param) {
    return /^([\w_@./#&+-\s]){2,50}$/.test(param)
  },
  postalCode: function (param) {
    return /^([\w_@./#&+-\s]){2,50}$/.test(param)
  },
}
