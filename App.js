/**
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import React from "react"
import { StyleSheet, View } from "react-native"

import {
  FontAwesome,
  FontAwesome5,
  MaterialIcons,
  MaterialCommunityIcons,
} from "@expo/vector-icons"

import { NavigationContainer } from "@react-navigation/native"

import { createDrawerNavigator } from "@react-navigation/drawer"

import { ThemeProvider, Button, createTheme } from "@rneui/themed"

import Toast from "react-native-toast-message"

import { createStackNavigator } from "@react-navigation/stack"
import * as CONST from "./src/consts.js"

import PlacesList from "./src/screens/PlacesList"
import AddNewPlace from "./src/screens/AddNewPlace"
import PlaceDetails from "./src/screens/PlaceDetails"
import Feedback from "./src/screens/Feedback"
import PhoneCheck from "./src/screens/PhoneCheck"
import Chat from "./src/screens/Chat"

import "react-native-gesture-handler"

// import StackNavigator from './src/nav/stackNavigator.js'

const Drawer = createDrawerNavigator()
const Stack = createStackNavigator()

function App() {
  return (
    <ThemeProvider>
      <NavigationContainer>
        <Drawer.Navigator
          useLegacyImplementation
          screenOptions={{ gestureEnabled: true, headerShown: false }}
        >
          <Drawer.Screen
            name="Home"
            options={{
              drawerIcon: (config) => (
                <FontAwesome
                  name="chevron-left"
                  size={30}
                  style={{
                    marginLeft: 10,
                    color: CONST.MAIN_COLOR,
                    width: 60,
                  }}
                />
              ),
              drawerLabel: "",
            }}
          >
            {(props) => (
              <Stack.Navigator
                // headerMode="none"
                // initialRouteName="PhotosList"
                screenOptions={{ gestureEnabled: true, headerShown: true }}
              >
                <Stack.Screen
                  name="PlacesList"
                  component={PlacesList}
                  options={{
                    headerTintColor: CONST.MAIN_COLOR,
                    headerTitle: "",
                    headerLeft: "",
                    headerRight: "",
                  }}
                />
                <Stack.Screen
                  name="AddNewPlace"
                  component={AddNewPlace}
                  options={{
                    headerTintColor: CONST.MAIN_COLOR,
                    gestureEnabled: false,
                  }}
                  screenOptions={{ headerShown: true }}
                />
                {/* <Stack.Screen
                  name="Chat"
                  component={Chat}
                  options={{ headerTintColor: CONST.MAIN_COLOR }} /> */}
              </Stack.Navigator>
            )}
          </Drawer.Screen>
          <Drawer.Screen
            name="PhoneCheck"
            component={PhoneCheck}
            options={{
              drawerIcon: (config) => (
                <MaterialCommunityIcons
                  name="cellphone-check"
                  size={30}
                  style={{
                    marginLeft: 5,
                    color: CONST.MAIN_COLOR,
                    width: 30,
                  }}
                />
              ),
              drawerLabel: "Confirm Phone",
              headerShown: true,
            }}
          />

          <Drawer.Screen
            name="AddNewPlace"
            component={AddNewPlace}
            options={{
              drawerIcon: (config) => (
                <MaterialIcons
                  name="add-circle"
                  size={30}
                  style={{
                    marginLeft: 5,
                    color: CONST.MAIN_COLOR,
                    width: 30,
                  }}
                />
              ),
              drawerLabel: "Add Place",
              headerShown: true,
            }}
          />

          <Drawer.Screen
            name="Feedback"
            component={Feedback}
            options={{
              drawerIcon: (config) => (
                <MaterialIcons
                  name="feedback"
                  size={30}
                  style={{
                    marginLeft: 5,
                    color: CONST.MAIN_COLOR,
                    width: 30,
                  }}
                />
              ),
              drawerLabel: "Feedback",
              headerShown: true,
            }}
          />
        </Drawer.Navigator>
      </NavigationContainer>
    </ThemeProvider>
  )
}
export default App
