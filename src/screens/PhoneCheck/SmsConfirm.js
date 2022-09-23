/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable no-unused-vars */
import { useEffect, useState, createRef } from 'react'
import { useNavigation } from '@react-navigation/native'

import {
  Alert,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  ScrollView,
  View,
  TouchableOpacity,
} from 'react-native'

import {
  Text,
  Input,
  LinearProgress,
  Card,
  ListItem,
  Button,
  Icon,
} from '@rneui/themed'

import { gql } from '@apollo/client'

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

function SmsConfirm() {
  const navigation = useNavigation()
  const [uuid, setUuid] = useState(null)

  const [phoneNumber, setPhoneNumber] = useState('')
  const [canSubmit, setCanSubmit] = useState(false)
  const input = createRef()

  const handleSubmit = async () => {
    try {
      CONST.gqlClient.query({
        query: gql`
          query generateActivationCode($phoneNumber: String!, $uuid: String!) {
            generateActivationCode(phoneNumber: $phoneNumber, uuid: $uuid)
          }
        `,
        variables: {
          phoneNumber,
          uuid,
        },
      })
      // console.log({ response })
      // alert(response)
    } catch (err) {
      // console.log({ err })
      Toast.show({
        text1: 'Unable to validate phone number',
        text2: err.toString(),
        type: 'error',
      })
    }
  }

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
      headerTitle: 'confirm code',
      headerTintColor: CONST.MAIN_COLOR,
      headerRight: renderHeaderRight,
      headerLeft: renderHeaderLeft,
      headerBackTitle: '',
      headerStyle: {
        backgroundColor: CONST.NAV_COLOR,
      },
    })
    input.current.focus()
    input.current.clear()

    async function init() {
      setUuid(await UTILS.getUUID())
    }
    init()
  }, [])

  useEffect(() => {
    if (phoneNumber.length === 10 && /^-?\d+$/.test(phoneNumber)) {
      setCanSubmit(true)
    } else {
      setCanSubmit(false)
    }
  }, [phoneNumber])

  useEffect(() => {
    navigation.setOptions({
      headerRight: renderHeaderRight,
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
    <View style={styles.container}>
      <SafeAreaView style={styles.wrapper}>
        <Input
          ref={input}
          label="Enter sms confirmation code"
          placeholder="4 letter code"
          leftIcon={{ type: 'material-icons', name: 'confirmation-num' }}
          focus={true}
          keyboardType="numeric"
          value={phoneNumber}
          onChangeText={(value) =>
            value.length <= 10 ? setPhoneNumber(value) : null
          }
        />
      </SafeAreaView>
    </View>
  )
}
export default SmsConfirm
