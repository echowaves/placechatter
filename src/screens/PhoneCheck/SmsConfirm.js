/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable no-unused-vars */
import { useEffect, useState, useContext } from 'react'
import { useDimensions } from '@react-native-community/hooks'

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

import Spinner from 'react-native-loading-spinner-overlay'

// import * as FileSystem from 'expo-file-system'
import Toast from 'react-native-toast-message'

// import { useNavigation } from '@react-navigation/native'

import {
  FontAwesome,
  Ionicons,
  MaterialCommunityIcons,
} from '@expo/vector-icons'

import PropTypes from 'prop-types'

import * as CONST from '../../consts'
import * as UTILS from '../../utils'
import { VALID } from '../../valid'

function SmsConfirm({ navigation }) {
  // const navigation = useNavigation()
  const { width, height } = useDimensions().window
  const topOffset = height / 3

  const [showSpinner, setShowSpinner] = useState(false)
  const { authContext, setAuthContext } = useContext(CONST.AuthContext)

  // console.log({ uuid, phoneNumber })

  const [smsCode, setSmsCode] = useState()
  const [nickName, setNickName] = useState()

  const [nickNameError, setNickNameError] = useState('')

  const [canSubmit, setCanSubmit] = useState(true)
  // const input = createRef()

  async function handleSubmit() {
    const { uuid, phoneNumber } = authContext

    // console.log('in handle submit', { authContext })
    // console.log({ smsCode, nickName })
    setShowSpinner(true)
    try {
      const token = await UTILS.phoneActivate({
        uuid,
        phoneNumber,
        smsCode,
        nickName,
      })

      UTILS.setPhoneNumber(phoneNumber)
      UTILS.setToken(token)
      UTILS.setNickName(nickName)

      await setAuthContext({ ...authContext, token, nickName })

      navigation.goBack()
      // navigation.pop()
      // console.log({ response })
      // alert(response)
    } catch (err3) {
      console.log({ err3 })
      await UTILS.setNickName('')
      await UTILS.setPhoneNumber('')
      await UTILS.setToken('')
      setAuthContext({
        ...authContext,
        nickName: '',
        // phoneNumber: '',
        token: '',
      })
      setSmsCode('')

      Toast.show({
        text1: 'Unable to activatePhone phone, try again.',
        text2: err3.toString(),
        type: 'error',
        topOffset,
      })
    }
    setShowSpinner(false)
  }

  const renderHeaderRight = () => (
    <Ionicons
      onPress={canSubmit ? handleSubmit : null}
      // onPress={handleSubmit}
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

  async function valid() {
    setNickNameError('')
    const { phoneNumber } = authContext

    if (VALID.nickName(nickName)) {
      if (VALID.smsCode(smsCode)) {
        // setNickNameError('')
        try {
          const nickNameTypeAhead = await UTILS.nickNameTypeAhead({
            phoneNumber,
            nickName,
          })
          // console.log({ nickNameTypeAhead })

          if (nickNameTypeAhead !== 0) {
            setNickNameError('Nickname is already taken')
            return false
          }
          return true
        } catch (err1) {
          console.log({ err1 })
          setNickNameError('Letters and digits only')
          return false
        }
      }
      return false
    }
    setNickNameError('Only Letters and Digits, 4-30 characters')
    return false
  }

  async function valAsync() {
    setCanSubmit(await valid())
  }

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
    // input.current.focus()
    // input.current.clear()
  }, [])

  useEffect(() => {
    navigation.setOptions({
      headerRight: renderHeaderRight,
    })
  }, [canSubmit])

  useEffect(() => {
    // console.log({ smsCode, nickName })
    valAsync()
    navigation.setOptions({
      headerRight: renderHeaderRight,
    })
  }, [smsCode, nickName])

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
          // ref={input}
          label="Enter sms confirmation code"
          placeholder="4 letter code"
          leftIcon={{ type: 'material-icons', name: 'confirmation-num' }}
          focus={true}
          //   keyboardType="numeric"
          value={smsCode}
          onChangeText={(value) => setSmsCode(value)}
          autoCapitalize={'none'}
          autoComplete={'off'}
          autoCorrect={false}
        />
        <Input
          label="Enter Nickname"
          placeholder="Nickname appears in chats"
          leftIcon={{ type: 'font-awesome', name: 'user-circle' }}
          //   keyboardType="numeric"
          value={nickName}
          onChangeText={(value) => setNickName(value)}
          errorStyle={{ color: 'red' }}
          errorMessage={nickNameError}
          autoCapitalize={'none'}
          autoComplete={'off'}
          autoCorrect={false}
        />
      </SafeAreaView>
    </View>
  )
}
export default SmsConfirm
