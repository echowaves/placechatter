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

function Place({ route, navigation }) {
  const { placeUuid } = route.params

  const [auth, setAuth] = useState({})

  const [showSpinner, setShowSpinner] = useState(false)

  const { width, height } = useDimensions().window
  const topOffset = height / 3

  const [place, setPlace] = useState()

  const [placeDescription, setPlaceDescription] = useState()
  const [loadedPlaceDescription, setLoadedPlaceDescription] = useState()

  const [placeDescriptionError, setPlaceDescriptionError] = useState('')
  const [canSubmitDescription, setCanSubmitDescription] = useState(false)

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

  async function loadPlace({ placeUuidToLoad }) {
    // console.log({ placeUuidToLoad })
    return (
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
          placeUuid: placeUuidToLoad,
        },
        // fetchPolicy: 'network-only',
        fetchPolicy: 'no-cache',
      })
    ).data.placeRead
    // alert(response)
  }

  async function init() {
    // console.log('initializing................................')
    setShowSpinner(true)
    const { token, uuid, phoneNumber } = await UTILS.checkAuthentication({
      navigation,
      topOffset,
    })

    setAuth({ token, uuid, phoneNumber }) // the auth will be used later by mutators, but has to be initialized here once

    try {
      const loadedPlace = await loadPlace({ placeUuidToLoad: placeUuid })
      navigation.setOptions({
        headerTitle: `${loadedPlace?.place.placeName}`,
      })
      // console.log({ loadedPlace })
      setPlace(loadedPlace)
      setLoadedPlaceDescription(loadedPlace?.place.placeDescription)
      setPlaceDescription(loadedPlace?.place.placeDescription)

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
      setCanSubmitDescription(false)

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
    setCanSubmitDescription(isValid())
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
        {place && <PhotosCard place={place} auth={auth} />}
        <Card>
          <Card.Title>Address</Card.Title>
          <Text>{place?.place.streetAddress1}</Text>
          <Text>{place?.place.streetAddress2}</Text>
          <Text>
            {place?.place.city}, {place?.place.region} {place?.place.postalCode}
          </Text>
        </Card>
        <Card>
          <Input
            label="Place Description"
            // leftIcon={{ type: 'MaterialIcons', name: 'description' }}
            placeholder={`What is so special about this place`}
            errorMessage={placeDescriptionError}
            value={`${placeDescription}`}
            onChangeText={(value) => {
              setPlaceDescription(value)
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
            disabled={!canSubmitDescription}
          >
            {`  Save ${placeDescription?.length} `}
            <Icon type="FontAwesome" name="save" color="white" />
          </Button>
        </Card>
        <Card>
          <Button
            onPress={() => navigation.navigate('Place', { placeUuid })}
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
export default Place