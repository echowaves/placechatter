import React, { useRef, useState, useEffect, useContext } from 'react'
// import { useFocusEffect } from '@react-navigation/native'

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

import * as ImageManipulator from 'expo-image-manipulator'
import * as MediaLibrary from 'expo-media-library'
import * as ImagePicker from 'expo-image-picker'
import * as Linking from 'expo-linking'

import Markdown from 'react-native-markdown-display'

import { CacheManager } from 'expo-cached-image'
import * as FileSystem from 'expo-file-system'

import { v4 as uuidv4 } from 'uuid'

import PropTypes from 'prop-types'

import Photo from './Photo'

import * as CONST from '../../consts'
import { VALID } from '../../valid'
import * as UTILS from '../../utils'

import MarkdownHelp, { markdownStyles } from '../../markdownHelp'

function PlaceCardEdit({ route, navigation }) {
  const { placeUuid, cardUuid } = route.params
  const { authContext } = useContext(CONST.AuthContext)

  const { width, height } = useDimensions().window

  const topOffset = height / 3

  const [showSpinner, setShowSpinner] = useState(false)

  const [canSubmit, setCanSubmit] = useState(false)

  const [cardTitle, setCardTitle] = useState('')
  const [cardText, setCardText] = useState('')

  const [cardPhoto, setCardPhoto] = useState()

  const [cardTitleError, setCardTitleError] = useState('')
  const [cardTextError, setCardTextError] = useState('')
  const [unchanged, setUnchanged] = useState(true)

  const back = async () => {
    navigation.goBack()
  }

  const uploadImage = async ({ contentType, assetUri }) => {
    const photoUuid = uuidv4()
    const { uuid, phoneNumber, token } = authContext

    const photoForUpload = await UTILS.generateUploadUrlForCard({
      uuid,
      phoneNumber,
      token,
      assetKey: photoUuid,
      contentType,
      placeUuid,
      cardUuid,
    })

    // console.log({ photoForUpload })
    // console.log({ assetUri })
    CacheManager.addToCache({
      file: assetUri,
      key: `${photoUuid}.webp`,
    })
    CacheManager.addToCache({
      file: assetUri,
      key: `${photoUuid}-thumb.webp`,
    })

    const { uploadUrl, photo } = photoForUpload

    const responseData = await FileSystem.uploadAsync(uploadUrl, assetUri, {
      httpMethod: 'PUT',
      headers: {
        'Content-Type': contentType,
      },
    })
    // console.log({ responseData })

    // let's wait for the file to be processed in the backend
    // await new Promise((r) => setTimeout(r, 5000)) // eslint-disable-line no-promise-executor-return

    // wait for photo to upload
    // eslint-disable-next-line no-plusplus
    for (let i = 0; i < 20; i++) {
      // eslint-disable-next-line no-await-in-loop
      await new Promise((r) => setTimeout(r, 1000)) // eslint-disable-line no-promise-executor-return
      // eslint-disable-next-line no-await-in-loop
      const loadedCard = await UTILS.placeCardRead({
        placeUuid,
        cardUuid,
      })
      if (loadedCard?.photo) {
        break
      }
      if (i === 19) {
        Toast.show({
          text1: 'Error adding photo',
          type: 'error',
          topOffset,
        })
        setShowSpinner(false)
        back()
      }
    }

    return { responseData, photo }
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
        back()
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
            onPress: () => back(),
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

  const init = async () => {
    // console.log('initializing................................')
    setShowSpinner(true)
    // const { token, uuid, phoneNumber } = await UTILS.checkAuthentication({
    //   navigation,
    //   topOffset,
    // })
    // // setAuthContext({ token, uuid, phoneNumber })
    if (!cardUuid) {
      return
    }

    try {
      const loadedCard = await UTILS.placeCardRead({
        placeUuid,
        cardUuid,
      })
      // console.log({ loadedCard })
      setCardTitle(
        loadedCard?.cardTitle === 'New Card' ? '' : loadedCard?.cardTitle,
      )
      setCardText(
        loadedCard?.cardText === 'Update Card Description, add optional photo.'
          ? ''
          : loadedCard?.cardText,
      )
      setCardPhoto(loadedCard?.photo)

      setUnchanged(true)
      navigation.setOptions({
        headerTitle: loadedCard?.cardTitle,
        headerLeft: renderHeaderLeftUnchanged,
      })
    } catch (err12) {
      // console.log({ err12 })
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

  const deletePhoto = async () => {
    const { uuid, phoneNumber, token } = authContext
    setShowSpinner(true)

    const returnValue = await UTILS.placeCardPhotoDelete({
      uuid,
      phoneNumber,
      token,

      placeUuid,
      photoUuid: cardPhoto?.photoUuid,
    })
    // console.log({ returnValue })
    await init()
    setShowSpinner(false)
  }

  const takePhoto = async ({ camera }) => {
    try {
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

      let imagePickerReturn

      if (camera === true) {
        imagePickerReturn = await ImagePicker.launchCameraAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          quality: 1.0,
          // allowsEditing: true,
          // aspect: [1, 1],
          exif: false,
        })
      } else {
        imagePickerReturn = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          quality: 1.0,
          // allowsEditing: true,
          // aspect: [1, 1],
          exif: false,
        })
      }

      // alert(`cameraReturn.cancelled ${cameraReturn.cancelled}`)
      if (imagePickerReturn.canceled === false) {
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
        const imageWidth = imagePickerReturn.assets[0].width
        const imageHeight = imagePickerReturn.assets[0].height
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

        MediaLibrary.saveToLibraryAsync(imagePickerReturn.assets[0].uri)

        const locallyThumbedImage = await ImageManipulator.manipulateAsync(
          imagePickerReturn.assets[0].uri,
          [{ resize: { height: 300 } }],
          { compress: 1, format: ImageManipulator.SaveFormat.PNG },
        )

        try {
          const response = await uploadImage({
            placeUuid,
            contentType: 'image/png',
            assetUri: imagePickerReturn.assets[0].uri,
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
        // console.log(reloadedPlace.photos[0])
        // setShowSpinner(false)
        // console.log({ reloadedPlace })
        await init()
        setShowSpinner(false)
      }
    } catch (err002) {
      Toast.show({
        text1: 'Unable to take photo',
        text2: err002.toString(),
        type: 'error',
        topOffset,
      })
    }
  }

  useEffect(() => {
    setUnchanged(true)
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
    setUnchanged(false)
    navigation.setOptions({
      headerLeft: renderHeaderLeftChanged,
    })
  }, [cardTitle, cardText])

  const saveCard = async () => {
    setShowSpinner(true)

    try {
      const { uuid, phoneNumber, token } = authContext
      const placeCard = await UTILS.placeCardSave({
        uuid,
        phoneNumber,
        token,
        placeUuid,
        cardUuid,
        cardTitle,
        cardText,
      })
      setUnchanged(true)
      navigation.setOptions({
        headerTitle: placeCard?.cardTitle,
        headerLeft: renderHeaderLeftUnchanged,
      })
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

  const deleteCard = async () => {
    setShowSpinner(true)

    try {
      const { uuid, phoneNumber, token } = authContext
      const deleted = await UTILS.placeCardDelete({
        uuid,
        phoneNumber,
        token,
        placeUuid,
        cardUuid,
      })

      if (deleted === true) {
        // setCardUuid(null)
        back()
        // setPlaceContext({
        //   ...placeContext,
        //   cards: [
        //     ...placeContext.cards.filter((card) => card.cardUuid !== cardUuid),
        //   ],
        // })
        // navigation.goBack()
      }
      // console.log({ response: JSON.stringify(response) })

      // await navigation.popToTop()
    } catch (err12) {
      console.log({ err12 })
      Toast.show({
        text1: 'Unable to delete card, try again.',
        text2: err12.toString(),
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
        textContent={'Updating Card...'}
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
            <Button
              onPress={() => {
                Alert.alert('Adding Photo from', 'pick the media', [
                  {
                    text: 'Camera',
                    onPress: () => takePhoto({ camera: true }),
                  },
                  {
                    text: 'Library',
                    onPress: () => takePhoto({ camera: false }),
                  },
                  {
                    text: 'Cancel',
                    onPress: () => null,
                    style: 'cancel',
                  },
                ])

                //   Alert.alert([
                //     '',
                //     '',
                //     {
                //       text: 'Take a photo with Camera',
                //       onPress: () => takePhoto({ camera: true }),
                //     },
                //     {
                //       text: 'Upload photo from your Phone',
                //       onPress: () => takePhoto({ camera: false }),
                //     },
                //   ])
              }}
              size="lg"
              iconRight
              color="green"
            >
              {`  Add Photo`}
              <Icon name="camera" color="white" />
            </Button>
          )}
          {cardPhoto && (
            <>
              <Photo photo={cardPhoto} />
              <Button
                onPress={() => {
                  Alert.alert('Photo Delete', 'Are you sure?', [
                    {
                      text: 'Delete',
                      onPress: () => deletePhoto(),
                    },
                    {
                      text: 'Cancel',
                      onPress: () => null,
                      style: 'cancel',
                    },
                  ])
                }}
                size="lg"
                iconRight
                color="red"
              >
                {`  Delete Photo`}
                <Icon name="delete" color="white" />
              </Button>
            </>
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
            color={
              canSubmit && !unchanged ? CONST.MAIN_COLOR : CONST.SECONDARY_COLOR
            }
          >
            {`  Save Card`}
            <Icon name="save" color="white" />
          </Button>
        </Card>
        <MarkdownHelp />
        <Card.Divider />
        <Card>
          <Markdown style={markdownStyles}>{cardText}</Markdown>
        </Card>

        <Card>
          <Button
            onPress={() => {
              Alert.alert('Card Delete', 'Are you sure?', [
                {
                  text: 'Delete',
                  onPress: () => deleteCard(),
                },
                {
                  text: 'Cancel',
                  onPress: () => null,
                  style: 'cancel',
                },
              ])
            }}
            size="lg"
            iconRight
            color={'red'}
          >
            {`  Delete Card`}
            <Icon name="delete" color="white" />
          </Button>
        </Card>
      </KeyboardAwareScrollView>
    </>
  )
}

export default PlaceCardEdit
