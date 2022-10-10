import React, { useEffect, useState, useCallback } from 'react'
import { useNavigation, useFocusEffect } from '@react-navigation/native'

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

function ViewPlace({ route, navigation }) {
  const { placeUuid } = route.params

  // const [auth, setAuth] = useState({})

  // const [showSpinner, setShowSpinner] = useState(false)

  const { width, height } = useDimensions().window
  const topOffset = height / 3

  // const [placeDetails, setPlaceDetails] = useState({})

  const [place, setPlace] = useState()
  const [photos, setPhotos] = useState()

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

  async function load() {
    // setShowSpinner(true)
    // const { token, uuid, phoneNumber } = await UTILS.checkAuthentication({
    //   navigation,
    //   topOffset,
    // })

    // setAuth({ token, uuid, phoneNumber }) // the auth will be used later by mutators, but has to be initialized here once

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
      // console.log({ loadedPlace })
      navigation.setOptions({
        headerTitle: loadedPlace.place.placeName,
      })

      setPlace(loadedPlace.place)
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
    // setShowSpinner(false)
  }

  useFocusEffect(
    useCallback(() => {
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
      load()
    }, []),
  )

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

  if (!place) {
    return (
      <View style={styles.container}>
        <LinearProgress color={CONST.MAIN_COLOR} />
      </View>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* <Spinner
        visible={showSpinner}
        textContent={'Loading...'}
        // textStyle={styles.spinnerTextStyle}
      /> */}
      <KeyboardAwareScrollView>
        <Card>
          <Card.Title>Address</Card.Title>
          <Text>{place.streetAddress1}</Text>
          <Text>{place.streetAddress2}</Text>
          <Text>
            {place.city} {place.region} {place.postalCode}
          </Text>
        </Card>
        <Card>
          <Card.Title>Place Description</Card.Title>
          <Text>{place.placeDescription}</Text>
        </Card>
        <Card>
          <Button
            onPress={() => navigation.navigate('EditPlace', { placeUuid })}
            size="lg"
            iconRight
          >
            {`edit`}
            <Icon name="edit" color="white" />
          </Button>
        </Card>
        <Card>
          <Button
            onPress={() => navigation.navigate('EditPlace', { placeUuid })}
            size="lg"
            color="red"
            iconRight
          >
            {`delete`}
            <Icon name="delete" color="white" />
          </Button>
        </Card>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  )
}
export default ViewPlace
