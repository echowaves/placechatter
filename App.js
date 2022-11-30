/**
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */
import React, { useState, useEffect } from 'react'

// eslint-disable-next-line no-unused-vars
import { NavigationContainer } from '@react-navigation/native'

import { createDrawerNavigator } from '@react-navigation/drawer'
import { createStackNavigator } from '@react-navigation/stack'

// import { enableFreeze } from 'react-native-screens'

/* eslint-disable import/no-extraneous-dependencies */
import {
  // eslint-disable-next-line no-unused-vars
  FontAwesome,
  // eslint-disable-next-line no-unused-vars
  MaterialCommunityIcons,
  // eslint-disable-next-line no-unused-vars
  MaterialIcons,
} from '@expo/vector-icons'
/* eslint-disable import/no-extraneous-dependencies */
// eslint-disable-next-line no-unused-vars
import Toast from 'react-native-toast-message'

// eslint-disable-next-line no-unused-vars
import { ThemeProvider } from '@rneui/themed'

import * as CONSTS from './src/consts'
import * as UTILS from './src/utils'

import PlacesList from './src/screens/PlacesList'
import PlaceAdd from './src/screens/Place/placeAdd'
import Place from './src/screens/Place'
import Chat from './src/screens/Chat'
import Owners from './src/screens/Place/owners'
import OwnerAdd from './src/screens/Place/ownerAdd'

// import PlaceCardAdd from './src/screens/Place/placeCardAdd'
import PlaceCardEdit from './src/screens/Place/placeCardEdit'

import Feedback from './src/screens/Feedback'
import FeedbackAdd from './src/screens/Feedback/feedbackAdd'
import PhoneCheck from './src/screens/PhoneCheck'
import SmsConfirm from './src/screens/PhoneCheck/SmsConfirm'
// import Chat from './src/screens/Chat'

import 'react-native-gesture-handler'

// import StackNavigator from './src/nav/stackNavigator.js'

// eslint-disable-next-line no-unused-vars
const Drawer = createDrawerNavigator()
// eslint-disable-next-line no-unused-vars
const Stack = createStackNavigator()
// enableFreeze(true)
const { AuthContext } = CONSTS

function App() {
  const [authContext, setAuthContext] = useState()
  const [nickName, setNickName] = useState()

  const init = async () => {
    setAuthContext({
      uuid: await UTILS.getUUID(),
      token: await UTILS.getToken(),
      phoneNumber: await UTILS.getPhoneNumber(),
      nickName: await UTILS.getNickName(),
    })
  }

  useEffect(() => {
    init()
  }, [])

  useEffect(() => {
    setNickName(authContext?.nickName)
  }, [authContext])

  const MainDrawNavigator = () => (
    <Drawer.Navigator
      // useLegacyImplementation={true}      drawerPosition: 'right',
      screenOptions={{ gestureEnabled: true, headerShown: true }}
      initialRouteName="PlacesList"
    >
      <Drawer.Screen
        name="PlacesList"
        component={PlacesList}
        options={{
          drawerIcon: () => (
            <FontAwesome
              name="chevron-left"
              size={30}
              style={{
                marginLeft: 10,
                color: CONSTS.MAIN_COLOR,
                width: 60,
              }}
            />
          ),
          drawerLabel: '',
        }}
      />

      <Drawer.Screen
        name="PhoneCheck"
        component={PhoneCheck}
        options={{
          drawerIcon: () => (
            <MaterialCommunityIcons
              name="cellphone-check"
              size={30}
              style={{
                marginLeft: 5,
                color: CONSTS.MAIN_COLOR,
                width: 30,
              }}
            />
          ),
          drawerLabel: nickName || 'confirm phone',
          // headerShown: true,
        }}
      />

      <Drawer.Screen
        name="PlaceAdd"
        component={PlaceAdd}
        options={{
          drawerIcon: () => (
            <MaterialIcons
              name="add-circle"
              size={30}
              style={{
                marginLeft: 5,
                color: CONSTS.MAIN_COLOR,
                width: 30,
              }}
            />
          ),
          drawerLabel: 'Add Place',
          // headerShown: true,
        }}
      />

      <Drawer.Screen
        name="Feedback"
        component={Feedback}
        options={{
          drawerIcon: () => (
            <MaterialIcons
              name="feedback"
              size={30}
              style={{
                marginLeft: 5,
                color: CONSTS.MAIN_COLOR,
                width: 30,
              }}
            />
          ),
          drawerLabel: 'Feedback',
          // headerShown: true,
        }}
      />
    </Drawer.Navigator>
  )

  const MainStackNavigator = () => (
    <Stack.Navigator
      // initialRouteName="PhotosList"
      screenOptions={{
        gestureEnabled: true,
        headerShown: false,
      }}
      initialRouteName="PlacesList"
    >
      <Stack.Screen
        name="Home"
        component={MainDrawNavigator}
        options={{
          headerTintColor: CONSTS.MAIN_COLOR,
          headerTitle: '',
          headerLeft: '',
          headerRight: '',
        }}
      />
      <Stack.Screen
        name="PlaceAdd"
        component={PlaceAdd}
        options={{
          headerTintColor: CONSTS.MAIN_COLOR,
          gestureEnabled: false,
        }}
      />
      <Stack.Screen
        name="Place"
        component={Place}
        options={{
          headerTintColor: CONSTS.MAIN_COLOR,
          gestureEnabled: false,
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="Chat"
        component={Chat}
        options={{
          headerTintColor: CONSTS.MAIN_COLOR,
          gestureEnabled: false,
          headerShown: true,
        }}
      />

      <Stack.Screen
        name="Owners"
        component={Owners}
        options={{
          headerTintColor: CONSTS.MAIN_COLOR,
          gestureEnabled: false,
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="OwnerAdd"
        component={OwnerAdd}
        options={{
          headerTintColor: CONSTS.MAIN_COLOR,
          gestureEnabled: false,
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="PlaceCardEdit"
        component={PlaceCardEdit}
        options={{
          headerTintColor: CONSTS.MAIN_COLOR,
          gestureEnabled: false,
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="FeedbackAdd"
        component={FeedbackAdd}
        options={{
          headerTintColor: CONSTS.MAIN_COLOR,
          gestureEnabled: false,
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="PhoneCheck"
        component={PhoneCheck}
        options={{
          headerTintColor: CONSTS.MAIN_COLOR,
          gestureEnabled: false,
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="SmsConfirm"
        component={SmsConfirm}
        options={{
          headerTintColor: CONSTS.MAIN_COLOR,
          gestureEnabled: false,
          headerShown: true,
        }}
      />
    </Stack.Navigator>
  )
  return (
    <>
      <AuthContext.Provider value={{ authContext, setAuthContext }}>
        <ThemeProvider>
          <NavigationContainer>
            <MainStackNavigator />
          </NavigationContainer>
          <Toast />
        </ThemeProvider>
      </AuthContext.Provider>
    </>
  )
}
export default App
