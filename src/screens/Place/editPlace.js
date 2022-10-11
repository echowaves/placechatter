import React, { useEffect, useState } from 'react'
import { useNavigation } from '@react-navigation/native'

import { useDimensions } from '@react-native-community/hooks'
import * as FileSystem from 'expo-file-system'

import * as Location from 'expo-location'
import * as ImagePicker from 'expo-image-picker'
import { v4 as uuidv4 } from 'uuid'

import { Alert, SafeAreaView, StyleSheet, ScrollView, View } from 'react-native'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import * as Linking from 'expo-linking'

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

import * as ImageManipulator from 'expo-image-manipulator'
import * as MediaLibrary from 'expo-media-library'

import PropTypes from 'prop-types'

import PhotosCard from './photosCard'
import * as CONST from '../../consts'
import * as UTILS from '../../utils'
import { VALID } from '../../valid'

function EditPlace({ route, navigation }) {
  const { placeUuid } = route.params

  const [auth, setAuth] = useState({})

  const [showSpinner, setShowSpinner] = useState(false)
  const [spinnerText, setSpinnerText] = useState()

  const { width, height } = useDimensions().window
  const topOffset = height / 3

  const [place, setPlace] = useState()
  const [photos, setPhotos] = useState()

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
    setSpinnerText('loading...')
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
                place {
                  placeUuid
                  placeName
                  placeDescription
                  streetAddress1
                  streetAddress2
                  city
                  district
                  postalCode
                  region
                }
                photos {
                  photoUuid
                  phoneNumber
                  imgUrl
                  thumbUrl
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
        })
      ).data.placeRead
      // alert(response)

      navigation.setOptions({
        headerTitle: `edit: ${loadedPlace?.place.placeName}`,
      })

      setPlace(loadedPlace.place)
      setLoadedPlaceDescription(loadedPlace?.place.placeDescription)

      setPhotos(loadedPlace.photos)

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
    setSpinnerText('loading...')
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

  const uploadImage = async ({ contentType, assetUri }) => {
    const photoUuid = uuidv4()
    const { uuid, phoneNumber, token } = auth

    // console.log({ assetKey })
    const uploadUrl = (
      await CONST.gqlClient.mutate({
        mutation: gql`
          mutation generateUploadUrl(
            $uuid: String!
            $phoneNumber: String!
            $token: String!
            $assetKey: String!
            $contentType: String!
            $placeUuid: String
          ) {
            generateUploadUrl(
              uuid: $uuid
              phoneNumber: $phoneNumber
              token: $token
              assetKey: $assetKey
              contentType: $contentType
              placeUuid: $placeUuid
            )
          }
        `,
        variables: {
          uuid,
          phoneNumber,
          token,
          assetKey: photoUuid,
          contentType,
          placeUuid,
        },
      })
    ).data.generateUploadUrl

    // console.log({ uploadUrl })

    const responseData = await FileSystem.uploadAsync(
      uploadUrl,
      `${assetUri}`,
      {
        httpMethod: 'PUT',
        headers: {
          'Content-Type': contentType,
        },
      },
    )
    // console.log({ responseData })
    return { responseData }
  }

  const takePhoto = async () => {
    // launch photo capturing
    const cameraPermission = await ImagePicker.requestCameraPermissionsAsync()
    // console.log({ cameraPermission })

    if (!cameraPermission?.granted) {
      Alert.alert(
        'Photo permission is not granted',
        'Allow photo taking in settings',
        [
          {
            text: 'Open Settings',
            onPress: () => {
              Linking.openSettings()
            },
          },
        ],
      )
      return
    }
    const mediaPermission =
      await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (!mediaPermission?.granted) {
      Alert.alert(
        'Photo library permission is not granted',
        'Allow photos to be saved  on your device in settings',
        [
          {
            text: 'Open Settings',
            onPress: () => {
              Linking.openSettings()
            },
          },
        ],
      )
      return
    }

    const cameraReturn = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1.0,
      // allowsEditing: true,
      // aspect: [1, 1],
      exif: false,
    })

    // alert(`cameraReturn.cancelled ${cameraReturn.cancelled}`)
    if (cameraReturn.cancelled === false) {
      setShowSpinner(true)
      setSpinnerText('Uploading photo...')

      // have to wait, otherwise the upload will not start
      // await dispatch(
      //   reducer.queueFileForUpload({
      //     cameraImgUrl: cameraReturn.uri,
      //     type: cameraReturn.type,
      //     location,
      //   }),
      // )
      // dispatch(reducer.uploadPendingPhotos())
      // console.log({ cameraReturn })
      const imageWidth = cameraReturn.width
      const imageHeight = cameraReturn.height
      const imageCropDim = imageWidth < imageHeight ? imageWidth : imageHeight

      const croppedImage = await ImageManipulator.manipulateAsync(
        cameraReturn.uri,
        [
          {
            crop: {
              originX: (imageWidth - imageCropDim) / 2,
              originY: (imageHeight - imageCropDim) / 2,
              height: imageCropDim,
              width: imageCropDim,
            },
          },
        ],
        { compress: 1, format: ImageManipulator.SaveFormat.PNG },
      )

      await MediaLibrary.saveToLibraryAsync(croppedImage.uri)

      // const manipResult = await ImageManipulator.manipulateAsync(
      //   localImgUrl,
      //   [{ resize: { height: 300 } }],
      //   { compress: 1, format: ImageManipulator.SaveFormat.PNG },
      // )
      // return manipResult.uri

      // console.log('cancelled not')
      try {
        const response = await uploadImage({
          contentType: 'image/jpeg',
          assetUri: croppedImage.uri,
        })
      } catch (err10) {
        Toast.show({
          text1: 'Unable to add photo',
          text2: err10.toString(),
          type: 'error',
          topOffset,
        })
      }
      // console.log({ responseData: response.responseData })

      setShowSpinner(false)
      init()
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
        <PhotosCard photos={photos} takePhoto={takePhoto} />

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
            iconRight
            // color={canSubmit ? CONST.MAIN_COLOR : CONST.SECONDARY_COLOR}
            disabled={!canSubmit}
          >
            {`save ${place?.placeDescription.length} `}
            <Icon type="FontAwesome" name="save" color="white" />
          </Button>
        </Card>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  )
}
export default EditPlace
