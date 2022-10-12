import React, { useEffect, useState } from 'react'
import { useNavigation } from '@react-navigation/native'

import { useDimensions } from '@react-native-community/hooks'
import * as FileSystem from 'expo-file-system'

import * as Location from 'expo-location'

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

import PropTypes from 'prop-types'

import PhotosCard from './photosCard'
import * as CONST from '../../consts'
import * as UTILS from '../../utils'
import { VALID } from '../../valid'

function ViewPlace({ route, navigation }) {
  const { placeUuid } = route.params

  const [auth, setAuth] = useState({})

  const [showSpinner, setShowSpinner] = useState(false)

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
    console.log('initializing................................')
    setShowSpinner(true)
    const { token, uuid, phoneNumber } = await UTILS.checkAuthentication({
      navigation,
      topOffset,
    })

    setAuth({ token, uuid, phoneNumber }) // the auth will be used later by mutators, but has to be initialized here once

    try {
      await CONST.gqlClient.clearStore()
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
        headerTitle: `${loadedPlace?.place.placeName}`,
      })

      setPlace(loadedPlace.place)
      setLoadedPlaceDescription(loadedPlace?.place.placeDescription)

      setPhotos([])
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

  return (
    <SafeAreaView style={styles.container}>
      <Spinner
        visible={showSpinner}
        textContent={'Loading...'}
        // textStyle={styles.spinnerTextStyle}
      />
      <KeyboardAwareScrollView>
        <PhotosCard
          photos={photos}
          auth={auth}
          placeUuid={placeUuid}
          reloadFunction={init}
        />
        <Card>
          <Card.Title>Address</Card.Title>
          <Text>{place?.streetAddress1}</Text>
          <Text>{place?.streetAddress2}</Text>
          <Text>
            {place?.city}, {place?.region} {place?.postalCode}
          </Text>
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
          <Button
            onPress={handleUpdateDescription}
            size="lg"
            iconRight
            // color={canSubmit ? CONST.MAIN_COLOR : CONST.SECONDARY_COLOR}
            disabled={!canSubmit}
          >
            {`  Save ${place?.placeDescription.length} `}
            <Icon type="FontAwesome" name="save" color="white" />
          </Button>
        </Card>
        <Card>
          <Button
            onPress={() => navigation.navigate('ViewPlace', { placeUuid })}
            size="lg"
            color="red"
            iconRight
          >
            {`  Delete`}
            <Icon name="delete" color="white" />
          </Button>
        </Card>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  )
}
export default ViewPlace
