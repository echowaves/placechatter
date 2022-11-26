/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable no-unused-vars */
import { useEffect, useState, createRef, useContext } from 'react'
// import { useNavigation } from '@react-navigation/native'

import Spinner from 'react-native-loading-spinner-overlay'

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

function PhoneCheck({ navigation }) {
  // const navigation = useNavigation()
  const [showSpinner, setShowSpinner] = useState(false)

  const { authContext, setAuthContext } = useContext(CONST.AuthContext)
  const [phoneNumber, setPhoneNumber] = useState('')
  const [phoneNumberError, setPhoneNumberError] = useState('')

  const [canSubmit, setCanSubmit] = useState(false)
  const input = createRef()

  const valid = () => {
    setPhoneNumberError('')

    if (!VALID.phoneNumber(phoneNumber)) {
      setPhoneNumberError('10 digits phone number')
    }
  }

  useEffect(() => {
    // console.log({ smsCode, nickName })
    valid()
  }, [phoneNumber])

  const handleSubmit = async () => {
    setShowSpinner(true)
    try {
      // const response = await
      await UTILS.activationCodeGenerate({
        phoneNumber,
        uuid: authContext.uuid,
      })

      // console.log({ response })
      // alert(response)
      UTILS.setToken('')
      UTILS.setPhoneNumber('')
      UTILS.setNickName('')

      setAuthContext({ ...authContext, token: '', phoneNumber, nickName: '' })
      setShowSpinner(false)

      navigation.navigate('SmsConfirm')
    } catch (err) {
      // console.log({ err })
      Toast.show({
        text1: 'Unable to validate phone number',
        text2: err.toString(),
        type: 'error',
      })
    }
    setShowSpinner(false)
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
      onPress={() => {
        navigation.goBack()
      }}
    />
  )

  useEffect(() => {
    navigation.setOptions({
      headerTitle: 'verify sms',
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
  }, [])

  useEffect(() => {
    if (VALID.phoneNumber(phoneNumber)) {
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
        <Spinner
          visible={showSpinner}
          textContent={'Loading...'}
          // textStyle={styles.spinnerTextStyle}
        />
        <Input
          ref={input}
          label="Confirmation Code will be sent to this number"
          placeholder="your mobile phone number"
          leftIcon={{ type: 'font-awesome', name: 'mobile-phone' }}
          focus={true}
          keyboardType="numeric"
          value={phoneNumber}
          errorStyle={{ color: 'red' }}
          errorMessage={phoneNumberError}
          onChangeText={(value) => {
            setPhoneNumber(value)
          }}
        />
      </SafeAreaView>
    </View>
  )
}
export default PhoneCheck
