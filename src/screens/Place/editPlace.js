import React, { useEffect, useState } from 'react'
import { useNavigation } from '@react-navigation/native'

import { useDimensions } from '@react-native-community/hooks'

import * as Location from 'expo-location'

import { Alert, SafeAreaView, StyleSheet, ScrollView, View } from 'react-native'

import {
  Text,
  Input,
  LinearProgress,
  Card,
  ListItem,
  Button,
} from '@rneui/themed'

import { gql } from '@apollo/client'
import Spinner from 'react-native-loading-spinner-overlay'

// import * as FileSystem from 'expo-file-system'
import Toast from 'react-native-toast-message'

import {
  FontAwesome,
  Ionicons,
  MaterialCommunityIcons,
} from '@expo/vector-icons'

import PropTypes from 'prop-types'

import * as CONST from '../../consts'
import * as UTILS from '../../utils'
import { VALID } from '../../valid'

function EditPlace() {
  const navigation = useNavigation()
  const [uuid, setUuid] = useState(null)
  const [phoneNumber, setPhoneNumber] = useState(null)
  const [token, setToken] = useState(null)

  const [showSpinner, setShowSpinner] = useState(false)

  const { width, height } = useDimensions().window
  const topOffset = height / 3

  const [descriptionError, setDescriptionError] = useState('')

  const [canSubmit, setCanSubmit] = useState(false)

  // const handleSubmit = async () => {
  //   setShowSpinner(true)

  //   try {
  //     const response = (
  //       await CONST.gqlClient.mutate({
  //         mutation: gql`
  //           mutation createPlace(
  //             $uuid: String!
  //             $phoneNumber: String!
  //             $token: String!
  //             $placeName: String!
  //             $streetAddress1: String!
  //             $streetAddress2: String!
  //             $city: String!
  //             $country: String!
  //             $district: String!
  //             $isoCountryCode: String!
  //             $postalCode: String!
  //             $region: String!
  //             $subregion: String!
  //             $timezone: String!
  //             $lat: Float!
  //             $lon: Float!
  //           ) {
  //             createPlace(
  //               uuid: $uuid
  //               phoneNumber: $phoneNumber
  //               token: $token
  //               placeName: $placeName
  //               streetAddress1: $streetAddress1
  //               streetAddress2: $streetAddress2
  //               city: $city
  //               country: $country
  //               district: $district
  //               isoCountryCode: $isoCountryCode
  //               postalCode: $postalCode
  //               region: $region
  //               subregion: $subregion
  //               timezone: $timezone
  //               lat: $lat
  //               lon: $lon
  //             ) {
  //               place {
  //                 placeUuid
  //                 # placeName
  //                 # streetAddress1
  //                 # streetAddress2
  //                 # city
  //                 # country
  //                 # district
  //                 # isoCountryCode
  //                 # postalCode
  //                 # region
  //                 # subregion
  //                 # timezone
  //                 # location
  //                 # createdAt
  //               }
  //               # placeOwner {
  //               #   placeUuid
  //               #   phoneNumber
  //               #   role
  //               #   createdAt
  //               # }
  //             }
  //           }
  //         `,
  //         variables: {
  //           uuid,
  //           phoneNumber,
  //           token,
  //           placeName: formInput.placeName,
  //           streetAddress1: formInput.streetAddress1,
  //           streetAddress2: formInput.streetAddress2,
  //           city: formInput.city,
  //           country: formInput.country,
  //           district: formInput.district,
  //           isoCountryCode: formInput.isoCountryCode,
  //           postalCode: formInput.postalCode,
  //           region: formInput.region,
  //           subregion: formInput.subregion,
  //           timezone: formInput.timezone,
  //           lat: formInput.lat,
  //           lon: formInput.lon,
  //         },
  //       })
  //     ).data.createPlace

  //     console.log({ response: JSON.stringify(response) })
  //     const { placeUuid } = response.place
  //   } catch (err4) {
  //     console.log({ err4 })

  //     Toast.show({
  //       text1: 'Unable to create Place, try again.',
  //       text2: err4.toString(),
  //       type: 'error',
  //       topOffset,
  //     })
  //   }
  //   setShowSpinner(false)
  // }

  const renderHeaderRight = () => null
  // <Ionicons
  //   // onPress={canSubmit ? () => handleSubmit() : null}
  //   name="send"
  //   size={30}
  //   style={{
  //     marginRight: 10,
  //     color: canSubmit ? CONST.MAIN_COLOR : CONST.SECONDARY_COLOR,
  //   }}
  // />
  const renderHeaderLeft = () => (
    <FontAwesome
      name="chevron-left"
      size={30}
      style={{
        marginLeft: 10,
        color: CONST.MAIN_COLOR,
        width: 60,
      }}
      onPress={() => navigation.goBack()}
    />
  )

  async function init() {
    const localToken = await UTILS.getToken()

    if (!localToken) {
      navigation.navigate('PhoneCheck')
      Toast.show({
        text1: 'Need to Validate your Phone Number first',
        type: 'info',
        topOffset,
      })
    } else {
      setToken(localToken)
      setUuid(await UTILS.getUUID())
      setPhoneNumber(await UTILS.getPhoneNumber())
    }
  }

  // useEffect(() => {
  //   navigation.setOptions({
  //     headerRight: renderHeaderRight,
  //   })
  // }, [canSubmit])

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      init()
    })
    return unsubscribe
  }, [navigation])

  useEffect(() => {
    navigation.setOptions({
      headerTitle: '',
      headerTintColor: CONST.MAIN_COLOR,
      headerRight: renderHeaderRight,
      headerLeft: renderHeaderLeft,
      headerBackTitle: '',
      headerStyle: {
        backgroundColor: CONST.NAV_COLOR,
      },
    })
    // init()
  }, [])

  const styles = StyleSheet.create({
    container: {
      flex: 1,
    },
    scrollView: {
      alignItems: 'center',
      marginHorizontal: 0,
      paddingBottom: 300,
    },
  })

  return (
    <SafeAreaView style={styles.container}>
      <Spinner
        visible={showSpinner}
        textContent={'Loading...'}
        // textStyle={styles.spinnerTextStyle}
      />
      <ScrollView>
        <Card>
          <Input
            label="Place Name"
            placeholder={`What do you call this place`}
            errorMessage={placeNameError}
            value={`${formInput.placeName}`}
            onChangeText={(value) =>
              setFormInput({ ...formInput, placeName: value })
            }
            autoCapitalize={'words'}
            autoComplete={'off'}
            autoCorrect={false}
            autoFocus={true}
          />
          <Input
            label="Street Address1"
            placeholder={`${formInput.streetAddress1}`}
            errorMessage={streetAddress1Error}
            value={`${formInput.streetAddress1}`}
            onChangeText={(value) =>
              setFormInput({ ...formInput, streetAddress1: value })
            }
            autoCapitalize={'words'}
            autoComplete={'off'}
            autoCorrect={false}
          />
          <Input
            label="Street Address2"
            placeholder={`${formInput.streetAddress2}`}
            errorMessage={streetAddress2Error}
            value={`${formInput.streetAddress2}`}
            onChangeText={(value) =>
              setFormInput({ ...formInput, streetAddress2: value })
            }
            autoCapitalize={'words'}
            autoComplete={'off'}
            autoCorrect={false}
          />
          <Card.Divider />

          <Input
            label="City"
            placeholder={`${formInput.city}`}
            errorMessage={cityError}
            value={`${formInput.city}`}
            onChangeText={(value) =>
              setFormInput({ ...formInput, city: value })
            }
            autoCapitalize={'words'}
            autoComplete={'off'}
            autoCorrect={false}
            editable={false}
          />
          <Input
            label="State"
            placeholder={`${formInput.region}`}
            errorMessage={regionError}
            value={`${formInput.region}`}
            onChangeText={(value) =>
              setFormInput({ ...formInput, region: value })
            }
            autoCapitalize={'none'}
            autoComplete={'off'}
            autoCorrect={false}
            editable={false}
          />
          <Input
            label="Postal Code"
            placeholder={`${formInput.postalCode}`}
            errorMessage={postalCodeError}
            value={`${formInput.postalCode}`}
            onChangeText={(value) =>
              setFormInput({ ...formInput, postalCode: value })
            }
            autoCapitalize={'none'}
            autoComplete={'off'}
            autoCorrect={false}
            editable={false}
          />
        </Card>
      </ScrollView>
    </SafeAreaView>
  )
}
export default EditPlace
