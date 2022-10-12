import React, { useRef, useState /* useEffect */ } from 'react'
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

import CachedImage from 'expo-cached-image'
import * as FileSystem from 'expo-file-system'

import { v4 as uuidv4 } from 'uuid'
import { gql } from '@apollo/client'

import PropTypes from 'prop-types'

import * as CONST from '../../consts'

const FOOTER_HEIGHT = 70

function PhotosCard(props) {
  const { photos, auth, placeUuid, reloadFunction } = props

  const { width, height } = useDimensions().window
  const topOffset = height / 3

  const navigation = useNavigation()
  const [showSpinner, setShowSpinner] = useState(false)

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
      await reloadFunction()
      // init()
    }
  }

  const renderItem = function ({ item, index }) {
    const { photoUuid, thumbUrl } = item
    // console.log({ index })
    return (
      <View
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
      </View>
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
          // disabled={!canSubmit}
        >
          {`  Take Photo`}
          <Icon type="MaterialIcons" name="add-a-photo" color="white" />
        </Button>
      </Card>
    </>
  )
}

export default PhotosCard
