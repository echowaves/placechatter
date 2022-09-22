import { useEffect, useState, useRef } from 'react'
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

function PhoneCheck() {
  const navigation = useNavigation()
  const [uuid, setUuid] = useState(null)

  const [phoneInput, setPhoneInput] = useState('')
  const [canSubmit, setCanSubmit] = useState(false)

  const handleSubmit = async () => {}

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
      headerTitle: 'send sms code',
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
    if (phoneInput.length === 10 && /^-?\d+$/.test(phoneInput)) {
      setCanSubmit(true)
    } else {
      setCanSubmit(false)
    }
  }, [phoneInput])

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
          label="enter 10 digits phone number"
          placeholder="your mobile phone number"
          leftIcon={{ type: 'font-awesome', name: 'mobile-phone' }}
          focus={true}
          keyboardType="numeric"
          value={phoneInput}
          onChangeText={(value) =>
            value.length <= 10 ? setPhoneInput(value) : null
          }
        />
      </SafeAreaView>
    </View>
  )
}
export default PhoneCheck
