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
  Switch,
} from '@rneui/themed'

// import { useActionSheet } from '@expo/react-native-action-sheet'

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

// import { useActionSheet } from '@expo/react-native-action-sheet'

import PropTypes from 'prop-types'

import * as CONSTS from '../../consts'
import * as UTILS from '../../utils'
import { VALID } from '../../valid'
import subscriptionClient from '../../subscriptionClientWs'

function Chat({ route, navigation }) {
  const chatRef = useRef(null)

  // const navigation = useNavigation()
  const { chatUuid, chatName } = route.params
  const { authContext } = useContext(CONSTS.AuthContext)

  const [messages, setMessages] = useState([])

  const [enteredText, setEnteredText] = useState('')

  const [isSubscribed, setIsSubscribed] = useState()
  // const { showActionSheetWithOptions } = useActionSheet()

  // .format("YYYY-MM-DD HH:mm:ss.SSS")
  // const [lastRead, setLastRead] = useState(moment())

  const { uuid, phoneNumber, token } = authContext
  const { width, height } = useDimensions().window
  // const { showActionSheetWithOptions } = useActionSheet()

  const topOffset = height / 3
  const resetMessages = async (newMessages) => {
    await setMessages([])
    await setMessages([...newMessages])
  }
  useEffect(() => {
    // console.log(`subscribing to ${chatUuid}`)
    // add subscription listener
    const observableObject = subscriptionClient.subscribe({
      query: gql`
        subscription onSendMessage($chatUuid: String!) {
          onSendMessage(chatUuid: $chatUuid) {
            chatUuid
            messageUuid
            createdBy
            nickName
            messageText
            createdAt
            deleted
          }
        }
      `,
      variables: {
        chatUuid,
      },
    })
    // console.log({ observableObject })
    const subscriptionParameters = {
      onmessage() {
        console.log('observableObject:: onMessage')
      },
      start() {
        console.log('observableObject:: Start')
      },
      next(data) {
        // console.log('observableObject:: ', { data })
        // eslint-disable-next-line no-unsafe-optional-chaining
        const { onSendMessage } = data?.data
        const receivedMessage = UTILS.messageMapper(onSendMessage)
        // this is new message
        const prevMessages = chatRef.current.state.messages

        // console.log({ messages: chatRef.current.state.messages })

        if (receivedMessage.deleted === false) {
          // subscribe to chat only for new messages
          UTILS.unreadCountReset({ uuid, phoneNumber, token, chatUuid })
          // this is new message -- append
          setMessages(GiftedChat.append(prevMessages, [receivedMessage]))
        } else {
          const updatedMessages = prevMessages.map((message) => {
            // eslint-disable-next-line no-underscore-dangle
            if (message._id === receivedMessage._id) {
              return {
                ...message,
                messageText: '...deleted...',
                text: '...deleted...',
              }
            }
            return { ...message }
          })
          setMessages(GiftedChat.append(undefined, updatedMessages))

          // resetMessages([...updatedMessages])
          // setMessages(GiftedChat.append(prevMessages, [receivedMessage]))
        }
      },
      error(error) {
        console.error('observableObject:: subscription error', { error })
        Toast.show({
          text1: 'Trying to re-connect, chat may not function properly.',
          // text2: 'You may want to leave this screen and come back to it again, to make it work.',
          text2: JSON.stringify({ error }),
          type: 'error',
          topOffset,
        })
        console.log(
          '------------------------- this is the whole new begining --------------------------------------',
        )
        // eslint-disable-next-line no-use-before-define
        subscription.unsubscribe()
        observableObject.subscribe(subscriptionParameters)
        // // _return({ uuid })
      },
      // complete() {
      //   console.log('observableObject:: subs. DONE')
      // }, // never printed
    }
    // console.log({ observableObject })
    // console.log(Object.entries(observableObject))

    const subscription = observableObject.subscribe(subscriptionParameters)

    // const subscription = observableObject.subscribe(result => {
    //   console.log('Subscription data => ', { result })
    // })

    return () => {
      subscription.unsubscribe()
      // console.log(`unsubscribing from ${chatUuid}`)
    }
  }, [])

  const deleteMessage = async ({ message }) => {
    try {
      const { text, createdAt, _id } = message

      // console.log({ message })

      const returnedMessage = await UTILS.messageSend({
        uuid,
        phoneNumber,
        token,
        messageUuid: _id,
        chatUuid,
        messageText: 'ignored',
        deleted: true,
      })
      // if (returnedMessage) {
      //   // setMessages([])
      //   setMessages((previousMessages) =>
      //     GiftedChat.append(previousMessages, [returnedMessage]),
      //   )
      // }
      // setIsSubscribed(true)
    } catch (e) {
      console.log('failed to send message: ', { e })
      Toast.show({
        text1: `Failed to delete message:`,
        text2: `${e}`,
        type: 'error',
        topOffset,
      })
    }
  }

  const onPress = (context, message) => {
    if (message?.text) {
      const options = ['Delete', 'Report Abuse', 'Cancel']
      const destructiveButtonIndex = 0
      const cancelButtonIndex = 2

      const icons = [
        <FontAwesome
          name="trash"
          size={20}
          style={{ color: CONSTS.MAIN_COLOR }}
        />,
        <FontAwesome
          name="ban"
          size={20}
          // style={{ color: CONSTS.MAIN_COLOR }}
        />,
        <FontAwesome
          name="remove"
          size={20}
          // style={{ color: CONSTS.MAIN_COLOR }}
        />,
      ]

      // const cancelButtonIndex = options.length - 1
      context.actionSheet().showActionSheetWithOptions(
        {
          title: `${message.text.slice(0, 100)} ${
            message.text.length > 100 ? '...' : ''
          }`,
          options,
          cancelButtonIndex,
          destructiveButtonIndex,
          icons,
        },
        (buttonIndex) => {
          switch (buttonIndex) {
            case destructiveButtonIndex:
              // Delete
              deleteMessage({
                message,
              })
              break

            case 1:
              // Report Abuse
              // reportAbuse({
              //   uuid,
              //   phoneNumber,
              //   token,
              //   messageUuid,
              //   chatUuid,
              //   messageText,
              //   deleted,
              // })
              break

            case cancelButtonIndex:
              break

            // Canceled
            default:
              break
          }
        },
      )
    }
  }

  const onSend = useCallback((_messages = []) => {
    // console.log(JSON.stringify(_messages))
    _messages.forEach(async (message) => {
      try {
        const { text, createdAt, _id } = message

        // console.log({ message })

        const returnedMessage = await UTILS.messageSend({
          uuid,
          phoneNumber,
          token,
          messageUuid: _id,
          chatUuid,
          messageText: text,
          deleted: false,
        })
        // if (returnedMessage) {
        //   // setMessages([])
        //   setMessages((previousMessages) =>
        //     GiftedChat.append(previousMessages, [returnedMessage]),
        //   )
        // }
        setIsSubscribed(true)
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
    // setMessages((previousMessages) =>
    //   GiftedChat.append(previousMessages, _messages),
    // )
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

  const renderHeaderRight = () => (
    <View
      style={{
        flex: 1,
        alignItems: 'center',
        paddingRight: 10,
      }}
    >
      <Text
        style={{
          fontSize: 10,
          fontWeight: '300',
        }}
      >
        {isSubscribed ? 'subscribed' : 'unsubscribed'}
      </Text>
      <Switch
        color={CONSTS.MAIN_COLOR}
        value={isSubscribed}
        onValueChange={async (value) => {
          // console.log({ value })
          if (value) {
            await UTILS.chatSubscribe({ uuid, phoneNumber, token, chatUuid })
            setIsSubscribed(true)
          } else {
            await UTILS.chatUnsubscribe({ uuid, phoneNumber, token, chatUuid })
            setIsSubscribed(false)
          }
        }}
      />
    </View>
  )

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
            color: CONSTS.MAIN_COLOR,
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
      <ActivityIndicator size="large" color={CONSTS.MAIN_COLOR} />
    </View>
  )

  const onLoadEarlier = async () => {
    // console.log('onLoadEarlier')
    // setMessages([...messages, await _loadMessages({ chatUuid, pageNumber: pageNumber + 1 })])

    const earlierMessages = await UTILS.messageList({
      uuid,
      phoneNumber,
      token,
      chatUuid,
      lastLoaded: messages.length
        ? messages[messages.length - 1].createdAt
        : `${dayjs().toISOString()}`,
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
        headerTitle: `${chatName}`,
        headerTintColor: CONSTS.MAIN_COLOR,
        headerRight: renderHeaderRight,
        headerLeft: renderHeaderLeft,
        headerBackTitle: '',
        headerStyle: {
          backgroundColor: CONSTS.NAV_COLOR,
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

      setIsSubscribed(
        await UTILS.isSubscribedToChat({ uuid, phoneNumber, token, chatUuid }),
      )
    })()
  }, [])

  useEffect(() => {
    navigation.setOptions({
      headerRight: renderHeaderRight,
    })
  }, [isSubscribed])

  useEffect(() => {
    // console.log({ isSubscribed })
  }, [isSubscribed])

  return (
    <SafeAreaView style={styles.container}>
      <GiftedChat
        ref={chatRef}
        // shouldUpdateMessage={() => true}
        // shouldUpdateMessage={(props, nextProps) =>
        //   props.extraData !== nextProps.extraData
        // }
        messages={messages}
        onSend={(sentMessages) => onSend(sentMessages)}
        onPress={(context, message) => onPress(context, message)}
        user={{
          _id: phoneNumber,
        }}
        // alwaysShowSend
        renderSend={renderSend}
        renderLoading={renderLoading}
        text={enteredText}
        onInputTextChanged={(text) => {
          if (VALID.messageText(text)) {
            setEnteredText(text)
          } else {
            Toast.show({
              text1: 'message 1-1024 characters',
              type: 'error',
              topOffset,
            })
          }
        }}
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
