import { Alert } from 'react-native'
import * as Linking from 'expo-linking'
import * as Location from 'expo-location'
import * as SecureStore from 'expo-secure-store'
import Toast from 'react-native-toast-message'
import { v4 as uuidv4 } from 'uuid'
import 'react-native-get-random-values'
import { gql } from '@apollo/client'

import * as CONST from './consts'
import { VALID } from './valid'

// const { width, height } = useDimensions().window
const topOffset = 200

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
  } catch (err001) {
    // console.log({ err1 })
    Toast.show({
      text1: 'Unable to store UUID',
      text2: err001.toString(),
      type: 'error',
      topOffset,
    })
  }
}

export async function getUUID() {
  let uuid
  try {
    uuid = await SecureStore.getItemAsync(CONST.UUID_KEY)
  } catch (err002) {
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
  } catch (err003) {
    Toast.show({
      text1: 'Unable to store NickName',
      text2: err003.toString(),
      type: 'error',
      topOffset,
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
  } catch (err004) {
    Toast.show({
      text1: 'Unable to store PhoneNumber',
      text2: err004.toString(),
      type: 'error',
      topOffset,
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
  } catch (err005) {
    Toast.show({
      text1: 'Unable to store token',
      text2: err005.toString(),
      type: 'error',
      topOffset,
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

export async function activationCodeGenerate({ phoneNumber, uuid }) {
  try {
    await CONST.gqlClient.mutate({
      mutation: gql`
        mutation activationCodeGenerate($phoneNumber: String!, $uuid: String!) {
          activationCodeGenerate(phoneNumber: $phoneNumber, uuid: $uuid)
        }
      `,
      variables: {
        phoneNumber,
        uuid,
      },
    })
  } catch (err006) {
    console.log({ err006 })
    Toast.show({
      text1: 'Unable to generate activation code',
      text2: err006.toString(),
      type: 'error',
      topOffset,
    })
  }
}

export async function phoneActivate({ uuid, phoneNumber, smsCode, nickName }) {
  try {
    return (
      await CONST.gqlClient.mutate({
        mutation: gql`
          mutation phoneActivate(
            $uuid: String
            $phoneNumber: String
            $smsCode: String
            $nickName: String
          ) {
            phoneActivate(
              uuid: $uuid
              phoneNumber: $phoneNumber
              smsCode: $smsCode
              nickName: $nickName
            )
          }
        `,
        variables: {
          uuid,
          phoneNumber,
          smsCode,
          nickName,
        },
      })
    ).data.phoneActivate
  } catch (err007) {
    Toast.show({
      text2: 'Unable to activate phone',
      text1: err007.toString(),
      type: 'error',
      topOffset,
    })
  }
  return null
}

export async function nickNameTypeAhead({ phoneNumber, nickName }) {
  try {
    return (
      await CONST.gqlClient.query({
        query: gql`
          query nickNameTypeAhead($phoneNumber: String, $nickName: String) {
            nickNameTypeAhead(phoneNumber: $phoneNumber, nickName: $nickName)
          }
        `,
        variables: {
          phoneNumber,
          nickName,
        },
      })
    ).data.nickNameTypeAhead
  } catch (err008) {
    Toast.show({
      text1: 'Unable autocomplete',
      text2: err008.toString(),
      type: 'error',
      topOffset,
    })
  }
  return null
}

export async function placeRead({ placeUuid }) {
  try {
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
                  photoUuid
                  width
                  height
                  active
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
  } catch (err009) {
    // console.log({ err009 })
    Toast.show({
      text1: 'Unable to Read Place Info',
      text2: err009.toString(),
      type: 'error',
      topOffset,
    })
  }
  return null
}

export async function placesFeed({ latitude, longitude }) {
  try {
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
                  cardUuid
                  cardTitle
                  cardText
                  photo {
                    photoUuid
                    width
                    height
                    active

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
  } catch (err010) {
    // console.log({ err010 })
    Toast.show({
      text1: 'Unable to Read Feed',
      text2: err010.toString(),
      type: 'error',
      topOffset,
    })
  }
  return null
}

export async function isValidToken({ authContext, navigation }) {
  // console.log('isValidToken')
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

    return (
      await CONST.gqlClient.query({
        query: gql`
          query isValidToken(
            $uuid: String
            $phoneNumber: String
            $token: String
          ) {
            isValidToken(uuid: $uuid, phoneNumber: $phoneNumber, token: $token)
          }
        `,
        variables: {
          uuid,
          phoneNumber,
          token,
        },
        fetchPolicy: 'no-cache',
      })
    ).data.isValidToken
  } catch (err011) {
    // console.log({ err011 })
    navigation.navigate('PhoneCheck')
    Toast.show({
      text1: 'Need to confirm your phone number',
      // text2: err01.toString(),
      type: 'error',
      topOffset,
    })
  }
  return false
}

export async function isPlaceOwner({ uuid, phoneNumber, token, placeUuid }) {
  // const {} = authContext
  // console.log({ localToken })
  try {
    // if (
    //   !VALID.uuid(uuid) ||
    //   !VALID.phoneNumber(phoneNumber) ||
    //   !VALID.token(token)
    // ) {
    //   throw new Error('Invalid parameters')
    // }

    return (
      await CONST.gqlClient.query({
        query: gql`
          query isPlaceOwner(
            $uuid: String
            $phoneNumber: String
            $token: String
            $placeUuid: String
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
    ).data.isPlaceOwner
  } catch (err012) {
    // console.log({ err012 })
    // navigation.navigate('PhoneCheck')
    // Toast.show({
    //   text1: 'Phone Number authentication is required',
    //   text2: err012.toString(),
    //   type: 'error',
    //   topOffset,
    // })
  }
  return false
}

export async function placeCreate({
  uuid,
  phoneNumber,
  token,
  placeName,
  streetAddress1,
  streetAddress2,
  city,
  country,
  district,
  isoCountryCode,
  postalCode,
  region,
  subregion,
  timezone,
  lat,
  lon,
}) {
  try {
    return (
      await CONST.gqlClient.mutate({
        mutation: gql`
          mutation placeCreate(
            $uuid: String
            $phoneNumber: String
            $token: String
            $placeName: String!
            $streetAddress1: String!
            $streetAddress2: String!
            $city: String!
            $country: String!
            $district: String!
            $isoCountryCode: String!
            $postalCode: String!
            $region: String!
            $subregion: String!
            $timezone: String!
            $lat: Float!
            $lon: Float!
          ) {
            placeCreate(
              uuid: $uuid
              phoneNumber: $phoneNumber
              token: $token
              placeName: $placeName
              streetAddress1: $streetAddress1
              streetAddress2: $streetAddress2
              city: $city
              country: $country
              district: $district
              isoCountryCode: $isoCountryCode
              postalCode: $postalCode
              region: $region
              subregion: $subregion
              timezone: $timezone
              lat: $lat
              lon: $lon
            ) {
              placeUuid
              # placeName
              # streetAddress1
              # streetAddress2
              # city
              # country
              # district
              # isoCountryCode
              # postalCode
              # region
              # subregion
              # timezone
              # location
              # createdAt
            }
          }
        `,
        variables: {
          uuid,
          phoneNumber,
          token,
          placeName,
          streetAddress1,
          streetAddress2,
          city,
          country,
          district,
          isoCountryCode,
          postalCode,
          region,
          subregion,
          timezone,
          lat,
          lon,
        },
      })
    ).data.placeCreate
  } catch (err013) {
    return null
    // navigation.navigate('PhoneCheck')
  }
}

export async function placeCardCreate({
  uuid,
  phoneNumber,
  token,
  placeUuid,
  cardTitle,
  cardText,
}) {
  try {
    return (
      await CONST.gqlClient.mutate({
        mutation: gql`
          mutation placeCardCreate(
            $uuid: String
            $phoneNumber: String
            $token: String
            $placeUuid: String!
            $cardTitle: String!
            $cardText: String!
          ) {
            placeCardCreate(
              uuid: $uuid
              phoneNumber: $phoneNumber
              token: $token
              placeUuid: $placeUuid
              cardTitle: $cardTitle
              cardText: $cardText
            ) {
              cardUuid
              cardTitle
              cardText
              active
            }
          }
        `,
        variables: {
          uuid,
          phoneNumber,
          token,
          placeUuid,
          cardTitle,
          cardText,
        },
      })
    ).data.placeCardCreate
  } catch (err014) {
    // navigation.navigate('PhoneCheck')
    Toast.show({
      text1: 'Unable to create Card for Place',
      text2: err014.toString(),
      type: 'error',
      topOffset,
    })
  }
  return null
}

export async function placeCardRead({ placeUuid, cardUuid }) {
  try {
    return (
      await CONST.gqlClient.query({
        query: gql`
          query placeCardRead(
            # $uuid: String!
            # $phoneNumber: String!
            # $token: String!
            $placeUuid: String!
            $cardUuid: String!
          ) {
            placeCardRead(
              # uuid: $uuid
              # phoneNumber: $phoneNumber
              # token: $token
              placeUuid: $placeUuid
              cardUuid: $cardUuid
            ) {
              cardUuid
              cardTitle
              cardText
              photo {
                photoUuid
                width
                height
                active

                imgUrl
                thumbUrl
              }
            }
          }
        `,
        variables: {
          placeUuid,
          cardUuid,
        },
        fetchPolicy: 'no-cache',
      })
    ).data.placeCardRead
  } catch (err015) {
    // console.log(err015)
    Toast.show({
      text1: 'Unable to read Card for Place',
      text2: err015.toString(),
      type: 'error',
      topOffset,
    })
  }
  return null
}

export async function placeCardSave({
  uuid,
  phoneNumber,
  token,
  placeUuid,
  cardUuid,
  cardTitle,
  cardText,
}) {
  try {
    return (
      await CONST.gqlClient.mutate({
        mutation: gql`
          mutation placeCardSave(
            $uuid: String
            $phoneNumber: String
            $token: String
            $placeUuid: String!
            $cardUuid: String!
            $cardTitle: String!
            $cardText: String!
          ) {
            placeCardSave(
              uuid: $uuid
              phoneNumber: $phoneNumber
              token: $token
              placeUuid: $placeUuid
              cardUuid: $cardUuid
              cardTitle: $cardTitle
              cardText: $cardText
            ) {
              cardUuid
              cardTitle
              cardText
              active
            }
          }
        `,
        variables: {
          uuid,
          phoneNumber,
          token,
          placeUuid,
          cardUuid,
          cardTitle,
          cardText,
        },
      })
    ).data.placeCardSave
  } catch (err016) {
    // console.log({ err016 })
    Toast.show({
      text1: 'Unable to save Card for Place',
      text2: err016.toString(),
      type: 'error',
      topOffset,
    })
  }
  return null
}

export async function generateUploadUrlForCard({
  uuid,
  phoneNumber,
  token,
  assetKey,
  contentType,
  placeUuid,
  cardUuid,
}) {
  try {
    return (
      await CONST.gqlClient.mutate({
        mutation: gql`
          mutation generateUploadUrlForCard(
            $uuid: String
            $phoneNumber: String
            $token: String
            $assetKey: String!
            $contentType: String!
            $placeUuid: String!
            $cardUuid: String!
          ) {
            generateUploadUrlForCard(
              uuid: $uuid
              phoneNumber: $phoneNumber
              token: $token
              assetKey: $assetKey
              contentType: $contentType
              placeUuid: $placeUuid
              cardUuid: $cardUuid
            ) {
              photo {
                photoUuid
                thumbUrl
              }
              uploadUrl
            }
          }
        `,
        variables: {
          uuid,
          phoneNumber,
          token,
          assetKey,
          contentType,
          placeUuid,
          cardUuid,
        },
      })
    ).data.generateUploadUrlForCard
  } catch (err017) {
    // navigation.navigate('PhoneCheck')
    Toast.show({
      text1: 'Unable to generate upload Url',
      text2: err017.toString(),
      type: 'error',
      topOffset,
    })
  }
  return null
}

export async function placeCardPhotoDelete({
  uuid,
  phoneNumber,
  token,

  placeUuid,
  photoUuid,
}) {
  try {
    return (
      await CONST.gqlClient.mutate({
        mutation: gql`
          mutation placeCardPhotoDelete(
            $uuid: String
            $phoneNumber: String
            $token: String
            $placeUuid: String!
            $photoUuid: String!
          ) {
            placeCardPhotoDelete(
              uuid: $uuid
              phoneNumber: $phoneNumber
              token: $token
              placeUuid: $placeUuid
              photoUuid: $photoUuid
            )
          }
        `,
        variables: {
          uuid,
          phoneNumber,
          token,
          placeUuid,
          photoUuid,
        },
      })
    ).data.placeCardPhotoDelete
  } catch (err018) {
    Toast.show({
      text1: 'Unable to delete photo',
      text2: err018.toString(),
      type: 'error',
      topOffset,
    })
  }
  return null
}

export async function placeCardDelete({
  uuid,
  phoneNumber,
  token,

  placeUuid,
  cardUuid,
}) {
  try {
    return (
      await CONST.gqlClient.mutate({
        mutation: gql`
          mutation placeCardDelete(
            $uuid: String
            $phoneNumber: String
            $token: String
            $placeUuid: String!
            $cardUuid: String!
          ) {
            placeCardDelete(
              uuid: $uuid
              phoneNumber: $phoneNumber
              token: $token
              placeUuid: $placeUuid
              cardUuid: $cardUuid
            )
          }
        `,
        variables: {
          uuid,
          phoneNumber,
          token,
          placeUuid,
          cardUuid,
        },
      })
    ).data.placeCardDelete
  } catch (err019) {
    Toast.show({
      text1: 'Unable to delete card',
      text2: err019.toString(),
      type: 'error',
      topOffset,
    })
  }
  return null
}

export async function placeDelete({
  uuid,
  phoneNumber,
  token,

  placeUuid,
}) {
  try {
    return (
      await CONST.gqlClient.mutate({
        mutation: gql`
          mutation placeDelete(
            $uuid: String
            $phoneNumber: String
            $token: String
            $placeUuid: String!
          ) {
            placeDelete(
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
      })
    ).data.placeDelete
  } catch (err020) {
    Toast.show({
      text1: 'Unable to delete place',
      text2: err020.toString(),
      type: 'error',
      topOffset,
    })
  }
  return null
}
