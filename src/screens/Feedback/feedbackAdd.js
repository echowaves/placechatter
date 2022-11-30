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

function FeedbackAdd({ route, navigation }) {
  const { authContext, setAuthContext } = useContext(CONSTS.AuthContext)

  const { width, height } = useDimensions().window

  const topOffset = height / 3

  const [showSpinner, setShowSpinner] = useState(false)

  const [feedbackText, setFeedbackText] = useState('')

  const [feedbackTextError, setFeedbackTextError] = useState('')

  const back = async () => {
    navigation.navigate('Feedback')
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
      headerTitle: 'Add Feedback',
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
    setFeedbackTextError('')

    if (!VALID.feedbackText(feedbackText)) {
      setFeedbackTextError('4-2000 characters')
    }
  }

  useEffect(() => {
    // console.log({ smsCode, nickName })
    valid()
  }, [feedbackText])

  const saveFeedback = async () => {
    setShowSpinner(true)

    try {
      const { uuid, phoneNumber, token } = authContext
      const feedback = await UTILS.feedbackCreate({
        uuid,
        phoneNumber,
        token,
        feedbackText,
      })
      // console.log({ feedback })
    } catch (err11) {
      // console.log({ err11 })
      Toast.show({
        text1: 'Unable to create feedback, try again.',
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
            // leftIcon={{ type: 'MaterialIcons', name: 'description' }}
            placeholder={`enter text`}
            errorMessage={feedbackTextError}
            value={`${feedbackText}`}
            onChangeText={(value) => {
              setFeedbackText(value)
              // valid()
            }}
            multiline
            autoCapitalize={'sentences'}
            autoComplete={'off'}
            autoCorrect={true}
            autoFocus={true}
          />

          <Button
            onPress={saveFeedback}
            size="lg"
            iconRight
            color={CONSTS.MAIN_COLOR}
          >
            {`   Post Feedback ${feedbackText.length}/2000`}
            <Icon name="send" color="white" />
          </Button>
        </Card>
        <MarkdownHelp />
        <Card>
          <Markdown style={markdownStyles}>{feedbackText}</Markdown>
        </Card>
      </KeyboardAwareScrollView>
    </>
  )
}

export default FeedbackAdd
