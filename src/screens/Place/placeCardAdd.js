import React, { useRef, useState, useEffect, useContext } from 'react'
import { useFocusEffect } from '@react-navigation/native'

import { useDimensions } from '@react-native-community/hooks'

import { FontAwesome, Ionicons, AntDesign } from '@expo/vector-icons'
import Toast from 'react-native-toast-message'
import Spinner from 'react-native-loading-spinner-overlay'

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
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'

import { Col, Row, Grid } from 'react-native-easy-grid'
import * as ImageManipulator from 'expo-image-manipulator'
import * as MediaLibrary from 'expo-media-library'
import * as ImagePicker from 'expo-image-picker'
import * as Linking from 'expo-linking'

import CachedImage, { CacheManager } from 'expo-cached-image'
import * as FileSystem from 'expo-file-system'

import { v4 as uuidv4 } from 'uuid'

import PropTypes from 'prop-types'

import * as CONST from '../../consts'
import * as UTILS from '../../utils'
import { VALID } from '../../valid'

function PlaceCardAdd({ navigation }) {
  // const navigation = useNavigation()
  const { width, height } = useDimensions().window

  const { placeContext, setPlaceContext } = useContext(CONST.PlaceContext)
  const { authContext, setAuthContext } = useContext(CONST.AuthContext)

  const topOffset = height / 3

  const [showSpinner, setShowSpinner] = useState(false)
  const [canSubmit, setCanSubmit] = useState(false)

  const [cardTitle, setCardTitle] = useState('')
  const [cardText, setCardText] = useState('')

  const [cardTitleError, setCardTitleError] = useState('')
  const [cardTextError, setCardTextError] = useState('')

  const renderHeaderRight = () => null
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
      headerTitle: '',
      headerTintColor: CONST.MAIN_COLOR,
      headerRight: renderHeaderRight,
      headerLeft: renderHeaderLeft,
      headerBackTitle: '',
      headerStyle: {
        backgroundColor: CONST.NAV_COLOR,
      },
    })
  }, [])

  const valid = () => {
    setCardTitleError('')
    setCardTextError('')
    setCanSubmit(true)

    if (!VALID.cardTitle(cardTitle)) {
      setCardTitleError('4-50 characters')
      setCanSubmit(false)
    }
    if (!VALID.cardText(cardText)) {
      setCardTextError('4-1024 characters')
      setCanSubmit(false)
    }
  }

  useEffect(() => {
    // console.log({ smsCode, nickName })
    valid()
  }, [cardTitle, cardText])

  const addCard = async () => {
    setShowSpinner(true)

    try {
      const { uuid, phoneNumber, token } = authContext
      const placeCard = await UTILS.placeCardCreate({
        uuid,
        phoneNumber,
        token,
        placeUuid: placeContext.place.placeUuid,
        cardTitle,
        cardText,
      })
      // console.log({ response: JSON.stringify(response) })
      setPlaceContext({
        ...placeContext,
        cards: [...placeContext.cards, placeCard],
      })

      navigation.navigate('Place')
    } catch (err11) {
      console.log({ err11 })
      Toast.show({
        text1: 'Unable to create Place, try again.',
        text2: err11.toString(),
        type: 'error',
        topOffset,
      })
    }
    setShowSpinner(false)
  }

  return (
    <>
      <Spinner
        visible={showSpinner}
        textContent={'Adding Card...'}
        // textStyle={styles.spinnerTextStyle}
      />
      <KeyboardAwareScrollView>
        <Card>
          {/* <Card.Title>place photos</Card.Title> */}
          <Input
            label="Card Title"
            // leftIcon={{ type: 'MaterialIcons', name: 'description' }}
            placeholder={`enter title`}
            errorMessage={cardTitleError}
            value={`${cardTitle}`}
            onChangeText={(value) => {
              setCardTitle(value)
              // valid()
            }}
            multiline={false}
            autoCapitalize={'sentences'}
            autoComplete={'off'}
            autoCorrect={true}
            // autoFocus={true}
          />
          <Input
            label="Card Text"
            // leftIcon={{ type: 'MaterialIcons', name: 'description' }}
            placeholder={`enter text`}
            errorMessage={cardTextError}
            value={`${cardText}`}
            onChangeText={(value) => {
              setCardText(value)
              // valid()
            }}
            multiline
            autoCapitalize={'sentences'}
            autoComplete={'off'}
            autoCorrect={true}
            // autoFocus={true}
          />

          <Button
            onPress={addCard}
            size="lg"
            iconRight
            color={canSubmit ? CONST.MAIN_COLOR : CONST.SECONDARY_COLOR}
          >
            {`  Add Card`}
            <Icon name="add" color="white" />
          </Button>
        </Card>
      </KeyboardAwareScrollView>
    </>
  )
}

export default PlaceCardAdd
