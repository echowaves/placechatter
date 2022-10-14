/**
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */
// eslint-disable-next-line no-unused-vars
import { NavigationContainer } from '@react-navigation/native'

import { createDrawerNavigator } from '@react-navigation/drawer'
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

import { createStackNavigator } from '@react-navigation/stack'

import * as CONST from './src/consts'

import PlacesList from './src/screens/PlacesList'
import AddNewPlace from './src/screens/Place/addNewPlace'
import Place from './src/screens/Place'
import PhotosSwiper from './src/screens/Place/photosSwiper'

import Feedback from './src/screens/Feedback'
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

function App() {
  return (
    <ThemeProvider>
      <NavigationContainer>
        <Drawer.Navigator
          // useLegacyImplementation={false}
          screenOptions={{ gestureEnabled: true, headerShown: false }}
        >
          <Drawer.Screen
            name="Home"
            options={{
              drawerIcon: () => (
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
              drawerLabel: '',
            }}
          >
            {() => (
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
                    headerTitle: '',
                    headerLeft: '',
                    headerRight: '',
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
                <Stack.Screen
                  name="Place"
                  component={Place}
                  options={{
                    headerTintColor: CONST.MAIN_COLOR,
                    gestureEnabled: false,
                  }}
                  screenOptions={{ headerShown: true }}
                />
                <Stack.Screen
                  name="PhotosSwiper"
                  component={PhotosSwiper}
                  options={{
                    headerTintColor: CONST.MAIN_COLOR,
                    gestureEnabled: false,
                  }}
                  screenOptions={{ headerShown: true }}
                />
                <Stack.Screen
                  name="PhoneCheck"
                  component={PhoneCheck}
                  options={{
                    headerTintColor: CONST.MAIN_COLOR,
                    gestureEnabled: false,
                  }}
                  screenOptions={{ headerShown: true }}
                />
                <Stack.Screen
                  name="SmsConfirm"
                  component={SmsConfirm}
                  options={{
                    headerTintColor: CONST.MAIN_COLOR,
                    gestureEnabled: false,
                  }}
                  screenOptions={{ headerShown: true }}
                />
              </Stack.Navigator>
            )}
          </Drawer.Screen>
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
                    color: CONST.MAIN_COLOR,
                    width: 30,
                  }}
                />
              ),
              drawerLabel: 'NickName',
              headerShown: true,
            }}
          />

          <Drawer.Screen
            name="AddNewPlace"
            component={AddNewPlace}
            options={{
              drawerIcon: () => (
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
              drawerLabel: 'Add Place',
              headerShown: true,
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
                    color: CONST.MAIN_COLOR,
                    width: 30,
                  }}
                />
              ),
              drawerLabel: 'Feedback',
              headerShown: true,
            }}
          />
        </Drawer.Navigator>
      </NavigationContainer>
      <Toast />
    </ThemeProvider>
  )
}
export default App
