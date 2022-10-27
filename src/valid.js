/* eslint-disable object-shorthand */
/* eslint-disable func-names */
/* eslint-disable import/prefer-default-export */
import Toast from 'react-native-toast-message'
import { gql } from '@apollo/client'

import * as CONST from './consts'

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
    return /^([\w\s'/_@.#&+-;~]){4,50}$/.test(param)
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

  cardTitle: function (param) {
    return /^([\w\s'/_@.#&+-;~]){4,50}$/.test(param)
  },
  cardText: function (param) {
    return /^(.|\s){4,1024}$/.test(param)
  },

  async isValidToken({ authContext, navigation, topOffset }) {
    // console.log({ localToken })
    const { uuid, phoneNumber, token } = authContext
    // console.log({ uuid })
    try {
      if (
        !VALID.uuid(uuid) ||
        !VALID.phoneNumber(phoneNumber) ||
        !VALID.token(token)
      ) {
        throw new Error('Invalid parameters')
      }

      const { isValidToken } = (
        await CONST.gqlClient.query({
          query: gql`
            query isValidToken(
              $uuid: String!
              $phoneNumber: String!
              $token: String!
            ) {
              isValidToken(
                uuid: $uuid
                phoneNumber: $phoneNumber
                token: $token
              )
            }
          `,
          variables: {
            uuid,
            phoneNumber,
            token,
          },
          fetchPolicy: 'no-cache',
        })
      ).data
      return isValidToken
    } catch (err01) {
      console.log({ err01 })
      navigation.navigate('PhoneCheck')
      Toast.show({
        text1: 'Need to confirm your phone number',
        // text2: err01.toString(),
        type: 'info',
        topOffset,
      })
    }
    return false
  },

  async isPlaceOwner({ authContext, placeUuid, navigation, topOffset }) {
    const { uuid, phoneNumber, token } = authContext
    // console.log({ localToken })
    try {
      if (
        !VALID.uuid(uuid) ||
        !VALID.phoneNumber(phoneNumber) ||
        !VALID.token(token)
      ) {
        throw new Error('Invalid parameters')
      }

      const { isPlaceOwner } = (
        await CONST.gqlClient.query({
          query: gql`
            query isPlaceOwner(
              $uuid: String!
              $phoneNumber: String!
              $token: String!
              $placeUuid: String!
            ) {
              isPlaceOwner(
                uuid: $uuid
                phoneNumber: $phoneNumber
                token: $token
                placeUuid: $placeUuid
              )
            }
          `,
          variables: {
            uuid,
            phoneNumber,
            token,
            placeUuid,
          },
          fetchPolicy: 'no-cache',
        })
      ).data
      return isPlaceOwner
    } catch (err00) {
      navigation.navigate('PhoneCheck')
      Toast.show({
        text1: 'Phone Number authentication is required',
        text2: err00.toString(),
        type: 'info',
        topOffset,
      })
    }
    return false
  },
}
