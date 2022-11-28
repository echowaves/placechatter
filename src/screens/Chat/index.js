import React, {
  useEffect,
  useState,
  useContext,
  useCallback,
  useRef,
} from 'react'
// import { useNavigation } from '@react-navigation/native'

import {
  Alert,
  SafeAreaView,
  StyleSheet,
  ScrollView,
  View,
  ActivityIndicator,
} from 'react-native'

import {
  Text,
  Input,
  LinearProgress,
  Card,
  ListItem,
  Button,
} from '@rneui/themed'

// import * as FileSystem from 'expo-file-system'
import Toast from 'react-native-toast-message'
import { GiftedChat, Send } from 'react-native-gifted-chat'
import { useDimensions } from '@react-native-community/hooks'

import dayjs from 'dayjs'
import { gql } from '@apollo/client'

import {
  FontAwesome,
  Ionicons,
  MaterialCommunityIcons,
} from '@expo/vector-icons'

import PropTypes from 'prop-types'

import * as CONST from '../../consts'
import * as UTILS from '../../utils'
import { VALID } from '../../valid'
// import subscriptionClient from '../../subscriptionClientWs'

function Chat({ route, navigation }) {
  // const navigation = useNavigation()
  const { chatUuid, placeName } = route.params

  const { authContext } = useContext(CONST.AuthContext)

  const [messages, setMessages] = useState([])
  // .format("YYYY-MM-DD HH:mm:ss.SSS")
  // const [lastRead, setLastRead] = useState(moment())

  const { uuid, phoneNumber, token } = authContext
  const { width, height } = useDimensions().window

  const topOffset = height / 3

  // useEffect(() => {
  //   console.log(`subscribing to ${chatUuid}`)
  //   // add subscription listener
  //   const observableObject = subscriptionClient.subscribe({
  //     query: gql`
  //       subscription onSendMessage($chatUuid: String!) {
  //         onSendMessage(chatUuid: $chatUuid) {
  //           chatUuid
  //           createdAt
  //           messageUuid
  //           text
  //           pending
  //           chatPhotoHash
  //           updatedAt
  //           uuid
  //         }
  //       }
  //     `,
  //     variables: {
  //       chatUuid,
  //     },
  //   })
  //   // console.log({ observableObject })
  //   const subscriptionParameters = {
  //     onmessage() {
  //       console.log('onMessage')
  //     },
  //     start() {
  //       console.log('observableObject:: Start')
  //     },
  //     next(data) {
  //       // console.log('observableObject:: ', { data })
  //       // eslint-disable-next-line no-unsafe-optional-chaining
  //       const { onSendMessage } = data?.data
  //       // console.log({ onSendMessage })
  //       setMessages((previousMessages) => {
  //         const updatedMessages = previousMessages.map((message) => {
  //           if (message.messageUuid === onSendMessage.messageUuid) {
  //             // this is the update of the message which is already in the feed
  //             return {
  //               _id: onSendMessage.messageUuid,
  //               text: onSendMessage.messageText,
  //               createdAt: onSendMessage.createdAt,
  //               user: {
  //                 _id: onSendMessage.createdBy,
  //                 name: onSendMessage.nickName,
  //                 // avatar: 'https://placeimg.com/140/140/any',
  //               },
  //             }
  //           }
  //           return message
  //         })
  //         // this is a new message which was not present in the feed, let's append it to the end
  //         if (
  //           updatedMessages.find(
  //             (message) => message.messageUuid === onSendMessage.messageUuid,
  //           ) === undefined
  //         ) {
  //           // console.log({ onSendMessage })
  //           return [
  //             {
  //               _id: onSendMessage.messageUuid,
  //               text: onSendMessage.messageText,
  //               createdAt: onSendMessage.createdAt,
  //               user: {
  //                 _id: onSendMessage.createdBy,
  //                 name: onSendMessage.nickName,
  //                 // avatar: 'https://placeimg.com/140/140/any',
  //               },
  //             },
  //             ...updatedMessages,
  //           ]
  //         } // if this is the new message
  //         // console.log({ updatedMessages })
  //         return updatedMessages
  //       })
  //       // update read counts
  //       UTILS.unreadCountReset({ uuid, phoneNumber, token, chatUuid })
  //     },
  //     error(error) {
  //       console.error('observableObject:: subscription error', { error })
  //       Toast.show({
  //         text1: 'Trying to re-connect, chat may not function properly.',
  //         // text2: 'You may want to leave this screen and come back to it again, to make it work.',
  //         text2: JSON.stringify({ error }),
  //         type: 'error',
  //         topOffset,
  //       })
  //       console.log(
  //         '------------------------- this is the whole new begining --------------------------------------',
  //       )
  //       // eslint-disable-next-line no-use-before-define
  //       subscription.unsubscribe()
  //       observableObject.subscribe(subscriptionParameters)
  //       // // _return({ uuid })
  //     },
  //     // complete() {
  //     //   console.log('observableObject:: subs. DONE')
  //     // }, // never printed
  //   }
  //   // console.log({ observableObject })
  //   // console.log(Object.entries(observableObject))

  //   const subscription = observableObject.subscribe(subscriptionParameters)

  //   // const subscription = observableObject.subscribe(result => {
  //   //   console.log('Subscription data => ', { result })
  //   // })

  //   return () => {
  //     subscription.unsubscribe()
  //     console.log(`unsubscribing from ${chatUuid}`)
  //   }
  // }, [])

  const onSend = useCallback((_messages = []) => {
    console.log(JSON.stringify(_messages))
    _messages.forEach(async (message) => {
      try {
        const { text, createdAt, _id } = message

        console.log({ message })

        const returnedMessage = await UTILS.messageSend({
          uuid,
          phoneNumber,
          token,
          messageUuid: _id,
          chatUuid,
          messageText: text,
        })
        if (returnedMessage) {
          console.log({ returnedMessage })

          setMessages((previousMessages) =>
            GiftedChat.append(previousMessages, [
              {
                _id: returnedMessage.messageUuid,
                text: returnedMessage.messageText,
                createdAt,
                user: {
                  _id: returnedMessage.createdBy,
                  name: returnedMessage.nickName,
                  // avatar: 'https://placeimg.com/140/140/any',
                },
              },
            ]),
          )
        }
      } catch (e) {
        console.log('failed to send message: ', { e })
        Toast.show({
          text1: `Failed to send message:`,
          text2: `${e}`,
          type: 'error',
          topOffset,
        })
      }
    })
  }, [])

  const styles = StyleSheet.create({
    container: {
      flex: 1,
    },
    // scrollView: {
    //     alignItems: 'center',
    //     marginHorizontal: 0,
    //     paddingBottom: 300,
    //   },
    //   thumbnail: {
    //     // flex: 1,
    //     // alignSelf: 'stretch',
    //     width: '100%',
    //     height: '100%',
    //     borderRadius: 10,
    //   },
  })

  const back = () => {
    UTILS.unreadCountReset({ uuid, phoneNumber, token, chatUuid })
    navigation.goBack()
  }

  const renderHeaderRight = () => {}

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
        back({ uuid })
      }}
    />
  )
  const renderSend = (props) => (
    <Send {...props}>
      <View
        style={{
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <MaterialCommunityIcons
          name="send-circle"
          size={35}
          style={{
            marginRight: 10,
            marginBottom: 10,
            color: CONST.MAIN_COLOR,
          }}
        />
      </View>
    </Send>
  )

  const renderLoading = () => (
    <View
      style={{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <ActivityIndicator size="large" color={CONST.MAIN_COLOR} />
    </View>
  )

  const onLoadEarlier = async () => {
    console.log('onLoadEarlier')
    // setMessages([...messages, await _loadMessages({ chatUuid, pageNumber: pageNumber + 1 })])

    const earlierMessages = await UTILS.messageList({
      uuid,
      phoneNumber,
      token,
      chatUuid,
      lastLoaded: messages[messages.length - 1].createdAt,
    })
    // console.log({ earlierMessages })
    setMessages((previousMessages) =>
      GiftedChat.prepend(previousMessages, earlierMessages),
    )
    // setMessages([(await _loadMessages({ chatUuid, pageNumber: pageNumber + 1 })), ...messages])

    // setLastRead(earlierMessages[0].createdAt)
  }

  const renderAccessory = () => (
    <View
      style={{
        flexDirection: 'row',
        // alignItems: 'center',
        justifyContent: 'space-evenly',
        padding: 10,
      }}
    >
      <View />
      {/* <FontAwesome
        name="camera"
        size={25}
        style={{
          // marginRight: 10,
          // marginBottom: 10,
          color: CONST.MAIN_COLOR,
        }}
        onPress={async () => takePhoto()}
      />
      <FontAwesome
        name="image"
        size={25}
        style={{
          // marginRight: 10,
          // marginBottom: 10,
          color: CONST.MAIN_COLOR,
        }}
        onPress={async () => pickAsset()}
      /> */}
      <View />
    </View>
  )

  useEffect(() => {
    ;(async () => {
      navigation.setOptions({
        headerTitle: `chat: ${placeName}`,
        headerTintColor: CONST.MAIN_COLOR,
        headerRight: renderHeaderRight,
        headerLeft: renderHeaderLeft,
        headerBackTitle: '',
        headerStyle: {
          backgroundColor: CONST.NAV_COLOR,
        },
      })

      const messagesList = await UTILS.messageList({
        uuid,
        phoneNumber,
        token,
        chatUuid,
        lastLoaded: `${dayjs().toISOString()}`,
      })

      // console.log({ messagesList })
      setMessages(messagesList)

      UTILS.unreadCountReset({ uuid, phoneNumber, token, chatUuid })
    })()
  }, [])

  return (
    <SafeAreaView style={styles.container}>
      <GiftedChat
        messages={messages}
        onSend={(sentMessages) => onSend(sentMessages)}
        user={{
          _id: phoneNumber,
        }}
        // alwaysShowSend
        renderSend={renderSend}
        renderLoading={renderLoading}
        // scrollToBottomComponent={scrollToBottomComponent}
        infiniteScroll
        loadEarlier
        onLoadEarlier={onLoadEarlier}
        renderUsernameOnMessage
        renderAccessory={renderAccessory}
      />
    </SafeAreaView>
  )
}

Chat.propTypes = {
  route: PropTypes.object.isRequired,
}

export default Chat
