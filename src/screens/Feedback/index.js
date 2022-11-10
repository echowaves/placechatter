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
  Icon,
} from '@rneui/themed'

// import * as FileSystem from 'expo-file-system'
import Toast from 'react-native-toast-message'

import {
  FontAwesome,
  Ionicons,
  MaterialCommunityIcons,
} from '@expo/vector-icons'
import Markdown from 'react-native-markdown-display'
import Spinner from 'react-native-loading-spinner-overlay'
import dayjs from 'dayjs'

import PropTypes from 'prop-types'

import * as CONST from '../../consts'
import * as UTILS from '../../utils'
import { VALID } from '../../valid'
import { markdownStyles } from '../../markdownHelp'

function Feedback({ navigation }) {
  // const navigation = useNavigation()
  const { authContext, setAuthContext } = useContext(CONST.AuthContext)
  const [showSpinner, setShowSpinner] = useState(false)

  const [feedbackList, setFeedbackList] = useState([])
  const [canSubmit, setCanSubmit] = useState(false)

  async function init() {
    UTILS.isValidToken({ authContext, navigation })

    const { uuid, phoneNumber, token } = authContext

    const thelist = await UTILS.feedbackList({
      uuid,
      phoneNumber,
      token,
    })
    console.log({ thelist })
    setFeedbackList(thelist)
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
      headerTitle: 'feedback',
      headerTintColor: CONST.MAIN_COLOR,
      headerRight: null,
      headerLeft: renderHeaderLeft,
      headerBackTitle: '',
      headerStyle: {
        backgroundColor: CONST.NAV_COLOR,
      },
    })
    init()
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
      <Spinner
        visible={showSpinner}
        textContent={'Loading...'}
        // textStyle={styles.spinnerTextStyle}
      />
      <ScrollView>
        <Card>
          <Button
            onPress={async () => {
              navigation.navigate('FeedbackAdd')
            }}
            size="lg"
            color="green"
            iconRight
          >
            {`  Add Feedback`}
            <Icon name="add" color="white" />
          </Button>
        </Card>

        {feedbackList.map((feedback, index) => {
          // eslint-disable-next-line no-lone-blocks
          {
            /* console.log(card.photoUuid) */
          }

          return (
            <Card key={index}>
              <Card.Title>
                {`${dayjs(`${feedback.createdAt}`).format(
                  VALID.renderDateFormat,
                )}`}
              </Card.Title>
              <Markdown style={markdownStyles}>
                {feedback.feedbackText}
              </Markdown>
            </Card>
          )
        })}

        <Card.Divider />
        <Card.Divider />
      </ScrollView>
    </SafeAreaView>
  )
}
export default Feedback
