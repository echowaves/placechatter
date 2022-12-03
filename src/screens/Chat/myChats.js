import React, { useEffect, useState, useContext } from 'react'
// import { useNavigation } from '@react-navigation/native'

import {
  View,
  Alert,
  SafeAreaView,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
} from 'react-native'
import phoneFormatter from 'phone-formatter'

import {
  Text,
  Input,
  LinearProgress,
  Card,
  ListItem,
  Button,
  Icon,
  Badge,
} from '@rneui/themed'

// import * as FileSystem from 'expo-file-system'
import Toast from 'react-native-toast-message'

import {
  FontAwesome,
  Ionicons,
  MaterialCommunityIcons,
} from '@expo/vector-icons'

import Spinner from 'react-native-loading-spinner-overlay'
import dayjs from 'dayjs'

import PropTypes from 'prop-types'

import * as CONSTS from '../../consts'
import * as UTILS from '../../utils'
import { VALID } from '../../valid'

function MyChats({ navigation }) {
  const { authContext } = useContext(CONSTS.AuthContext)
  const [showSpinner, setShowSpinner] = useState(false)

  const [chatsList, setChatsList] = useState()

  async function init() {
    if (await UTILS.isValidToken({ authContext, navigation })) {
      const { uuid, phoneNumber, token } = authContext

      const thelist = await UTILS.unreadCounts({
        uuid,
        phoneNumber,
        token,
      })

      // console.log({ thelist })
      setChatsList(thelist)
    }
  }

  React.useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      // The screen is focused
      init()
    })

    // Return the function to unsubscribe from the event so it gets removed on unmount
    return unsubscribe
  }, [navigation])

  const refresh = async () => {
    // console.log('refreshing')
    setShowSpinner(true)
    await init()
    setShowSpinner(false)
  }

  const onRefresh = React.useCallback(() => {
    refresh()
  }, [])

  function renderHeaderLeft() {
    return (
      <FontAwesome
        name="chevron-left"
        size={30}
        style={{
          marginLeft: 10,
          color: CONSTS.MAIN_COLOR,
          width: 60,
        }}
        onPress={() => navigation.goBack()}
      />
    )
  }

  useEffect(() => {
    navigation.setOptions({
      headerTitle: 'my chats',
      headerTintColor: CONSTS.MAIN_COLOR,
      headerRight: null,
      headerLeft: renderHeaderLeft,
      headerBackTitle: '',
      headerStyle: {
        backgroundColor: CONSTS.NAV_COLOR,
      },
    })
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
  if (chatsList === undefined) {
    return (
      <SafeAreaView style={styles.container}>
        <LinearProgress color={CONSTS.MAIN_COLOR} />
      </SafeAreaView>
    )
  }

  if (chatsList.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <Text
          style={{
            color: CONSTS.MAIN_COLOR,
          }}
        >
          You do not follow any chats yet. Start chatting in some place to see a
          list of your chats here.
        </Text>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      <Spinner
        visible={showSpinner}
        textContent={'Loading...'}
        // textStyle={styles.spinnerTextStyle}
      />
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={showSpinner} onRefresh={onRefresh} />
        }
      >
        {chatsList.map((chat, index) => {
          // eslint-disable-next-line no-lone-blocks
          {
            /* console.log(card.photoUuid) */
          }

          return (
            <Card key={index}>
              <TouchableOpacity
                style={{
                  flex: 1,
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                }}
                onPress={() => {
                  navigation.navigate('Chat', {
                    chatUuid: chat.chatUuid,
                    chatName: chat.chatName,
                  })
                }}
              >
                <Text
                  style={{
                    color: CONSTS.MAIN_COLOR,
                  }}
                >
                  {chat?.chatName}
                </Text>
                {chat?.unreadCounts > 0 && (
                  <Badge value={chat?.unreadCounts} status="error" />
                )}
              </TouchableOpacity>
            </Card>
          )
        })}

        <Card.Divider />
        <Card.Divider />
      </ScrollView>
    </SafeAreaView>
  )
}
export default MyChats
