import React, { useRef, useState, useEffect, useContext } from 'react'
import { useFocusEffect, useNavigation } from '@react-navigation/native'

import { useDimensions } from '@react-native-community/hooks'

import { FontAwesome, Ionicons, AntDesign } from '@expo/vector-icons'
import Toast from 'react-native-toast-message'
import Spinner from 'react-native-loading-spinner-overlay'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'

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
  Input,
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
import { VALID } from '../../valid'
import * as UTILS from '../../utils'

function PlaceCardEdit({ route, navigation }) {
  const { cardUuid } = route.params

  const { width, height } = useDimensions().window

  const [placeContext, setPlaceContext] = useContext(CONST.PlaceContext)
  const [authContext, setAuthContext] = useContext(CONST.AuthContext)

  const topOffset = height / 3

  const [showSpinner, setShowSpinner] = useState(false)

  const [canSubmit, setCanSubmit] = useState(false)

  const [cardTitle, setCardTitle] = useState('')
  const [cardText, setCardText] = useState('')

  const [cardPhoto, setCardPhoto] = useState()

  const [cardTitleError, setCardTitleError] = useState('')
  const [cardTextError, setCardTextError] = useState('')

  const uploadImage = async ({ placeUuid, contentType, assetUri }) => {
    const photoUuid = uuidv4()
    const { uuid, phoneNumber, token } = authContext

    const photoForUpload = (
      await CONST.gqlClient.mutate({
        mutation: gql`
          mutation generateUploadUrlForCard(
            $uuid: String!
            $phoneNumber: String!
            $token: String!
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
          cardUuid,
        },
      })
    ).data.generateUploadUrlForCard

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

      // const croppedImage = await ImageManipulator.manipulateAsync(
      //   cameraReturn.uri,
      //   [
      //     {
      //       crop: {
      //         originX: (imageWidth - imageCropDim) / 2,
      //         originY: (imageHeight - imageCropDim) / 2,
      //         height: imageCropDim,
      //         width: imageCropDim,
      //       },
      //     },
      //   ],
      //   { compress: 1, format: ImageManipulator.SaveFormat.PNG },
      // )

      // MediaLibrary.saveToLibraryAsync(croppedImage.uri)

      // const locallyThumbedImage = await ImageManipulator.manipulateAsync(
      //   croppedImage.uri,
      //   [{ resize: { height: 300 } }],
      //   { compress: 1, format: ImageManipulator.SaveFormat.PNG },
      // )

      MediaLibrary.saveToLibraryAsync(cameraReturn.uri)

      const locallyThumbedImage = await ImageManipulator.manipulateAsync(
        cameraReturn.uri,
        [{ resize: { height: 300 } }],
        { compress: 1, format: ImageManipulator.SaveFormat.PNG },
      )

      try {
        const response = await uploadImage({
          placeUuid: placeContext?.place?.placeUuid,
          contentType: 'image/png',
          assetUri: cameraReturn.uri,
        })
        // console.log({ response })

        // await CacheManager.addToCache({
        //   file: cameraReturn.uri,
        //   key: `${response.photo.photoUuid}`,
        // })
        // await CacheManager.addToCache({
        //   file: locallyThumbedImage.uri,
        //   key: `${response.photo.photoUuid}-thumb`,
        // })

        // const photosClone = photos
        // await setPhotos([])
        // await setPhotos([response.photo, ...photosClone])
        // setPlaceContext({
        //   ...placeContext,
        //   cards: [response.photo, ...photos],
        // })
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

  const exit = async () => {
    await navigation.popToTop()
    navigation.navigate('Place', {
      placeUuid: placeContext.place.placeUuid,
    })
  }

  const renderHeaderRight = () => null
  const renderHeaderLeftUnchanged = () => (
    <FontAwesome
      name="chevron-left"
      size={30}
      style={{
        marginLeft: 10,
        color: CONST.MAIN_COLOR,
        width: 60,
      }}
      onPress={() => {
        exit()
      }}
    />
  )
  const renderHeaderLeftChanged = () => (
    <FontAwesome
      name="chevron-left"
      size={30}
      style={{
        marginLeft: 10,
        color: CONST.SECONDARY_COLOR,
        width: 60,
      }}
      onPress={() => {
        Alert.alert('You have unsaved changes', 'Really want to exit?', [
          {
            text: 'exit',
            onPress: () => exit(),
          },
          {
            text: 'continue editing',
            onPress: () => null,
            style: 'cancel',
          },
        ])
      }}
    />
  )

  async function loadCard() {
    // console.log({ placeUuidToLoad })
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
                imgUrl
                thumbUrl
              }
            }
          }
        `,
        variables: {
          placeUuid: placeContext.place.placeUuid,
          cardUuid,
        },
        fetchPolicy: 'no-cache',
      })
    ).data.placeCardRead
  }

  const init = async () => {
    // console.log('initializing................................')
    setShowSpinner(true)
    // const { token, uuid, phoneNumber } = await UTILS.checkAuthentication({
    //   navigation,
    //   topOffset,
    // })
    // // setAuthContext({ token, uuid, phoneNumber })

    try {
      const loadedCard = await loadCard()
      console.log({ loadedCard })

      // console.log({ loadedPlace })
      // const { place, cards } = loadedCard
      // setPlaceContext({ place: {}, cards: [] })
      // setPlaceContext({ ...placeContext, place, cards })
      // console.log({ place })
      setCardTitle(loadedCard?.cardTitle)
      setCardText(loadedCard?.cardText)
      setCardPhoto(loadedCard?.photo)

      navigation.setOptions({
        headerTitle: loadedCard?.cardTitle,
        headerLeft: renderHeaderLeftUnchanged,
      })
    } catch (err12) {
      console.log({ err12 })
      Toast.show({
        text1: 'Unable to load Card info, try again.',
        text2: err12.toString(),
        type: 'error',
        topOffset,
      })

      // setNickNameError('Lettters and digits only')
    }
    setShowSpinner(false)
  }

  useEffect(() => {
    navigation.setOptions({
      headerTitle: '',
      headerTintColor: CONST.MAIN_COLOR,
      headerRight: renderHeaderRight,
      headerLeft: renderHeaderLeftUnchanged,
      headerBackTitle: '',
      headerStyle: {
        backgroundColor: CONST.NAV_COLOR,
      },
    })
    init()
  }, [])

  const valid = () => {
    setCardTitleError('')
    setCardTextError('')
    setCanSubmit(true)

    if (!VALID.cardTitle(cardTitle)) {
      setCardTitleError('4-50 characters')
      setCanSubmit(false)
    }
    if (!VALID.cardText(cardText)) {
      setCardTextError('4-1024 characters')
      setCanSubmit(false)
    }
  }

  useEffect(() => {
    // console.log({ smsCode, nickName })
    valid()
    navigation.setOptions({
      headerLeft: renderHeaderLeftChanged,
    })
  }, [cardTitle, cardText])

  const saveCard = async () => {
    setShowSpinner(true)

    try {
      const { uuid, phoneNumber, token } = authContext
      const placeCard = (
        await CONST.gqlClient.mutate({
          mutation: gql`
            mutation placeCardSave(
              $uuid: String!
              $phoneNumber: String!
              $token: String!
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
            placeUuid: placeContext.place.placeUuid,
            cardUuid,
            cardTitle,
            cardText,
          },
        })
      ).data.placeCardSave

      navigation.setOptions({
        headerTitle: placeCard?.cardTitle,
        headerLeft: renderHeaderLeftUnchanged,
      })

      // console.log({ response: JSON.stringify(response) })

      // await navigation.popToTop()
      // navigation.navigate('Place', { placeUuid: placeContext.place.placeUuid })
    } catch (err11) {
      console.log({ err11 })
      Toast.show({
        text1: 'Unable to save card, try again.',
        text2: err11.toString(),
        type: 'error',
        topOffset,
      })
    }
    setShowSpinner(false)
  }

  return (
    <>
      <Spinner
        visible={showSpinner}
        textContent={'Adding Card...'}
        // textStyle={styles.spinnerTextStyle}
      />
      <KeyboardAwareScrollView>
        <Card>
          {/* <Card.Title>place photos</Card.Title> */}
          <Input
            label="Card Title"
            // leftIcon={{ type: 'MaterialIcons', name: 'description' }}
            placeholder={`enter title`}
            errorMessage={cardTitleError}
            value={`${cardTitle}`}
            onChangeText={(value) => {
              setCardTitle(value)
              // valid()
            }}
            multiline={false}
            autoCapitalize={'sentences'}
            autoComplete={'off'}
            autoCorrect={true}
            // autoFocus={true}
          />

          {!cardPhoto && (
            <Button onPress={takePhoto} size="lg" iconRight color="green">
              {`  Add Photo`}
              <Icon name="camera" color="white" />
            </Button>
          )}
          <Card.Divider />
          <Input
            label="Card Text"
            // leftIcon={{ type: 'MaterialIcons', name: 'description' }}
            placeholder={`enter text`}
            errorMessage={cardTextError}
            value={`${cardText}`}
            onChangeText={(value) => {
              setCardText(value)
              // valid()
            }}
            multiline
            autoCapitalize={'sentences'}
            autoComplete={'off'}
            autoCorrect={true}
            // autoFocus={true}
          />

          <Button
            onPress={saveCard}
            size="lg"
            iconRight
            color={canSubmit ? CONST.MAIN_COLOR : CONST.SECONDARY_COLOR}
          >
            {`  Save Card`}
            <Icon name="save" color="white" />
          </Button>
        </Card>
      </KeyboardAwareScrollView>
    </>
  )
}

export default PlaceCardEdit
