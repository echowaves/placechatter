import React, { useEffect, useState } from "react"
import { useNavigation } from "@react-navigation/native"
import { useDimensions } from "@react-native-community/hooks"

import * as Location from "expo-location"

import { Alert, SafeAreaView, StyleSheet, ScrollView, View } from "react-native"
import * as SecureStore from "expo-secure-store"

import {
  Text,
  Input,
  LinearProgress,
  Card,
  ListItem,
  Button,
  Overlay,
  Divider,
} from "@rneui/themed"

// import * as FileSystem from 'expo-file-system'
import Toast from "react-native-toast-message"

import { FontAwesome, Ionicons, MaterialIcons } from "@expo/vector-icons"

import PropTypes from "prop-types"

import * as CONST from "../../consts.js"
import * as utils from "../../utils.js"

import Footer from "../../components/Footer"

function PlacesList() {
  const navigation = useNavigation()
  const { width, height } = useDimensions().window
  const [topOffset, setTopOffset] = useState(height / 3)
  const [currentLocation, setCurrentLocation] = useState(null)

  const [isTandcAccepted, setIsTandcAccepted] = useState(false)

  useEffect(() => {
    navigation.setOptions({
      headerTitle: "places near me",
      headerTintColor: CONST.MAIN_COLOR,
      headerRight: renderHeaderRight,
      headerLeft: renderHeaderLeft,
      headerBackTitle: "",
      headerStyle: {
        backgroundColor: CONST.NAV_COLOR,
      },
    })

    const init = async function () {
      try {
        setIsTandcAccepted(
          (await SecureStore.getItemAsync(CONST.IS_TANDC_ACCEPTED_KEY)) ===
            "true"
        )
      } catch (err) {
        console.log("failed to setIsTandcAccepted")
      }

      try {
        const location = await utils._getLocation()
        setCurrentLocation(location)
      } catch (err) {
        Toast.show({
          text1: "Unable to get location",
          type: "error",
          topOffset,
        })
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
      marginHorizontal: 0,
      paddingTop: 50,
    },
  })

  const renderHeaderRight = () => null

  const renderHeaderLeft = () => {}

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

              <ListItem style={{ alignItems: "center" }}>
                <Button
                  title="I Agree"
                  type="outline"
                  onPress={() => {
                    SecureStore.setItemAsync(
                      CONST.IS_TANDC_ACCEPTED_KEY,
                      "true"
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

  return (
    <SafeAreaView style={styles.container}>
      <Text>List of places</Text>
      <Footer />
    </SafeAreaView>
  )
}
export default PlacesList
