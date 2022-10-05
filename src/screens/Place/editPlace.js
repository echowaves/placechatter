import React, { useEffect, useState } from 'react'
import { useNavigation } from '@react-navigation/native'

import { useDimensions } from '@react-native-community/hooks'

import * as Location from 'expo-location'

import { Alert, SafeAreaView, StyleSheet, ScrollView, View } from 'react-native'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'

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

function EditPlace({ placeUuid }) {
  const navigation = useNavigation()
  const [auth, setAuth] = useState()

  const [showSpinner, setShowSpinner] = useState(false)

  const { width, height } = useDimensions().window
  const topOffset = height / 3

  const [description, setDescription] = useState('')
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
    setAuth(await UTILS.checkAuthentication({ navigation, topOffset }))
  }

  function isValid() {
    if (!VALID.placeDescription(description)) {
      setDescriptionError('100-1000 Alpha-Numeric characters')
      return false
    }
    setDescriptionError('')
    return true
  }

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
    init()
  }, [])

  useEffect(() => {
    setCanSubmit(isValid())
  }, [description])

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
      <KeyboardAwareScrollView>
        <Card>
          <Input
            label="Place Description"
            // leftIcon={{ type: 'MaterialIcons', name: 'description' }}
            placeholder={`What do you call this place`}
            errorMessage={descriptionError}
            value={`${description}`}
            onChangeText={(value) => setDescription(value)}
            multiline
            autoCapitalize={'sentences'}
            autoComplete={'off'}
            autoCorrect={true}
            autoFocus={true}
          />
          <Button
            size="lg"
            icon={{
              name: 'send',
              type: 'Ionicons',
              size: 25,
              marginLeft: 20,
              color: canSubmit ? CONST.MAIN_COLOR : CONST.SECONDARY_COLOR,
            }}
            iconRight
            // color={canSubmit ? CONST.MAIN_COLOR : CONST.SECONDARY_COLOR}
            disabled={!canSubmit}
          >
            {`${description.length} save`}
          </Button>
        </Card>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  )
}
export default EditPlace
