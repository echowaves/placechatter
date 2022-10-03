/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable no-unused-vars */
import { useEffect, useState, createRef } from 'react'

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
import Spinner from 'react-native-loading-spinner-overlay'

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

function SmsConfirm({ route, navigation }) {
  const [showSpinner, setShowSpinner] = useState(false)

  const { uuid, phoneNumber } = route.params
  // console.log({ uuid, phoneNumber })

  const [smsCode, setSmscode] = useState()
  const [nickName, setNickName] = useState()
  const [nickNameError, setNickNameError] = useState()

  const [canSubmit, setCanSubmit] = useState(true)
  const input = createRef()

  const handleSubmit = async () => {
    setShowSpinner(true)
    try {
      const response = (
        await CONST.gqlClient.mutate({
          mutation: gql`
            mutation phoneActivate(
              $uuid: String!
              $phoneNumber: String!
              $smsCode: String!
              $nickName: String!
            ) {
              phoneActivate(
                uuid: $uuid
                phoneNumber: $phoneNumber
                smsCode: $smsCode
                nickName: $nickName
              )
            }
          `,
          variables: {
            uuid,
            phoneNumber,
            smsCode,
            nickName,
          },
        })
      ).data.phoneActivate

      // console.log({ response })
      // success, validateion passsed
      await UTILS.setNickName(nickName)
      await UTILS.setPhoneNumber(phoneNumber)
      await UTILS.setToken(response)

      navigation.goBack()
      // console.log({ response })
      // alert(response)
    } catch (err3) {
      // console.log({ err3 })
      await UTILS.setNickName('')
      await UTILS.setPhoneNumber('')
      setNickName('')
      setSmscode('')

      Toast.show({
        text1: 'Unable to activatePhone phone, try again.',
        text2: err3.toString(),
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
      onPress={() => navigation.goBack()}
    />
  )

  async function validate() {
    setCanSubmit(false)
    setNickNameError('')

    if (VALID.nickName(nickName)) {
      if (VALID.smsCode(smsCode)) {
        setCanSubmit(true)
        // setNickNameError('')
        try {
          const nickNamesFound = await CONST.gqlClient.query({
            query: gql`
              query nickNameTypeAhead(
                $phoneNumber: String!
                $nickName: String!
              ) {
                nickNameTypeAhead(
                  phoneNumber: $phoneNumber
                  nickName: $nickName
                )
              }
            `,
            variables: {
              phoneNumber,
              nickName,
            },
          })
          // alert(response)
          const { nickNameTypeAhead } = nickNamesFound.data
          // console.log({ nickNamesFound, nickNameTypeAhead })

          if (nickNameTypeAhead !== 0) {
            setNickNameError('Nickname is already taken')
            setCanSubmit(false)
          }
        } catch (err1) {
          setNickNameError('Lettters and digits only')
          setCanSubmit(false)
          // setCanSubmit(false)
          // setNickNameError('')

          // Toast.show({
          //   text1: 'Unable to validate nickName',
          //   text2: err1.toString(),
          //   type: 'error',
          // })
        }
      } else {
        setCanSubmit(false)
      }
    } else {
      setNickNameError('Only Letters and Digits, 4-30 characters')
      setCanSubmit(false)
    }
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
    input.current.focus()
    input.current.clear()

    async function init() {
      setNickName(await UTILS.getNickName())
    }
    init()
    // validate()
  }, [])

  useEffect(() => {
    // alert(nickName)
    validate()
    // console.log({ nickName })
  }, [nickName, smsCode])

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
          label="Enter sms confirmation code"
          placeholder="4 letter code"
          leftIcon={{ type: 'material-icons', name: 'confirmation-num' }}
          focus={true}
          //   keyboardType="numeric"
          value={smsCode}
          onChangeText={(value) => setSmscode(value)}
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
          errorStyle={{ color: 'red' }}
          errorMessage={nickNameError}
          onChangeText={(value) => setNickName(value)}
          autoCapitalize={'none'}
          autoComplete={'off'}
          autoCorrect={false}
        />
      </SafeAreaView>
    </View>
  )
}
export default SmsConfirm
