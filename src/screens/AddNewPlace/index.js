import React, { useEffect, useState } from "react"
import { useNavigation } from "@react-navigation/native"
import { useDimensions } from "@react-native-community/hooks"

import * as Location from "expo-location"

import { Alert, SafeAreaView, StyleSheet, ScrollView } from "react-native"

import {
  Text,
  Input,
  LinearProgress,
  Card,
  ListItem,
  Button,
} from "@rneui/themed"

// import * as FileSystem from 'expo-file-system'
import Toast from "react-native-toast-message"

import {
  FontAwesome,
  Ionicons,
  MaterialCommunityIcons,
} from "@expo/vector-icons"

import PropTypes from "prop-types"

import * as CONST from "../../consts.js"
import * as utils from "../../utils.js"

function AddNewPlace() {
  const navigation = useNavigation()
  const { width, height } = useDimensions().window
  const [topOffset, setTopOffset] = useState(height / 3)
  const [currentLocation, setCurrentLocation] = useState(null)

  const [nickName, setNickName] = useState("")
  const [nickNameEntered, setNickNameEntered] = useState(false)

  const [canSubmit, setCanSubmit] = useState(false)

  useEffect(() => {
    navigation.setOptions({
      headerTitle: "",
      headerTintColor: CONST.MAIN_COLOR,
      headerRight: renderHeaderRight,
      headerLeft: renderHeaderLeft,
      headerBackTitle: "",
      headerStyle: {
        backgroundColor: CONST.NAV_COLOR,
      },
    })

    const init = async function () {
      let location = null
      try {
        location = await utils._getLocation()
        setCurrentLocation(location)
      } catch (err) {
        Toast.show({
          text1: "Unable to get location",
          type: "error",
          topOffset,
        })
      }
      if (location) {
        const { latitude, longitude } = location.coords

        const locationGeocodedAddress = await Location.reverseGeocodeAsync({
          latitude,
          longitude,
        })
        console.log({ locationGeocodedAddress })
      }
    }
    init()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    // resetFields()
  }, [navigation])

  const styles = StyleSheet.create({
    container: {
      flex: 1,
    },
    scrollView: {
      alignItems: "center",
      marginHorizontal: 0,
      paddingBottom: 300,
    },
  })

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

  if (!currentLocation) {
    return (
      <LinearProgress
        color={CONST.MAIN_COLOR}
        style={{
          position: "absolute",
          top: 0,
          right: 0,
          left: 0,
        }}
      />
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text>add new place</Text>
    </SafeAreaView>
  )
}
export default AddNewPlace
