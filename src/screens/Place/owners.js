import React, { useEffect, useState, useContext } from 'react'
// import { useNavigation } from '@react-navigation/native'

import {
  Alert,
  SafeAreaView,
  StyleSheet,
  ScrollView,
  RefreshControl,
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

import * as CONST from '../../consts'
import * as UTILS from '../../utils'
import { VALID } from '../../valid'

function Owners({ route, navigation }) {
  const { placeUuid } = route.params
  // const navigation = useNavigation()
  const { authContext } = useContext(CONST.AuthContext)
  const [showSpinner, setShowSpinner] = useState(false)

  const [ownersList, setOwnersList] = useState([])

  async function init() {
    if (await UTILS.isValidToken({ authContext, navigation })) {
      const { uuid, phoneNumber, token } = authContext

      const thelist = await UTILS.placePhoneList({
        uuid,
        phoneNumber,
        token,
        placeUuid,
      })
      // console.log({ thelist })
      setOwnersList(thelist)
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
          color: CONST.MAIN_COLOR,
          width: 60,
        }}
        onPress={() => navigation.goBack()}
      />
    )
  }

  useEffect(() => {
    navigation.setOptions({
      headerTitle: 'place owners',
      headerTintColor: CONST.MAIN_COLOR,
      headerRight: null,
      headerLeft: renderHeaderLeft,
      headerBackTitle: '',
      headerStyle: {
        backgroundColor: CONST.NAV_COLOR,
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
        {ownersList.map((owner, index) => {
          // eslint-disable-next-line no-lone-blocks
          {
            /* console.log(card.photoUuid) */
          }

          return (
            <Card key={index}>
              <Text>
                {phoneFormatter.format(owner?.phoneNumber, '(NNN) NNN-NNNN')}
              </Text>
            </Card>
          )
        })}

        <Card>
          <Button
            onPress={async () => {
              navigation.navigate('OwnerAdd', { placeUuid })
            }}
            size="lg"
            color="green"
            iconRight
          >
            {`  Add Owner`}
            <Icon name="add" color="white" />
          </Button>
        </Card>

        <Card.Divider />
        <Card.Divider />
      </ScrollView>
    </SafeAreaView>
  )
}
export default Owners
