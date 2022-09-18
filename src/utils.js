import { Alert } from "react-native"
import * as Linking from "expo-linking"
import * as Location from "expo-location"

export async function _getLocation() {
  const locationPermission = await _checkPermission({
    permissionFunction: Location.requestForegroundPermissionsAsync,
    alertHeader:
      "Placechatter shows you place closest on your current location.",
    alertBody: "You need to enable Location in Settings and Try Again.",
  })

  if (locationPermission === "granted") {
    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.BestForNavigation,
    })
    // console.log({ location })
    return location
    // initially set the location that is last known -- works much faster this way
  }
}

export async function _checkPermission({
  permissionFunction,
  alertHeader,
  alertBody,
  permissionFunctionArgument,
}) {
  const { status } = await permissionFunction(permissionFunctionArgument)
  if (status !== "granted") {
    Alert.alert(alertHeader, alertBody, [
      {
        text: "Open Settings",
        onPress: () => {
          Linking.openSettings()
        },
      },
    ])
  }
  return status
}
