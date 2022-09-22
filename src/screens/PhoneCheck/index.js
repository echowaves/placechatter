import React, { useEffect, useState } from 'react'
import { useNavigation } from '@react-navigation/native'

import { Alert, SafeAreaView, StyleSheet, ScrollView } from 'react-native'
import PhoneInput from 'react-native-phone-number-input'

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

const maxNickNameLength = 40
const minNickNameLength = 4

function PhoneCheck() {
  const navigation = useNavigation()
  const [uuid, setUuid] = useState(null)

  const [nickName, setNickName] = useState('')
  const [nickNameEntered, setNickNameEntered] = useState(false)

  const [canSubmit, setCanSubmit] = useState(false)
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
      onPress={() => navigation.goBack()}
    />
  )

  useEffect(() => {
    navigation.setOptions({
      headerTitle: 'my login',
      headerTintColor: CONST.MAIN_COLOR,
      headerRight: renderHeaderRight,
      headerLeft: renderHeaderLeft,
      headerBackTitle: '',
      headerStyle: {
        backgroundColor: CONST.NAV_COLOR,
      },
    })

    async function init() {
      setUuid(await UTILS.getUUID())
    }
    init()
  }, [])

  useEffect(() => {
    navigation.setOptions({
      headerTitle: 'Create NickName',
      headerTintColor: CONST.MAIN_COLOR,
      headerRight: renderHeaderRight,
      headerLeft: renderHeaderLeft,
      headerBackTitle: '',
      headerStyle: {
        backgroundColor: CONST.NAV_COLOR,
      },
    })
  }, [canSubmit])

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
      <Text>{`${uuid}`}</Text>
    </SafeAreaView>
  )
}
export default PhoneCheck
