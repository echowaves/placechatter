import React, { useEffect, useState, useContext } from 'react'
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

import * as CONST from '../../consts'
import * as UTILS from '../../utils'
import { VALID } from '../../valid'

function Place({ route, navigation }) {
  const { placeUuid } = route.params
  const [placeContext, setPlaceContext] = useContext(CONST.PlaceContext)
  const [authContext, setAuthContext] = useContext(CONST.AuthContext)

  const [showSpinner, setShowSpinner] = useState(false)

  const { width, height } = useDimensions().window
  const topOffset = height / 3

  // const [place, setPlace] = useState()

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

  async function loadPlace() {
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
                streetAddress1
                streetAddress2
                city
                district
                postalCode
                region
              }
              cards {
                cardTitle
                cardText
                photo {
                  imgUrl
                  thumbUrl
                }
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
        // fetchPolicy: 'network-only',
        fetchPolicy: 'no-cache',
      })
    ).data.placeRead
    // alert(response)
  }

  const init = async () => {
    // console.log('initializing................................')
    setShowSpinner(true)
    const { token, uuid, phoneNumber } = await UTILS.checkAuthentication({
      navigation,
      topOffset,
    })
    setAuthContext({ token, uuid, phoneNumber })

    try {
      const loadedPlace = await loadPlace()
      // console.log({ loadedPlace })

      navigation.setOptions({
        headerTitle: `${loadedPlace?.place.placeName}`,
      })
      // console.log({ loadedPlace })
      const { place, cards } = loadedPlace
      setPlaceContext({ place: {}, cards: [] })
      setPlaceContext({ ...placeContext, place, cards })
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

  function isValid() {}

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

  const { place, cards } = placeContext
  if (!place) {
    return (
      <Spinner
        visible={true}
        textContent={'Loading...'}
        // textStyle={styles.spinnerTextStyle}
      />
    )
  }

  // console.log('re-render')
  return (
    <SafeAreaView style={styles.container}>
      <Spinner
        visible={showSpinner}
        textContent={'Loading...'}
        // textStyle={styles.spinnerTextStyle}
      />
      <KeyboardAwareScrollView>
        <Card>
          <Card.Title>Address</Card.Title>
          <Text>{place.streetAddress1}</Text>
          <Text>{place.streetAddress2}</Text>
          <Text>
            {place.city}, {place.region} {place.postalCode}
          </Text>
        </Card>

        <Card>
          <Button
            onPress={() => navigation.navigate('PlaceCardAdd')}
            size="lg"
            color="green"
            iconRight
          >
            {`  Add Card`}
            <Icon name="add" color="white" />
          </Button>
        </Card>

        {placeContext.cards.map((card, index) => (
          <Card key={index}>
            <Card.Title>{card.cardTitle}</Card.Title>
            {/* {card.photoUuid && } */}
            <Text>{card.cardText}</Text>
          </Card>
        ))}

        <Card>
          <Button
            onPress={() => navigation.navigate('Place', { placeUuid })}
            size="lg"
            color="red"
            iconRight
          >
            {`  Delete Place`}
            <Icon name="delete" color="white" />
          </Button>
        </Card>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  )
}
export default Place
