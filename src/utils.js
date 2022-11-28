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
    await SecureStore.setItemAsync(CONST.UUID_KEY, `${uuid}`)
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
    await SecureStore.setItemAsync(CONST.NICK_NAME_KEY, `${nickName}`)
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
    await SecureStore.setItemAsync(CONST.PHONE_NUMBER_KEY, `${phoneNumber}`)
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
    await SecureStore.setItemAsync(CONST.TOKEN_KEY, `${token}`)
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
    const isPhoneConfirmed = (
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
    // console.log({ isPhoneConfirmed })
    if (!isPhoneConfirmed) {
      throw new Error('Have to confirm your phone number')
    }
    return true
  } catch (err011) {
    // console.log({ err011 })
  }
  navigation.navigate('PhoneCheck')
  Toast.show({
    text1: 'Need to confirm your phone number',
    // text2: err01.toString(),
    type: 'error',
    topOffset,
  })
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
              sortOrder
              createdAt
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

export async function placeCardSwap({
  uuid,
  phoneNumber,
  token,

  placeUuid,
  cardUuid1,
  cardUuid2,
}) {
  try {
    return (
      await CONST.gqlClient.mutate({
        mutation: gql`
          mutation placeCardSwap(
            $uuid: String
            $phoneNumber: String
            $token: String
            $placeUuid: String!
            $cardUuid1: String!
            $cardUuid2: String!
          ) {
            placeCardSwap(
              uuid: $uuid
              phoneNumber: $phoneNumber
              token: $token
              placeUuid: $placeUuid
              cardUuid1: $cardUuid1
              cardUuid2: $cardUuid2
            )
          }
        `,
        variables: {
          uuid,
          phoneNumber,
          token,
          placeUuid,
          cardUuid1,
          cardUuid2,
        },
      })
    ).data.placeCardSwap
  } catch (err019) {
    // console.log({ err019 })
    Toast.show({
      text1: 'Unable to swap cards',
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

export async function placePhoneCreate({
  uuid,
  phoneNumber,
  token,

  phone,
  placeUuid,
}) {
  try {
    return (
      await CONST.gqlClient.mutate({
        mutation: gql`
          mutation placePhoneCreate(
            $uuid: String
            $phoneNumber: String
            $token: String
            $phone: String
            $placeUuid: String!
          ) {
            placePhoneCreate(
              uuid: $uuid
              phoneNumber: $phoneNumber
              token: $token
              phone: $phone
              placeUuid: $placeUuid
            ) {
              phoneNumber
              nickName
              role
              createdAt
            }
          }
        `,
        variables: {
          uuid,
          phoneNumber,
          token,
          phone,
          placeUuid,
        },
        fetchPolicy: 'no-cache',
      })
    ).data.placePhoneCreate
  } catch (err021) {
    // console.log({ err021 })
    Toast.show({
      text1: 'Unable to add phone to place',
      text2: err021.toString(),
      type: 'error',
      topOffset,
    })
  }
  return null
}

export async function placePhoneDelete({
  uuid,
  phoneNumber,
  token,

  phone,
  placeUuid,
}) {
  try {
    return (
      await CONST.gqlClient.mutate({
        mutation: gql`
          mutation placePhoneDelete(
            $uuid: String
            $phoneNumber: String
            $token: String
            $phone: String
            $placeUuid: String!
          ) {
            placePhoneDelete(
              uuid: $uuid
              phoneNumber: $phoneNumber
              token: $token
              phone: $phone
              placeUuid: $placeUuid
            )
          }
        `,
        variables: {
          uuid,
          phoneNumber,
          token,
          phone,
          placeUuid,
        },
      })
    ).data.placePhoneDelete
  } catch (err022) {
    Toast.show({
      text1: 'Unable to delete phone from place',
      text2: err022.toString(),
      type: 'error',
      topOffset,
    })
  }
  return null
}

export async function feedbackCreate({
  uuid,
  phoneNumber,
  token,

  feedbackText,
}) {
  try {
    const feedback = (
      await CONST.gqlClient.mutate({
        mutation: gql`
          mutation feedbackCreate(
            $uuid: String
            $phoneNumber: String
            $token: String
            $feedbackText: String!
          ) {
            feedbackCreate(
              uuid: $uuid
              phoneNumber: $phoneNumber
              token: $token
              feedbackText: $feedbackText
            ) {
              createdAt
            }
          }
        `,
        variables: {
          uuid,
          phoneNumber,
          token,
          feedbackText,
        },
      })
    ).data.feedbackCreate
    // console.log({ feedback })
    return feedback
  } catch (err023) {
    // console.log({ err023 })
    Toast.show({
      text1: 'Unable to post feedback',
      text2: err023.toString(),
      type: 'error',
      topOffset,
    })
  }
  return null
}

export async function placePhoneList({
  uuid,
  phoneNumber,
  token,

  placeUuid,
}) {
  try {
    return (
      await CONST.gqlClient.query({
        query: gql`
          query placePhoneList(
            $uuid: String!
            $phoneNumber: String!
            $token: String!
            $placeUuid: String!
          ) {
            placePhoneList(
              uuid: $uuid
              phoneNumber: $phoneNumber
              token: $token
              placeUuid: $placeUuid
            ) {
              phoneNumber
              nickName
              role
              createdAt
            }
          }
        `,
        variables: {
          uuid,
          phoneNumber,
          token,
          placeUuid,
        },
        // fetchPolicy: 'network-only',
        fetchPolicy: 'no-cache',
      })
    ).data.placePhoneList
    // alert(response)
  } catch (err024) {
    // console.log({ err009 })
    Toast.show({
      text1: 'Unable to Read phones for Place',
      text2: err024.toString(),
      type: 'error',
      topOffset,
    })
  }
  return null
}

export async function feedbackList({ uuid, phoneNumber, token }) {
  try {
    return (
      await CONST.gqlClient.query({
        query: gql`
          query feedbackList(
            $uuid: String!
            $phoneNumber: String!
            $token: String!
          ) {
            feedbackList(
              uuid: $uuid
              phoneNumber: $phoneNumber
              token: $token
            ) {
              createdAt
              phoneNumber
              feedbackText
            }
          }
        `,
        variables: {
          uuid,
          phoneNumber,
          token,
        },
        // fetchPolicy: 'network-only',
        fetchPolicy: 'no-cache',
      })
    ).data.feedbackList
    // alert(response)
  } catch (err025) {
    // console.log({ err009 })
    Toast.show({
      text1: 'Unable to get feedback list',
      text2: err025.toString(),
      type: 'error',
      topOffset,
    })
  }
  return []
}

export async function placeChatReadDefault({
  uuid,
  phoneNumber,
  token,
  placeUuid,
}) {
  try {
    return (
      await CONST.gqlClient.query({
        query: gql`
          query placeChatReadDefault(
            $uuid: String!
            $phoneNumber: String!
            $token: String!
            $placeUuid: String!
          ) {
            placeChatReadDefault(
              uuid: $uuid
              phoneNumber: $phoneNumber
              token: $token
              placeUuid: $placeUuid
            ) {
              placeUuid
              chatUuid
              chatName
              defaultChat
              createdAt
            }
          }
        `,
        variables: {
          uuid,
          phoneNumber,
          token,
          placeUuid,
        },
        fetchPolicy: 'network-only',
        // fetchPolicy: 'no-cache',
      })
    ).data.placeChatReadDefault
  } catch (err026) {
    // console.log({ err026 })
    Toast.show({
      text1: 'Unable to get default chat for place',
      text2: err026.toString(),
      type: 'error',
      topOffset,
    })
  }
  return null
}

function messageMapper(message) {
  // console.log({
  //   ...message,
  //   _id: message.messageUuid,
  //   text: message.messageText,
  //   // pending: message.pending,
  //   createdAt: message.createdAt,
  //   user: {
  //     _id: message.createdBy,
  //     name: message.nickName,
  //   },
  // })

  return {
    ...message,
    _id: message.messageUuid,
    text: message.messageText,
    // pending: message.pending,
    createdAt: message.createdAt,
    user: {
      _id: message.createdBy,
      name: message.nickName,
      // avatar: 'https://placeimg.com/140/140/any',
    },
  }
}

export async function messageList({
  uuid,
  phoneNumber,
  token,

  chatUuid,
  lastLoaded,
}) {
  // console.log({ lastLoaded })
  try {
    const messagesList = (
      await CONST.gqlClient.query({
        query: gql`
          query messageList(
            $uuid: String
            $phoneNumber: String
            $token: String
            $chatUuid: String!
            $lastLoaded: AWSDateTime!
          ) {
            messageList(
              uuid: $uuid
              phoneNumber: $phoneNumber
              token: $token
              chatUuid: $chatUuid
              lastLoaded: $lastLoaded
            ) {
              chatUuid
              messageUuid
              createdBy # phoneNumber
              messageText
              createdAt
              nickName
            }
          }
        `,
        variables: {
          uuid,
          phoneNumber,
          token,
          chatUuid,
          lastLoaded,
        },
        // fetchPolicy: 'network-only',
        fetchPolicy: 'no-cache',
      })
    ).data.messageList

    // console.log({ messagesList })

    return messagesList.map((message) => messageMapper(message))
  } catch (err027) {
    // console.log({ err027 })
    Toast.show({
      text1: 'Unable to load messages for chat',
      text2: err027.toString(),
      type: 'error',
      topOffset,
    })
  }
  return null
}

export async function messageSend({
  uuid,
  phoneNumber,
  token,
  messageUuid,
  chatUuid,
  messageText,
}) {
  try {
    // console.log({
    //   uuid,
    //   phoneNumber,
    //   token,
    //   messageUuid,
    //   chatUuid,
    //   messageText,
    // })

    const message = (
      await CONST.gqlClient.mutate({
        mutation: gql`
          mutation messageSend(
            $uuidArg: String
            $phoneNumberArg: String
            $tokenArg: String
            $messageUuidArg: String!
            $chatUuidArg: String!
            $messageTextArg: String!
          ) {
            messageSend(
              uuidArg: $uuidArg
              phoneNumberArg: $phoneNumberArg
              tokenArg: $tokenArg
              messageUuidArg: $messageUuidArg
              chatUuidArg: $chatUuidArg
              messageTextArg: $messageTextArg
            ) {
              chatUuid
              messageUuid
              createdBy
              nickName
              messageText
              createdAt
            }
          }
        `,
        variables: {
          uuidArg: uuid,
          phoneNumberArg: phoneNumber,
          tokenArg: token,
          messageUuidArg: messageUuid,
          chatUuidArg: chatUuid,
          messageTextArg: messageText,
        },
      })
    ).data.messageSend

    // console.log({ message })
    return messageMapper(message)
  } catch (err030) {
    console.log({ err030 })
    Toast.show({
      text2: 'Unable to activate phone',
      text1: err030.toString(),
      type: 'error',
      topOffset,
    })
  }
  return null
}

export async function unreadCountReset({ uuid, phoneNumber, token, chatUuid }) {
  try {
    return (
      await CONST.gqlClient.mutate({
        mutation: gql`
          mutation unreadCountReset(
            $uuid: String
            $phoneNumber: String
            $token: String
            $chatUuid: String!
          ) {
            unreadCountReset(
              uuid: $uuid
              phoneNumber: $phoneNumber
              token: $token
              chatUuid: $chatUuid
            )
          }
        `,
        variables: {
          uuid,
          phoneNumber,
          token,
          chatUuid,
        },
      })
    ).data.unreadCountReset
  } catch (err030) {
    console.log({ err030 })
    Toast.show({
      text2: 'Unable to reset message count',
      text1: err030.toString(),
      type: 'error',
      topOffset,
    })
  }
  return null
}
