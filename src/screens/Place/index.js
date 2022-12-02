import React, {
  useEffect,
  useState,
  useContext,
  useCallback,
  useRef,
} from 'react'
// import { useNavigation } from '@react-navigation/native'
import { useFocusEffect } from '@react-navigation/native'

import { useDimensions } from '@react-native-community/hooks'
import * as FileSystem from 'expo-file-system'

import * as Location from 'expo-location'

import { v4 as uuidv4 } from 'uuid'

import {
  Alert,
  SafeAreaView,
  StyleSheet,
  ScrollView,
  View,
  RefreshControl,
  InteractionManager,
} from 'react-native'

import Markdown from 'react-native-markdown-display'

// import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import * as Linking from 'expo-linking'

import {
  Text,
  Input,
  LinearProgress,
  Card,
  ListItem,
  Button,
  Icon,
  Switch,
  Badge,
} from '@rneui/themed'

import Spinner from 'react-native-loading-spinner-overlay'

// import * as FileSystem from 'expo-file-system'
import Toast from 'react-native-toast-message'

import {
  FontAwesome,
  Ionicons,
  MaterialCommunityIcons,
} from '@expo/vector-icons'

import PropTypes from 'prop-types'

import * as CONSTS from '../../consts'
import * as UTILS from '../../utils'
import { VALID } from '../../valid'

import Photo from './Photo'
import { markdownStyles } from '../../markdownHelp'

