import React, { useEffect, useState } from 'react'
import { useNavigation } from '@react-navigation/native'

import { useDimensions } from '@react-native-community/hooks'

import * as Location from 'expo-location'
import * as ImagePicker from 'expo-image-picker'

import { Alert, SafeAreaView, StyleSheet, ScrollView, View } from 'react-native'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'

import {
  Text,
  Input,
  LinearProgress,
  Card,
  ListItem,
  Button,
  Icon,
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

  const [place, setPlace] = useState()

  const [loadedPlaceDescription, setLoadedPlaceDescription] = useState()

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
      const loadedPlace = (
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
        headerTitle: place?.placeName,
      })

      setPlace(loadedPlace)

      setLoadedPlaceDescription(loadedPlace?.placeDescription)

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
    if (place?.placeDescription === loadedPlaceDescription) {
      setPlaceDescriptionError('')
      return false
    }
    if (VALID.placeDescription(place?.placeDescription)) {
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
            placeDescription: place?.placeDescription,
          },
        })
      ).data.placeDescriptionUpdate

      setLoadedPlaceDescription(place?.placeDescription)
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
  }, [place?.placeDescription])

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

  const checkPermissionsForPhotoTaking = async ({ cameraType }) => {
    // const locationPermission = await checkPermission({
    //   permissionFunction: Location.requestForegroundPermissionsAsync,
    //   alertHeader:
    //     'Placechatter shows you place closest on your current location.',
    //   alertBody: 'You need to enable Location in Settings and Try Again.',
    // })
    // if (locationPermission === 'granted') {
    //   const location = await Location.getCurrentPositionAsync({
    //     accuracy: Location.Accuracy.BestForNavigation,
    //   })
    //   // console.log({ location })
    //   return location
    //   // initially set the location that is last known -- works much faster this way
    // }
    // return null
    // const cameraPermission = await _checkPermission({
    //   permissionFunction: ImagePicker.requestCameraPermissionsAsync,
    //   alertHeader: 'Do you want to take photo with wisaw?',
    //   alertBody: "Why don't you enable photo permission?",
    // })
    // if (cameraPermission === 'granted') {
    //   const photoAlbomPermission = await _checkPermission({
    //     permissionFunction: ImagePicker.requestMediaLibraryPermissionsAsync,
    //     alertHeader: 'Do you want to save photo on your device?',
    //     alertBody: "Why don't you enable the permission?",
    //     permissionFunctionArgument: true,
    //   })
    //   if (photoAlbomPermission === 'granted') {
    //     await takePhoto({ cameraType })
    //   }
    // }
  }

  const takePhoto = async ({ cameraType }) => {
    let cameraReturn
    if (cameraType === 'camera') {
      // launch photo capturing
      cameraReturn = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        // allowsEditing: true,
        quality: 1.0,
        exif: false,
      })
    } else {
      // launch video capturing
      cameraReturn = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Videos,
        // allowsEditing: true,
        videoMaxDuration: 5,
        quality: 1.0,
        exif: false,
      })
    }

    // alert(`cameraReturn.cancelled ${cameraReturn.cancelled}`)
    if (cameraReturn.cancelled === false) {
      await MediaLibrary.saveToLibraryAsync(cameraReturn.uri)
      // have to wait, otherwise the upload will not start
      await dispatch(
        reducer.queueFileForUpload({
          cameraImgUrl: cameraReturn.uri,
          type: cameraReturn.type,
          location,
        }),
      )

      dispatch(reducer.uploadPendingPhotos())
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <Spinner
        visible={showSpinner}
        textContent={'Loading...'}
        // textStyle={styles.spinnerTextStyle}
      />
      <KeyboardAwareScrollView>
        <Card>
          <Card.Title>place photos</Card.Title>
          <Icon name="add-circle" color={CONST.MAIN_COLOR} />
        </Card>

        <Card>
          <Input
            label="Place Description"
            // leftIcon={{ type: 'MaterialIcons', name: 'description' }}
            placeholder={`What is so special about this place`}
            errorMessage={placeDescriptionError}
            value={`${place?.placeDescription}`}
            onChangeText={(value) => {
              setPlace({ ...place, placeDescription: value })
            }}
            multiline
            autoCapitalize={'sentences'}
            autoComplete={'off'}
            autoCorrect={true}
            // autoFocus={true}
          />
        </Card>
        <Card>
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
            {`save ${place?.placeDescription.length} `}
          </Button>
        </Card>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  )
}
export default EditPlace
