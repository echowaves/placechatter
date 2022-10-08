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

function EditPlace({ route, navigation }) {
  const { placeUuid } = route.params

  const [auth, setAuth] = useState({})

  const [showSpinner, setShowSpinner] = useState(false)

  const { width, height } = useDimensions().window
  const topOffset = height / 3

  // const [placeDetails, setPlaceDetails] = useState({})
  const [loadedPlaceDescription, setLoadedPlaceDescription] = useState('')

  const [placeDescription, setPlaceDescription] = useState('')
  const [placeDescriptionError, setPlaceDescriptionError] = useState('')
  const [canSubmit, setCanSubmit] = useState(false)

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
    setShowSpinner(true)
    const { token, uuid, phoneNumber } = await UTILS.checkAuthentication({
      navigation,
      topOffset,
    })

    setAuth({ token, uuid, phoneNumber }) // the auth will be used later by mutators, but has to be initialized here once

    try {
      const place = (
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
                placeUuid
                placeName
                placeDescription
              }
            }
          `,
          variables: {
            // uuid,
            // phoneNumber,
            // token,
            placeUuid,
          },
        })
      ).data.placeRead
      // alert(response)

      navigation.setOptions({
        headerTitle: place.placeName,
      })

      setLoadedPlaceDescription(place.placeDescription)

      // console.log({ place })
    } catch (err7) {
      console.log({ err7 })
      Toast.show({
        text1: 'Unable to load Place info, try again.',
        text2: err7.toString(),
        type: 'error',
        topOffset,
      })

      // setNickNameError('Lettters and digits only')
    }
    setShowSpinner(false)
  }

  function isValid() {
    if (placeDescription === loadedPlaceDescription) {
      setPlaceDescriptionError('')
      return false
    }
    if (VALID.placeDescription(placeDescription)) {
      setPlaceDescriptionError('')
      return true
    }
    setPlaceDescriptionError('10-1000 Alpha-Numeric characters')
    return false
  }

  const handleUpdateDescription = async () => {
    setShowSpinner(true)
    const { token, uuid, phoneNumber } = auth

    try {
      const response = (
        await CONST.gqlClient.mutate({
          mutation: gql`
            mutation placeDescriptionUpdate(
              $uuid: String!
              $phoneNumber: String!
              $token: String!
              $placeUuid: String!
              $placeDescription: String!
            ) {
              placeDescriptionUpdate(
                uuid: $uuid
                phoneNumber: $phoneNumber
                token: $token
                placeUuid: $placeUuid
                placeDescription: $placeDescription
              )
            }
          `,
          variables: {
            uuid,
            phoneNumber,
            token,
            placeUuid,
            placeDescription,
          },
        })
      ).data.placeDescriptionUpdate

      setLoadedPlaceDescription(placeDescription)
      setCanSubmit(false)

      // console.log({ response: JSON.stringify(response) })
    } catch (err8) {
      console.log({ err8 })

      Toast.show({
        text1: 'Unable to update Place description, try again.',
        text2: err8.toString(),
        type: 'error',
        topOffset,
      })
    }
    setShowSpinner(false)
    // await init()
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
  }, [placeDescription])

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
            placeholder={`What is so special about this place`}
            errorMessage={placeDescriptionError}
            value={`${placeDescription}`}
            onChangeText={setPlaceDescription}
            multiline
            autoCapitalize={'sentences'}
            autoComplete={'off'}
            autoCorrect={true}
            // autoFocus={true}
          />
          <Button
            onPress={handleUpdateDescription}
            size="lg"
            icon={{
              name: 'send',
              type: 'Ionicons',
              size: 25,
              color: canSubmit ? CONST.MAIN_COLOR : CONST.SECONDARY_COLOR,
            }}
            iconRight
            // color={canSubmit ? CONST.MAIN_COLOR : CONST.SECONDARY_COLOR}
            disabled={!canSubmit}
          >
            {`save ${placeDescription.length} `}
          </Button>
        </Card>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  )
}
export default EditPlace
