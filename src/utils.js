import { Alert } from 'react-native'
import * as Linking from 'expo-linking'
import * as Location from 'expo-location'
import * as SecureStore from 'expo-secure-store'
import Toast from 'react-native-toast-message'
import { v4 as uuidv4 } from 'uuid'
import 'react-native-get-random-values'
import { gql } from '@apollo/client'

import * as CONST from './consts'

export async function checkPermission({
  permissionFunction,
  alertHeader,
  alertBody,
  permissionFunctionArgument,
}) {
  const { status } = await permissionFunction(permissionFunctionArgument)
  if (status !== 'granted') {
    Alert.alert(alertHeader, alertBody, [
      {
        text: 'Open Settings',
        onPress: () => {
          Linking.openSettings()
        },
      },
    ])
  }
  return status
}

export async function getLocation() {
  const locationPermission = await checkPermission({
    permissionFunction: Location.requestForegroundPermissionsAsync,
    alertHeader:
      'Placechatter shows you place closest on your current location.',
    alertBody: 'You need to enable Location in Settings and Try Again.',
  })

  if (locationPermission === 'granted') {
    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.BestForNavigation,
    })
    // console.log({ location })
    return location
    // initially set the location that is last known -- works much faster this way
  }
  return null
}

async function storeUUID(uuid) {
  // console.log('storing', { uuid })

  try {
    await SecureStore.setItemAsync(CONST.UUID_KEY, uuid)
  } catch (err1) {
    // console.log({ err1 })
    Toast.show({
      text1: 'Unable to store UUID',
      text2: err1.toString(),
      type: 'error',
    })
  }
}

export async function getUUID() {
  let uuid
  try {
    uuid = await SecureStore.getItemAsync(CONST.UUID_KEY)
  } catch (err) {
    // console.log({ err })
    uuid = null
  }
  if (uuid === null) {
    // no uuid in the store, generate a new one and store

    if (uuid === '' || uuid === null) {
      uuid = uuidv4()
      await storeUUID(uuid)
    }
  }
  // console.log({ uuid })
  return uuid
}

export async function setNickName(nickName) {
  try {
    await SecureStore.setItemAsync(CONST.NICK_NAME_KEY, nickName)
  } catch (err) {
    Toast.show({
      text1: 'Unable to store NickName',
      text2: err.toString(),
      type: 'error',
    })
  }
}

export async function getNickName() {
  const nickName = await SecureStore.getItemAsync(CONST.NICK_NAME_KEY)
  return nickName
}

export const setPhoneNumber = async (phoneNumber) => {
  try {
    await SecureStore.setItemAsync(CONST.PHONE_NUMBER_KEY, phoneNumber)
  } catch (err) {
    Toast.show({
      text1: 'Unable to store PhoneNumber',
      text2: err.toString(),
      type: 'error',
    })
  }
}

export async function getPhoneNumber() {
  const phoneNumber = await SecureStore.getItemAsync(CONST.PHONE_NUMBER_KEY)
  return phoneNumber
}

export const setToken = async (token) => {
  try {
    await SecureStore.setItemAsync(CONST.TOKEN_KEY, token)
  } catch (err) {
    Toast.show({
      text1: 'Unable to store token',
      text2: err.toString(),
      type: 'error',
    })
  }
}

export async function getToken() {
  const token = await SecureStore.getItemAsync(CONST.TOKEN_KEY)
  return token
}

/// /////////////////////////////////////////////////////////////////////////////////////////////
/// aws gql functions
/// /////////////////////////////////////////////////////////////////////////////////////////////

export async function placeRead({ placeUuid }) {
  const { place, cards } = (
    await CONST.gqlClient.query({
      query: gql`
        query placeRead(
          # $uuid: String!
          # $phoneNumber: String!
          # $token: String!
          $placeUuid: String!
        ) {
          placeRead(
            # uuid: $uuid
            # phoneNumber: $phoneNumber
            # token: $token
            placeUuid: $placeUuid
          ) {
            place {
              placeUuid
              placeName
              streetAddress1
              streetAddress2
              city
              district
              postalCode
              region
            }
            cards {
              cardUuid
              cardTitle
              cardText
              photo {
                imgUrl
                thumbUrl
              }
            }
          }
        }
      `,
      variables: {
        // uuid,
        // phoneNumber,
        // token,
        placeUuid,
      },
      // fetchPolicy: 'network-only',
      fetchPolicy: 'no-cache',
    })
  ).data.placeRead
  // alert(response)

  return { place, cards } //   // setPlaceContext({ place: {}, cards: [] })
}

export async function placesFeed({ latitude, longitude }) {
  return (
    await CONST.gqlClient.query({
      query: gql`
        query placesFeed($lat: Float!, $lon: Float!) {
          placesFeed(lat: $lat, lon: $lon) {
            places {
              place {
                placeUuid
                distance
                placeName
                streetAddress1
                streetAddress2
                city
                region
              }
              cards {
                cardTitle
                cardText
                photo {
                  photoUuid
                  thumbUrl
                }
              }
            }
          }
        }
      `,
      variables: {
        lat: latitude,
        lon: longitude,
      },
      // fetchPolicy: 'network-only',
      fetchPolicy: 'no-cache',
    })
  ).data.placesFeed.places
}
