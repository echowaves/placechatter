import { useEffect, useState, useContext } from 'react'
// import { useNavigation } from '@react-navigation/native'

import { useDimensions } from '@react-native-community/hooks'

import * as Location from 'expo-location'

import { StyleSheet, SafeAreaView } from 'react-native'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'

import { Input, LinearProgress, Card } from '@rneui/themed'

import { gql } from '@apollo/client'
import Spinner from 'react-native-loading-spinner-overlay'

// import * as FileSystem from 'expo-file-system'
import Toast from 'react-native-toast-message'

import {
  FontAwesome,
  Ionicons,
  // MaterialCommunityIcons,
} from '@expo/vector-icons'

import PropTypes from 'prop-types'

import * as CONST from '../../consts'
import * as UTILS from '../../utils'
import { VALID } from '../../valid'

function PlaceAdd({ navigation }) {
  // const navigation = useNavigation()

  const { authContext, setAuthContext } = useContext(CONST.AuthContext)
  const { placeContext, setPlaceContext } = useContext(CONST.PlaceContext)

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

  const handleSubmit = async () => {
    setShowSpinner(true)

    try {
      const { uuid, phoneNumber, token } = authContext
      const response = (
        await CONST.gqlClient.mutate({
          mutation: gql`
            mutation placeCreate(
              $uuid: String!
              $phoneNumber: String!
              $token: String!
              $placeName: String!
              $streetAddress1: String!
              $streetAddress2: String!
              $city: String!
              $country: String!
              $district: String!
              $isoCountryCode: String!
              $postalCode: String!
              $region: String!
              $subregion: String!
              $timezone: String!
              $lat: Float!
              $lon: Float!
            ) {
              placeCreate(
                uuid: $uuid
                phoneNumber: $phoneNumber
                token: $token
                placeName: $placeName
                streetAddress1: $streetAddress1
                streetAddress2: $streetAddress2
                city: $city
                country: $country
                district: $district
                isoCountryCode: $isoCountryCode
                postalCode: $postalCode
                region: $region
                subregion: $subregion
                timezone: $timezone
                lat: $lat
                lon: $lon
              ) {
                placeUuid
                # placeName
                # streetAddress1
                # streetAddress2
                # city
                # country
                # district
                # isoCountryCode
                # postalCode
                # region
                # subregion
                # timezone
                # location
                # createdAt
              }
            }
          `,
          variables: {
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
          },
        })
      ).data.placeCreate

      // console.log({ response: JSON.stringify(response) })
      const { placeUuid } = response

      const { place, cards } = await UTILS.loadPlace({
        placeUuid,
      })
      setPlaceContext({ ...placeContext, place, cards })
      navigation.navigate('Place')

      navigation.navigate('Place')
    } catch (err4) {
      console.log({ err4 })
      Toast.show({
        text1: 'Unable to create Place, try again.',
        text2: err4.toString(),
        type: 'error',
        topOffset,
      })
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
      setStreetAddress1Error('2-50 Alpha-Numeric characters')
      return false
    }
    if (!VALID.region(formInput.region)) {
      setStreetAddress1Error('2-50 Alpha-Numeric characters')
      return false
    }
    if (!VALID.postalCode(formInput.postalCode)) {
      setStreetAddress1Error('2-50 Alpha-Numeric characters')
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
        placeName: '',
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

    VALID.isValidToken({ authContext, navigation, topOffset })
  }

  useEffect(() => {
    navigation.setOptions({
      headerRight: renderHeaderRight,
    })
  }, [canSubmit])

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      init()
    })
    return unsubscribe
  }, [navigation])

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
      <Spinner
        visible={showSpinner}
        textContent={'Loading...'}
        // textStyle={styles.spinnerTextStyle}
      />
      <KeyboardAwareScrollView>
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
            disabled={true} // can't modify it, has to come from GPS
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
