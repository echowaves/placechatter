import React, { useEffect, useState, useCallback } from 'react'
import { useNavigation, useFocusEffect } from '@react-navigation/native'
import { useDimensions } from '@react-native-community/hooks'

import * as Location from 'expo-location'

import {
  Alert,
  SafeAreaView,
  StyleSheet,
  ScrollView,
  View,
  FlatList,
  RefreshControl,
} from 'react-native'
import TouchableScale from 'react-native-touchable-scale' // https://github.com/kohver/react-native-touchable-scale
import { LinearGradient } from 'expo-linear-gradient'

import * as SecureStore from 'expo-secure-store'

import {
  Text,
  Input,
  LinearProgress,
  Card,
  Button,
  Overlay,
  Divider,
  ListItem,
  Avatar,
} from '@rneui/themed'

import { gql } from '@apollo/client'
import Spinner from 'react-native-loading-spinner-overlay'

// import * as FileSystem from 'expo-file-system'
import Toast from 'react-native-toast-message'

import { FontAwesome, Ionicons, MaterialIcons } from '@expo/vector-icons'

import PropTypes from 'prop-types'

import Footer from './footer'

import * as CONST from '../../consts'
import * as utils from '../../utils'

import listItem from './listItem'

function PlacesList() {
  const navigation = useNavigation()
  const { width, height } = useDimensions().window
  const topOffset = height / 3

  const [isTandcAccepted, setIsTandcAccepted] = useState(false)

  const [places, setPlaces] = useState()
  const [refreshing, setRefreshing] = useState(false)

  const init = async function () {
    try {
      setIsTandcAccepted(
        (await SecureStore.getItemAsync(CONST.IS_TANDC_ACCEPTED_KEY)) ===
          'true',
      )
    } catch (err) {
      console.log('failed to setIsTandcAccepted')
    }
  }

  const load = async function () {
    let location
    try {
      location = await utils.getLocation()
    } catch (err) {
      Toast.show({
        text1: 'Unable to get location',
        type: 'error',
        topOffset,
      })
      return
    }

    const { latitude, longitude } = location.coords
    try {
      await CONST.gqlClient.clearStore()
      const loadedPlaces = (
        await CONST.gqlClient.query({
          query: gql`
            query placesFeed($lat: Float!, $lon: Float!) {
              placesFeed(lat: $lat, lon: $lon) {
                places {
                  place {
                    placeUuid
                    distance
                    placeName
                    streetAddress1
                    city
                    region
                  }
                  photos {
                    photoUuid
                    phoneNumber
                    # imgUrl
                    thumbUrl
                  }
                }
              }
            }
          `,
          variables: {
            lat: latitude,
            lon: longitude,
          },
        })
      ).data.placesFeed.places
      // console.log({ loadedPlaces })
      // console.log('loadedPlaces.length:', loadedPlaces.length)
      setPlaces(loadedPlaces)
      // console.log({ places: JSON.stringify(loadedPlaces) })
    } catch (err9) {
      console.log({ err9 })
      console.log('failed to load places')
      Toast.show({
        text1: 'Unable to load Places',
        text2: err9.toString(),
        type: 'error',
        topOffset,
      })
    }
  }

  const renderHeaderRight = () => null
  const renderHeaderLeft = () => {}

  const onRefresh = useCallback(() => {
    setRefreshing(true)
    load()
    setRefreshing(false)
  }, [])

  useFocusEffect(
    useCallback(() => {
      navigation.setOptions({
        headerTitle: 'places near me',
        headerTintColor: CONST.MAIN_COLOR,
        headerRight: renderHeaderRight,
        headerLeft: renderHeaderLeft,
        headerBackTitle: '',
        headerStyle: {
          backgroundColor: CONST.NAV_COLOR,
        },
      })
      init()
      load()
    }, []),
  )

  // useEffect(() => {
  //   // resetFields()
  // }, [navigation])

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      // marginBottom: CONST.FOOTER_HEIGHT,
    },
    scrollView: {
      marginHorizontal: 0,
      // paddingTop: 50,
    },
  })

  if (!isTandcAccepted) {
    return (
      <SafeAreaView style={styles.container}>
        <Overlay>
          <ScrollView style={styles.scrollView}>
            <Card containerStyle={{ padding: 0 }}>
              <ListItem style={{ borderRadius: 10 }}>
                <Text>Anyone close-by can see your posts.</Text>
              </ListItem>
              <Divider />
              <ListItem>
                <Text>You can see other&#39;s posts also.</Text>
              </ListItem>
              <Divider />
              <ListItem>
                <Text>
                  If you find any posts abusive or inappropriate, you can report
                  abuse. The place moderator will review and take actions.
                </Text>
              </ListItem>
              <Divider />
              <ListItem>
                <Text>
                  The objectionable content or abusive users will not be
                  tolerated.
                </Text>
              </ListItem>
              <Divider />
              <ListItem>
                <Text>
                  The abusive users may be banned from placechatter forever, and
                  will be reported.
                </Text>
              </ListItem>
              <Divider />
              <ListItem>
                <Text>
                  By using placechatter I agree to Terms and Conditions.
                </Text>
              </ListItem>
              <Divider />

              <ListItem style={{ alignItems: 'center' }}>
                <Button
                  title="I Agree"
                  type="outline"
                  onPress={() => {
                    SecureStore.setItemAsync(
                      CONST.IS_TANDC_ACCEPTED_KEY,
                      'true',
                    )
                    setIsTandcAccepted(true)
                  }}
                />
              </ListItem>
            </Card>
          </ScrollView>
        </Overlay>
      </SafeAreaView>
    )
  }

  if (!places) {
    return (
      <View style={styles.container}>
        <LinearProgress color={CONST.MAIN_COLOR} />
      </View>
    )
  }

  const keyExtractor = (item, index) => index.toString()

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={places}
        renderItem={(item, index) => listItem({ item: item.item, navigation })}
        keyExtractor={keyExtractor}
        // extraData={selectedId}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />
      <View style={{ width, height: CONST.FOOTER_HEIGHT }}></View>
      <Footer />
    </SafeAreaView>
  )
}
export default PlacesList