function Place({ route, navigation }) {
  const { placeUuid } = route.params

  const { authContext } = useContext(CONSTS.AuthContext)

  const [currentPlace, setCurrentPlace] = useState()

  const [placeChat, setPlaceChat] = useState()
  const [chatsCounts, setChatsCounts] = useState()

  const [isPlaceOwner, setIsPlaceOwner] = useState(false)
  const [canEdit, setCanEdit] = useState(false)

  const [showSpinner, setShowSpinner] = useState(false)

  const { width, height } = useDimensions().window
  const topOffset = height / 3

  const renderHeaderRight = () => {
    if (isPlaceOwner) {
      return (
        <View
          style={{
            flex: 1,
            alignItems: 'center',
            paddingRight: 10,
          }}
        >
          <Switch
            color={CONSTS.MAIN_COLOR}
            value={canEdit}
            onValueChange={(value) => setCanEdit(!canEdit)}
          />
          <Text
            style={{
              fontSize: 10,
              fontWeight: '300',
            }}
          >
            edit
          </Text>
        </View>
      )
    }
    return null
  }

  // const [place, setPlace] = useState()
  const renderHeaderLeft = () => (
    <FontAwesome
      name="chevron-left"
      size={30}
      style={{
        marginLeft: 10,
        color: CONSTS.MAIN_COLOR,
        width: 60,
      }}
      onPress={() => navigation.navigate('PlacesList')}
    />
  )

  const initPlaceOwner = async () => {
    const { uuid, phoneNumber, token } = authContext
    setIsPlaceOwner(
      await UTILS.isPlaceOwner({
        uuid,
        phoneNumber,
        token,
        placeUuid,
      }),
    )
  }

  const initChat = async () => {
    const { uuid, phoneNumber, token } = authContext
    try {
      if (!token) {
        setChatsCounts(null)
      }

      const loadedPlaceChat = await UTILS.placeChatReadDefault({
        uuid,
        phoneNumber,
        token,
        placeUuid,
      })

      const loadedChatPhones = await UTILS.unreadCounts({
        uuid,
        phoneNumber,
        token,
      })
      // console.log({ loadedChatPhones })
      const counts = loadedChatPhones
        .filter((obj) => loadedPlaceChat.chatUuid === obj?.chatUuid)
        .reduce((accumulator, object) => accumulator + object.unreadCounts, 0)

      // console.log({ counts, loadedPlaceChat })

      setPlaceChat(loadedPlaceChat)
      setChatsCounts(counts)
    } catch (err33) {
      console.log({ err33 })
      console.log('failed to load chats count')
      Toast.show({
        text1: 'Unable to load chats count',
        text2: err33.toString(),
        type: 'error',
        topOffset,
      })
    }
  }

  const refresh = async () => {
    // console.log('refreshing')
    // await init()
    setShowSpinner(true)
    const { uuid, phoneNumber, token } = authContext

    const { place, cards } = await UTILS.placeRead({
      placeUuid,
    })

    setCurrentPlace({ ...currentPlace, cards: [] })
    setCurrentPlace({ ...currentPlace, place, cards })

    setShowSpinner(false)
  }

  const onRefresh = React.useCallback(() => {
    initPlaceOwner()
    initChat()

    refresh()
  }, [])

  useEffect(() => {
    navigation.setOptions({
      headerTitle: currentPlace?.place?.placeName,
      headerTintColor: CONSTS.MAIN_COLOR,
      headerRight: renderHeaderRight,
      headerLeft: renderHeaderLeft,
      headerBackTitle: '',
      headerStyle: {
        backgroundColor: CONSTS.NAV_COLOR,
      },
    })
  }, [currentPlace])

  //  useCallback(() => {
  //   }, [])

  useEffect(() => {
    navigation.setOptions({
      headerRight: renderHeaderRight,
    })
  }, [isPlaceOwner, canEdit])

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', async () => {
      // The screen is focused
      initPlaceOwner()
      initChat()
      await refresh()
    })
    // Return the function to unsubscribe from the event so it gets removed on unmount
    return unsubscribe
  }, [navigation])

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

  // const { place, cards } = placeContext
  if (!currentPlace?.place) {
    return (
      <View style={styles.container}>
        <LinearProgress color={CONSTS.MAIN_COLOR} />
      </View>
    )
  }

  const deletePlace = async () => {
    setShowSpinner(true)

    try {
      const { uuid, phoneNumber, token } = authContext
      const deleted = await UTILS.placeDelete({
        uuid,
        phoneNumber,
        token,
        placeUuid,
      })

      if (deleted === true) {
        // setCardUuid(null)
        navigation.goBack()
      }
      // console.log({ response: JSON.stringify(response) })

      // await navigation.popToTop()
    } catch (err12) {
      // console.log({ err12 })
      Toast.show({
        text1: 'Unable to delete card, try again.',
        text2: err12.toString(),
        type: 'error',
        topOffset,
      })
    }
    setShowSpinner(false)
  }

  const addCard = async () => {
    setShowSpinner(true)

    const { uuid, phoneNumber, token } = authContext

    const placeCard = await UTILS.placeCardCreate({
      uuid,
      phoneNumber,
      token,
      placeUuid,
      cardTitle: 'New Card',
      cardText: 'Update Card Description, add optional photo.',
    })

    setShowSpinner(false)

    if (placeCard) {
      setCurrentPlace({
        ...currentPlace,
        cards: [...currentPlace.cards, placeCard],
      })
      // refresh()
      Toast.show({
        text1: 'Card Added to the bottom of the list',
        // text2: err12.toString(),
        type: 'info',
        topOffset,
      })

      // await refresh()
    }
  }

  // console.log({ canEdit })
  // console.log('re-render')
  const { uuid, phoneNumber, token } = authContext

  return (
    <SafeAreaView style={styles.container}>
      <Spinner
        visible={showSpinner}
        textContent={'Loading...'}
        // textStyle={styles.spinnerTextStyle}
      />
      <ScrollView
        // ref={scrollViewRef}
        // onContentSizeChange={() => } // scroll end
        refreshControl={
          <RefreshControl refreshing={showSpinner} onRefresh={onRefresh} />
        }
      >
        <Card>
          <Card.Title>Address</Card.Title>
          <Text>{currentPlace?.place?.streetAddress1}</Text>
          {currentPlace?.place?.streetAddress2 && (
            <Text>{currentPlace?.place?.streetAddress2}</Text>
          )}
          <Text>
            {currentPlace?.place?.city}, {currentPlace?.place?.region}{' '}
            {currentPlace?.place?.postalCode}
          </Text>
        </Card>
        <Card>
          <Button
            style={{ alignSelf: 'center', width: width / 2 }}
            onPress={async () => {
              if (placeChat) {
                navigation.navigate('Chat', {
                  chatUuid: placeChat.chatUuid,
                  placeName: currentPlace?.place?.placeName,
                })
              } else {
                navigation.navigate('PhoneCheck')
              }
            }}
            size="sm"
            color={CONSTS.MAIN_COLOR}
            iconRight
          >
            {`  Chat`}
            <Ionicons
              name="chatbubble-ellipses-outline"
              size={24}
              color="white"
            />{' '}
            {/* {unreadCounts && unreadCounts > 0 && ( */}
            {/* )} */}
          </Button>
          {chatsCounts > 0 && (
            <Badge
              // value={`${unreadCounts}`}
              value={`${chatsCounts}`}
              status="error"
              containerStyle={{
                position: 'absolute',
                top: -5,
                left: width / 2,
              }}
            />
          )}
        </Card>

        {currentPlace.cards.map((card, index) => {
          // eslint-disable-next-line no-lone-blocks
          {
            /* console.log(card.photoUuid) */
          }

          return (
            <Card key={index}>
              <Card.Title>{card.cardTitle}</Card.Title>
              {card?.photo && <Photo photo={card?.photo} />}
              <Markdown style={markdownStyles}>{card.cardText}</Markdown>
              {canEdit && (
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    alignContent: 'space-around',
                  }}
                >
                  {index > 0 && (
                    <Icon
                      name="arrow-up"
                      type="font-awesome-5"
                      color={CONSTS.MAIN_COLOR}
                      onPress={async () => {
                        setShowSpinner(true)
                        await UTILS.placeCardSwap({
                          uuid,
                          phoneNumber,
                          token,

                          placeUuid,

                          cardUuid1: card.cardUuid,
                          cardUuid2: currentPlace.cards[index - 1].cardUuid,
                        })
                        setShowSpinner(false)
                        refresh()
                      }}
                    />
                  )}
                  {!(index > 0) && <Text>{`   `}</Text>}

                  <Button
                    onPress={() => {
                      navigation.navigate('PlaceCardEdit', {
                        placeUuid,
                        cardUuid: card.cardUuid,
                      })
                    }}
                    size="sm"
                    color={CONSTS.MAIN_COLOR}
                    iconRight
                  >
                    {`  Edit Card`}
                    <Icon name="edit" color="white" />
                  </Button>

                  {index < currentPlace.cards.length - 1 && (
                    <Icon
                      name="arrow-down"
                      type="font-awesome-5"
                      color={CONSTS.MAIN_COLOR}
                      onPress={async () => {
                        setShowSpinner(true)
                        await UTILS.placeCardSwap({
                          uuid,
                          phoneNumber,
                          token,

                          placeUuid,

                          cardUuid1: card.cardUuid,
                          cardUuid2: currentPlace.cards[index + 1].cardUuid,
                        })
                        setShowSpinner(false)
                        refresh()
                      }}
                    />
                  )}
                  {!(index < currentPlace.cards.length - 1) && (
                    <Text>{`   `}</Text>
                  )}
                </View>
              )}
            </Card>
          )
        })}
        {canEdit && (
          <>
            <Card>
              <Button
                onPress={async () => {
                  addCard()
                }}
                size="lg"
                color="green"
                iconRight
              >
                {`  Add Card`}
                <Icon name="add" color="white" />
              </Button>
            </Card>
            <Card.Divider />
            <Card>
              <Button
                onPress={async () => {
                  navigation.navigate('Owners', { placeUuid })
                }}
                size="lg"
                color="red"
                iconRight
              >
                {`  Manage Owners`}
                <Icon name="admin-panel-settings" color="white" />
              </Button>
            </Card>
            <Card.Divider />
            <Card>
              <Button
                onPress={() => {
                  Alert.alert('Delete place', 'Are you sure?', [
                    {
                      text: 'Delete',
                      onPress: () => deletePlace(),
                    },
                    {
                      text: 'Cancel',
                      onPress: () => null,
                      style: 'cancel',
                    },
                  ])
                }}
                size="lg"
                color="red"
                iconRight
              >
                {`  Delete Place`}
                <Icon name="delete" color="white" />
              </Button>
            </Card>
          </>
        )}
        <Card.Divider />
      </ScrollView>
    </SafeAreaView>
  )
}
export default Place
