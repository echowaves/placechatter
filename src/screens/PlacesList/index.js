import React, { useEffect, useState, useCallback } from 'react'
import { useFocusEffect } from '@react-navigation/native'
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

import Spinner from 'react-native-loading-spinner-overlay'

// import * as FileSystem from 'expo-file-system'
import Toast from 'react-native-toast-message'

import { FontAwesome, Ionicons, MaterialIcons } from '@expo/vector-icons'

import PropTypes from 'prop-types'

import Footer from './footer'

import * as CONSTS from '../../consts'
import * as UTILS from '../../utils'

import PlaceItem from './placeItem'

function PlacesList({ navigation }) {
  // const navigation = useNavigation()
  const { width, height } = useDimensions().window
  const topOffset = height / 3

  const [isTandcAccepted, setIsTandcAccepted] = useState(false)

  const [places, setPlaces] = useState()
  const [refreshing, setRefreshing] = useState(false)

  const init = async function () {
    try {
      setIsTandcAccepted(
        (await SecureStore.getItemAsync(CONSTS.IS_TANDC_ACCEPTED_KEY)) ===
          'true',
      )
    } catch (err) {
      console.log('failed to setIsTandcAccepted')
    }
  }

  const load = async function () {
    // setPlaces(null)
    let location
    try {
      location = await UTILS.getLocation()
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
      const loadedPlaces = await UTILS.placesFeed({ latitude, longitude })
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
        headerTintColor: CONSTS.MAIN_COLOR,
        headerRight: renderHeaderRight,
        headerLeft: renderHeaderLeft,
        headerBackTitle: '',
        headerStyle: {
          backgroundColor: CONSTS.NAV_COLOR,
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
                  SecureStore.setItemAsync(CONSTS.IS_TANDC_ACCEPTED_KEY, 'true')
                  setIsTandcAccepted(true)
                }}
              />
            </ListItem>
          </Card>
        </ScrollView>
      </SafeAreaView>
    )
  }

  if (!places) {
    return (
      <View style={styles.container}>
        <LinearProgress color={CONSTS.MAIN_COLOR} />
        <View style={{ width, height: CONSTS.FOOTER_HEIGHT }}></View>
        <Footer />
      </View>
    )
  }

  const keyExtractor = (item, index) => index.toString()
  // console.log({ places: JSON.stringify(places) })
  return (
    <SafeAreaView style={styles.container}>
      <Card>
        <Text>test</Text>
      </Card>

      <FlatList
        data={places}
        renderItem={(item, index) => (
          <PlaceItem item={item.item} navigation={navigation} />
        )}
        keyExtractor={keyExtractor}
        // extraData={selectedId}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />
      <View style={{ width, height: CONSTS.FOOTER_HEIGHT }}></View>
      <Footer />
    </SafeAreaView>
  )
}
export default PlacesList
