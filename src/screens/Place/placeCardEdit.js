import React, { useRef, useState, useEffect, useContext } from 'react'
import { useFocusEffect, useNavigation } from '@react-navigation/native'

import { useDimensions } from '@react-native-community/hooks'

import { FontAwesome, Ionicons, AntDesign } from '@expo/vector-icons'
import Toast from 'react-native-toast-message'
import Spinner from 'react-native-loading-spinner-overlay'

import {
  View,
  TouchableOpacity,
  Alert,
  InteractionManager,
  ScrollView,
  SafeAreaView,
  StyleSheet,
  FlatList,
} from 'react-native'

import {
  Text,
  Card,
  LinearProgress,
  Divider,
  Badge,
  Icon,
  Button,
} from '@rneui/themed'

import { Col, Row, Grid } from 'react-native-easy-grid'
import * as ImageManipulator from 'expo-image-manipulator'
import * as MediaLibrary from 'expo-media-library'
import * as ImagePicker from 'expo-image-picker'
import * as Linking from 'expo-linking'

import CachedImage, { CacheManager } from 'expo-cached-image'
import * as FileSystem from 'expo-file-system'

import { v4 as uuidv4 } from 'uuid'
import { gql } from '@apollo/client'

import PropTypes from 'prop-types'

import * as CONST from '../../consts'

function PlaceCardEdit({ photos }) {
  const { width, height } = useDimensions().window

  const [placeContext, setPlaceContext] = useContext(CONST.PlaceContext)
  const [authContext, setAuthContext] = useContext(CONST.AuthContext)

  const topOffset = height / 3

  const navigation = useNavigation()
  const [showSpinner, setShowSpinner] = useState(false)
  // console.log({ place })
  // console.log({ photos })

  // useEffect(() => {
  //   // console.log({ photos_length: place?.photos?.length })
  //   // setPhotos(place.photos)
  // }, [])

  // useEffect(() => {
  //   // console.log({ photos_length: place?.photos?.length })
  //   setPhotos(placeContext.photos)
  // }, [placeContext])

  const uploadImage = async ({ placeUuid, contentType, assetUri }) => {
    const photoUuid = uuidv4()
    const { uuid, phoneNumber, token } = authContext

    const photoForUpload = (
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
            ) {
              photo {
                thumbUrl
                photoUuid
              }
              uploadUrl
            }
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

    // console.log({ photoForUpload })
    // console.log({ assetUri })
    // CacheManager.addToCache({
    //   file: assetUri,
    //   key: `${photoUuid}`,
    // })
    // CacheManager.addToCache({
    //   file: assetUri,
    //   key: `${photoUuid}-thumb`,
    // })

    const { uploadUrl, photo } = photoForUpload

    const responseData = await FileSystem.uploadAsync(uploadUrl, assetUri, {
      httpMethod: 'PUT',
      headers: {
        'Content-Type': contentType,
      },
    })
    // console.log({ responseData })
    return { responseData, photo }
  }

  const takePhoto = async () => {
    if (photos.length > 10) {
      Toast.show({
        text1: 'More than 10 photos.',
        text2: 'Delete some photos first',
        type: 'info',
        topOffset,
      })
      return
    }
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

      MediaLibrary.saveToLibraryAsync(croppedImage.uri)

      const locallyThumbedImage = await ImageManipulator.manipulateAsync(
        croppedImage.uri,
        [{ resize: { height: 300 } }],
        { compress: 1, format: ImageManipulator.SaveFormat.PNG },
      )

      // const manipResult = await ImageManipulator.manipulateAsync(
      //   localImgUrl,
      //   [{ resize: { height: 300 } }],
      //   { compress: 1, format: ImageManipulator.SaveFormat.PNG },
      // )
      // return manipResult.uri
      // console.log('cancelled not')
      try {
        const response = await uploadImage({
          placeUuid: placeContext?.place?.placeUuid,
          contentType: 'image/png',
          assetUri: croppedImage.uri,
        })
        // console.log({ response })

        await CacheManager.addToCache({
          file: croppedImage.uri,
          key: `${response.photo.photoUuid}`,
        })
        await CacheManager.addToCache({
          file: locallyThumbedImage.uri,
          key: `${response.photo.photoUuid}-thumb`,
        })

        // const photosClone = photos
        // await setPhotos([])
        // await setPhotos([response.photo, ...photosClone])
        setPlaceContext({
          ...placeContext,
          photos: [response.photo, ...photos],
        })
      } catch (err10) {
        console.log({ err10 })
        Toast.show({
          text1: 'Unable to add photo',
          text2: err10.toString(),
          type: 'error',
          topOffset,
        })
      }
      // console.log({ responseData: response.responseData })
      // init()
      // console.log(reloadedPlace.photos[0])
      // setShowSpinner(false)
      // console.log({ reloadedPlace })

      setShowSpinner(false)
    }
  }

  const renderItem = ({ item, index }) => {
    const { photoUuid, thumbUrl } = item
    // console.log({ index, item })
    return (
      <TouchableOpacity
        onPress={() => navigation.navigate('PhotosSwiper', { index })}
        key={index}
        style={{
          padding: 5,
        }}
      >
        <CachedImage
          source={{
            uri: `${thumbUrl}`,
            // expiresIn: 5, // seconds. This field is optional
          }}
          cacheKey={`${photoUuid}-thumb`}
          resizeMode="contain"
          style={{
            flex: 1,
            alignSelf: 'stretch',
            width: 150,
            height: 150,
            borderRadius: 10,
          }}
        />
      </TouchableOpacity>
    )
  }

  return (
    <>
      <Spinner
        visible={showSpinner}
        textContent={'Uploading photo...'}
        // textStyle={styles.spinnerTextStyle}
      />
      <Card>
        <Card.Title>place photos</Card.Title>
        <FlatList
          horizontal={true}
          data={photos}
          renderItem={renderItem}
          // keyExtractor={(item) => item.id}
          // extraData={selectedId}
        />

        <Button
          onPress={takePhoto}
          size="lg"
          iconRight
          // color={canSubmit ? CONST.MAIN_COLOR : CONST.SECONDARY_COLOR}
        >
          {`  Add Photo`}
          <Icon type="MaterialIcons" name="add-a-photo" color="white" />
        </Button>
      </Card>
    </>
  )
}

export default PlaceCardEdit
