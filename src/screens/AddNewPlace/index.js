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
  const [formInput, setFormInput] = useState({})

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

  async function init() {
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
      setLocationGeocodedAddress(geocodedAddress[0])

      setFormInput({
        placeName: '',
        streetAddress1: `${geocodedAddress[0].street || ''} ${
          geocodedAddress[0].streetNumber || ''
        }`,
        streetAddress2: '',
        city: geocodedAddress[0].city || '',

        region: geocodedAddress[0].region || '',

        subregion: geocodedAddress[0].subregion || '',

        postalCode: geocodedAddress[0].postalCode || '',

        country: geocodedAddress[0].country || '',
        isoCountryCode: geocodedAddress[0].isoCountryCode || '',

        district: geocodedAddress[0].district || '',
        timezone: geocodedAddress[0].timezone || '',
        lat: latitude,
        lon: longitude,
      })
    }

    const localToken = await UTILS.getToken()

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
    // init()
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

  if (!locationGeocodedAddress || !currentLocation || !token) {
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
  // console.log({ locationGeocodedAddress })
  // console.log({ currentLocation })
  // console.log({ token })

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <Card>
          <Input
            label="Place Name"
            placeholder={`What do you call this place`}
            value={`${formInput.placeName}`}
            onChangeText={(value) =>
              setFormInput({ ...formInput, placeName: value })
            }
            autoCapitalize={'words'}
            autoComplete={'off'}
            autoCorrect={false}
            autoFocus={true}
          />
          <Input
            label="Street Address1"
            placeholder={`${formInput.streetAddress1}`}
            value={`${formInput.streetAddress1}`}
            onChangeText={(value) =>
              setFormInput({ ...formInput, streetAddress1: value })
            }
            autoCapitalize={'words'}
            autoComplete={'off'}
            autoCorrect={false}
          />
          <Input
            label="Street Address2"
            placeholder={`${formInput.streetAddress2}`}
            value={`${formInput.streetAddress2}`}
            onChangeText={(value) =>
              setFormInput({ ...formInput, streetAddress2: value })
            }
            autoCapitalize={'words'}
            autoComplete={'off'}
            autoCorrect={false}
          />
          <Card.Divider />

          <Input
            label="City"
            placeholder={`${formInput.city}`}
            value={`${formInput.city}`}
            onChangeText={(value) =>
              setFormInput({ ...formInput, city: value })
            }
            autoCapitalize={'words'}
            autoComplete={'off'}
            autoCorrect={false}
            editable={false}
          />
          <Input
            label="State"
            placeholder={`${formInput.region}`}
            value={`${formInput.region}`}
            onChangeText={(value) =>
              setFormInput({ ...formInput, region: value })
            }
            autoCapitalize={'none'}
            autoComplete={'off'}
            autoCorrect={false}
            editable={false}
          />
          <Input
            label="Postal Code"
            placeholder={`${formInput.postalCode}`}
            value={`${formInput.postalCode}`}
            onChangeText={(value) =>
              setFormInput({ ...formInput, postalCode: value })
            }
            autoCapitalize={'none'}
            autoComplete={'off'}
            autoCorrect={false}
            editable={false}
          />
        </Card>
      </ScrollView>
    </SafeAreaView>
  )
}
export default AddNewPlace
