import React, { useRef, useState, useEffect, useContext } from 'react'
// import { useFocusEffect } from '@react-navigation/native'

import { useDimensions } from '@react-native-community/hooks'

import { FontAwesome, Ionicons, AntDesign } from '@expo/vector-icons'
import Toast from 'react-native-toast-message'
import Spinner from 'react-native-loading-spinner-overlay'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'

import {
  View,
  TouchableOpacity,
  Alert,
  InteractionManager,
  ScrollView,
  SafeAreaView,
  StyleSheet,
  FlatList,
} from 'react-native'

import {
  Text,
  Card,
  LinearProgress,
  Divider,
  Badge,
  Icon,
  Button,
  Input,
} from '@rneui/themed'
import Markdown from 'react-native-markdown-display'

import * as ImageManipulator from 'expo-image-manipulator'
import * as MediaLibrary from 'expo-media-library'
import * as ImagePicker from 'expo-image-picker'
import * as Linking from 'expo-linking'

import { CacheManager } from 'expo-cached-image'
import * as FileSystem from 'expo-file-system'

import { v4 as uuidv4 } from 'uuid'

import PropTypes from 'prop-types'

import * as CONSTS from '../../consts'
import { VALID } from '../../valid'
import * as UTILS from '../../utils'

import MarkdownHelp, { markdownStyles } from '../../markdownHelp'

function OwnerAdd({ route, navigation }) {
  const { placeUuid } = route.params

  const { authContext } = useContext(CONSTS.AuthContext)

  const { width, height } = useDimensions().window

  const topOffset = height / 3

  const [showSpinner, setShowSpinner] = useState(false)

  const [phone, setPhone] = useState()

  const [phoneError, setPhoneError] = useState('')

  const back = async () => {
    navigation.navigate('Owners', { placeUuid })
  }

  const renderHeaderRight = () => null
  const renderHeaderLeft = () => (
    <FontAwesome
      name="chevron-left"
      size={30}
      style={{
        marginLeft: 10,
        color: CONSTS.MAIN_COLOR,
        width: 60,
      }}
      onPress={() => {
        back()
      }}
    />
  )

  useEffect(() => {
    navigation.setOptions({
      headerTitle: 'Add Owner',
      headerTintColor: CONSTS.MAIN_COLOR,
      headerRight: renderHeaderRight,
      headerLeft: renderHeaderLeft,
      headerBackTitle: '',
      headerStyle: {
        backgroundColor: CONSTS.NAV_COLOR,
      },
    })
  }, [])

  const valid = () => {
    setPhoneError('')

    if (!VALID.phoneNumber(phone)) {
      setPhoneError('10 digits phone number')
    }
  }

  useEffect(() => {
    // console.log({ smsCode, nickName })
    valid()
  }, [phone])

  const saveOwner = async () => {
    setShowSpinner(true)

    try {
      const { uuid, phoneNumber, token } = authContext

      const owner = await UTILS.placePhoneCreate({
        uuid,
        phoneNumber,
        token,

        phone,
        placeUuid,
      })
      // console.log({ feedback })
    } catch (err11) {
      // console.log({ err11 })
      Toast.show({
        text1: 'Unable to add owner to place, try again.',
        text2: err11.toString(),
        type: 'error',
        topOffset,
      })
    }
    setShowSpinner(false)
    back()
  }

  return (
    <>
      <Spinner
        visible={showSpinner}
        textContent={'Posting Feedback'}
        // textStyle={styles.spinnerTextStyle}
      />
      <KeyboardAwareScrollView>
        <Card>
          <Input
            label="enter 10 digits phone number"
            placeholder="owner's mobile phone number"
            leftIcon={{ type: 'font-awesome', name: 'mobile-phone' }}
            focus={true}
            keyboardType="numeric"
            value={phone}
            errorStyle={{ color: 'red' }}
            errorMessage={phoneError}
            onChangeText={(value) => {
              setPhone(value)
            }}
          />

          <Button
            disabled={phoneError}
            onPress={saveOwner}
            size="lg"
            iconRight
            color={CONSTS.MAIN_COLOR}
          >
            {`   Save Owner`}
            <Icon name="save" color="white" />
          </Button>
        </Card>
      </KeyboardAwareScrollView>
    </>
  )
}

export default OwnerAdd
