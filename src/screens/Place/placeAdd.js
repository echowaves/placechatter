import { useEffect, useState, useContext } from 'react'
// import { useNavigation } from '@react-navigation/native'

import { useDimensions } from '@react-native-community/hooks'

import * as Location from 'expo-location'

import { StyleSheet, SafeAreaView } from 'react-native'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'

import { Input, LinearProgress, Card, Text } from '@rneui/themed'

import Spinner from 'react-native-loading-spinner-overlay'

// import * as FileSystem from 'expo-file-system'
import Toast from 'react-native-toast-message'

import {
  FontAwesome,
  Ionicons,
  // MaterialCommunityIcons,
} from '@expo/vector-icons'

import PropTypes from 'prop-types'

import * as CONSTS from '../../consts'
import * as UTILS from '../../utils'
import { VALID } from '../../valid'

function PlaceAdd({ navigation }) {
  // const navigation = useNavigation()

  const { authContext, setAuthContext } = useContext(CONSTS.AuthContext)

  const [showSpinner, setShowSpinner] = useState(false)

  const { width, height } = useDimensions().window
  const topOffset = height / 3
  const [currentLocation, setCurrentLocation] = useState(null)
  const [locationGeocodedAddress, setLocationGeocodedAddress] = useState(null)
  const [formInput, setFormInput] = useState({})

  const [placeNameError, setPlaceNameError] = useState('')
  const [streetAddress1Error, setStreetAddress1Error] = useState('')
  const [streetAddress2Error, setStreetAddress2Error] = useState('')
  const [cityError, setCityError] = useState('')
  const [regionError, setRegionError] = useState('')
  const [postalCodeError, setPostalCodeError] = useState('')

  const [canSubmit, setCanSubmit] = useState(false)

  async function init() {
    if (await UTILS.isValidToken({ authContext, navigation })) {
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
      console.log({ location })
      if (location) {
        const { latitude, longitude } = location.coords

        const geocodedAddress = await Location.reverseGeocodeAsync(
          {
            latitude,
            longitude,
          },
          { useGoogleMaps: false, lang: 'en' },
        )
        // console.log({ geocodedAddress })
        setLocationGeocodedAddress(geocodedAddress[0])

        setFormInput({
          placeName: `${geocodedAddress[0].name || ''}`,
          streetAddress1: `${geocodedAddress[0].streetNumber || ''} ${
            geocodedAddress[0].street || ''
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
    }
  }

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      // The screen is focused
      init()
    })

    // Return the function to unsubscribe from the event so it gets removed on unmount
    return unsubscribe
  }, [navigation])

  const handleSubmit = async () => {
    setShowSpinner(true)

    try {
      const { uuid, phoneNumber, token } = authContext

      const createdPlace = await UTILS.placeCreate({
        uuid,
        phoneNumber,
        token,
        placeName: formInput.placeName,
        streetAddress1: formInput.streetAddress1,
        streetAddress2: formInput.streetAddress2,
        city: formInput.city,
        country: formInput.country,
        district: formInput.district,
        isoCountryCode: formInput.isoCountryCode,
        postalCode: formInput.postalCode,
        region: formInput.region,
        subregion: formInput.subregion,
        timezone: formInput.timezone,
        lat: formInput.lat,
        lon: formInput.lon,
      })

      if (createdPlace) {
        const { placeUuid } = createdPlace
        // const { place, cards } = await UTILS.placeRead({
        //   placeUuid,
        // })
        navigation.navigate('Place', { placeUuid })
      } else {
        throw Error('Duplicate')
      }
    } catch (err4) {
      // console.log({ err4 })
      Toast.show({
        text1: 'Unable to create Place',
        text2: 'This place already exists?',
        type: 'error',
        topOffset,
      })

      // Toast.show({
      //   text1: 'Unable to create Place, try again.',
      //   text2: err4.toString(),
      //   type: 'error',
      //   topOffset,
      // })
    }
    setShowSpinner(false)
  }

  const renderHeaderRight = () => (
    <Ionicons
      onPress={canSubmit ? () => handleSubmit() : null}
      name="send"
      size={30}
      style={{
        marginRight: 10,
        color: canSubmit ? CONSTS.MAIN_COLOR : CONSTS.SECONDARY_COLOR,
      }}
    />
  )
  const renderHeaderLeft = () => (
    <FontAwesome
      name="chevron-left"
      size={30}
      style={{
        marginLeft: 10,
        color: CONSTS.MAIN_COLOR,
        width: 60,
      }}
      onPress={() => navigation.navigate('PlacesList')}
    />
  )

  function isValidForm() {
    setPlaceNameError('')
    setStreetAddress1Error('')
    setStreetAddress2Error('')
    setCityError('')
    setRegionError('')
    setPostalCodeError('')

    if (!VALID.placeName(formInput.placeName)) {
      setPlaceNameError('4-50 Alpha-Numeric characters')
      return false
    }
    if (!VALID.streetAddress(formInput.streetAddress1)) {
      setStreetAddress1Error('2-50 Alpha-Numeric characters')
      return false
    }
    // console.log({ streetAddress2: formInput.streetAddress2 })
    if (
      formInput?.streetAddress2 &&
      formInput?.streetAddress2?.length > 0 &&
      !VALID.streetAddress(formInput.streetAddress2)
    ) {
      setStreetAddress2Error('2-50 Alpha-Numeric characters')
      return false
    }

    if (!VALID.city(formInput.city)) {
      setCityError('2-50 Alpha-Numeric characters')
      return false
    }
    if (!VALID.region(formInput.region)) {
      setRegionError('2-50 Alpha-Numeric characters')
      return false
    }
    if (!VALID.postalCode(formInput.postalCode)) {
      setPostalCodeError('2-50 Alpha-Numeric characters')
      return false
    }

    return true
  }

  useEffect(() => {
    setCanSubmit(isValidForm())
    navigation.setOptions({
      headerRight: renderHeaderRight,
    })
  }, [formInput])

  useEffect(() => {
    navigation.setOptions({
      headerTitle: '',
      headerTintColor: CONSTS.MAIN_COLOR,
      headerRight: renderHeaderRight,
      headerLeft: renderHeaderLeft,
      headerBackTitle: '',
      headerStyle: {
        backgroundColor: CONSTS.NAV_COLOR,
      },
    })
    init()
  }, [])

  useEffect(() => {
    navigation.setOptions({
      headerRight: renderHeaderRight,
    })
  }, [canSubmit])

  // useEffect(() => {
  //   const unsubscribe = navigation.addListener('focus', () => {
  //     init()
  //   })
  //   return unsubscribe
  // }, [navigation])

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

  if (!locationGeocodedAddress || !currentLocation) {
    return (
      <LinearProgress
        color={CONSTS.MAIN_COLOR}
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
      <Spinner
        visible={showSpinner}
        textContent={'Loading...'}
        // textStyle={styles.spinnerTextStyle}
      />
      <KeyboardAwareScrollView>
        <Card>
          <Text
            style={{
              color: CONSTS.MAIN_COLOR,
            }}
          >
            Make sure you are located at the place your are creating. You will
            not be able to change the address and the GEO location once created.
          </Text>
        </Card>
        <Card>
          <Input
            label="Place Name"
            placeholder={`What do you call this place`}
            errorMessage={placeNameError}
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
            disabled={false} // can't modify it, has to come from GPS
            label="Street Address1"
            placeholder={`${formInput.streetAddress1}`}
            errorMessage={streetAddress1Error}
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
            errorMessage={streetAddress2Error}
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
            disabled={true} // can't modify it, has to come from GPS
            label="City"
            placeholder={`${formInput.city}`}
            errorMessage={cityError}
            value={`${formInput.city}`}
            // onChangeText={(value) =>
            //   setFormInput({ ...formInput, city: value })
            // }
            autoCapitalize={'words'}
            autoComplete={'off'}
            autoCorrect={false} //
          />
          <Input
            disabled={true} // can't modify it, has to come from GPS
            label="State"
            placeholder={`${formInput.region}`}
            errorMessage={regionError}
            value={`${formInput.region}`}
            // onChangeText={(value) =>
            //   setFormInput({ ...formInput, region: value })
            // }
            autoCapitalize={'none'}
            autoComplete={'off'}
            autoCorrect={false}
            editable={false}
          />
          <Input
            disabled={true} // can't modify it, has to come from GPS
            label="Postal Code"
            placeholder={`${formInput.postalCode}`}
            errorMessage={postalCodeError}
            value={`${formInput.postalCode}`}
            // onChangeText={(value) =>
            //   setFormInput({ ...formInput, postalCode: value })
            // }
            autoCapitalize={'none'}
            autoComplete={'off'}
            autoCorrect={false}
          />
        </Card>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  )
}
export default PlaceAdd
