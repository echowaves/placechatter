import React, { useEffect, useState } from 'react'
import { useNavigation } from '@react-navigation/native'

import { useDimensions } from '@react-native-community/hooks'

import * as Location from 'expo-location'

import { Alert, SafeAreaView, StyleSheet, ScrollView, View } from 'react-native'

import {
  Text,
  Input,
  LinearProgress,
  Card,
  ListItem,
  Button,
} from '@rneui/themed'

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

function AddNewPlace() {
  const navigation = useNavigation()
  const [token, setToken] = useState(null)

  const { width, height } = useDimensions().window
  const [topOffset, setTopOffset] = useState(height / 3)
  const [currentLocation, setCurrentLocation] = useState(null)
  const [locationGeocodedAddress, setLocationGeocodedAddress] = useState(null)

  const [canSubmit, setCanSubmit] = useState(false)

  const renderHeaderRight = () => (
    <Ionicons
      // onPress={
      //   canSubmit ? () => handleSubmit() : null
      // }
      name="send"
      size={30}
      style={{
        marginRight: 10,
        color: canSubmit ? CONST.MAIN_COLOR : CONST.SECONDARY_COLOR,
      }}
    />
  )
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
  const init = async function () {
    let location = null
    try {
      location = await UTILS.getLocation()
      setCurrentLocation(location)
    } catch (err) {
      Toast.show({
        text1: 'Unable to get location',
        type: 'error',
        topOffset,
      })
    }
    if (location) {
      const { latitude, longitude } = location.coords

      const geocodedAddress = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      })
      setLocationGeocodedAddress(geocodedAddress)
    }

    const localToken = await UTILS.getToken()
    console.log({ localToken })
    if (!localToken) {
      navigation.navigate('PhoneCheck')
      Toast.show({
        text1: 'Need to Validate your Phone Number first',
        type: 'info',
        topOffset,
      })
    } else {
      setToken(localToken)
    }
  }
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      init()
    })
    return unsubscribe
  }, [navigation])

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

  if (!currentLocation || !locationGeocodedAddress) {
    return (
      <LinearProgress
        color={CONST.MAIN_COLOR}
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
          left: 0,
        }}
      />
    )
  }
  console.log({ locationGeocodedAddress })

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        {locationGeocodedAddress.map((loc, i) => (
          <Card key={{ i }}>
            <Card.Title>{`${loc.name}`}</Card.Title>
            <Card.Divider />
            <Text>{`${loc.streetNumber} ${loc.street}`}</Text>
            <Text>{`${loc.city}, ${loc.region} `}</Text>
            <Text>{`${loc.postalCode}`}</Text>
            <Text>{`${loc.country} (${loc.isoCountryCode})`}</Text>
            <Card.Divider />
            <Text>{`${loc.district}`}</Text>
            <Text>{`${loc.region}`}</Text>
            <Text>{`${loc.subregion}`}</Text>
            <Text>{`${loc.timezone}`}</Text>
          </Card>
        ))}
      </ScrollView>
    </SafeAreaView>
  )
}
export default AddNewPlace
