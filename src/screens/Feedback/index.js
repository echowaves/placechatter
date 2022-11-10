import React, { useEffect, useState, useContext } from 'react'
// import { useNavigation } from '@react-navigation/native'

import { Alert, SafeAreaView, StyleSheet, ScrollView } from 'react-native'

import {
  Text,
  Input,
  LinearProgress,
  Card,
  ListItem,
  Button,
} from '@rneui/themed'

// import * as FileSystem from 'expo-file-system'
import Toast from 'react-native-toast-message'

import {
  FontAwesome,
  Ionicons,
  MaterialCommunityIcons,
} from '@expo/vector-icons'

import PropTypes from 'prop-types'

import * as CONST from '../../consts'
import * as UTILS from '../../utils'
import { VALID } from '../../valid'

function Feedback({ navigation }) {
  // const navigation = useNavigation()
  const { authContext, setAuthContext } = useContext(CONST.AuthContext)

  const [canSubmit, setCanSubmit] = useState(false)

  async function init() {
    UTILS.isValidToken({ authContext, navigation })
  }

  function renderHeaderLeft() {
    return (
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
  }

  useEffect(() => {
    navigation.setOptions({
      headerTitle: '',
      headerTintColor: CONST.MAIN_COLOR,
      headerRight: null,
      headerLeft: renderHeaderLeft,
      headerBackTitle: '',
      headerStyle: {
        backgroundColor: CONST.NAV_COLOR,
      },
    })
  }, [])

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

  return (
    <SafeAreaView style={styles.container}>
      <Text>Feedback</Text>
    </SafeAreaView>
  )
}
export default Feedback
