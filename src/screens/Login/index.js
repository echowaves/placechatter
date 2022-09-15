import React, { useEffect, useState } from 'react'
import { useNavigation } from '@react-navigation/native'

import {
  Alert,
  SafeAreaView,
  StyleSheet,
  ScrollView,
} from 'react-native'

import {
  Text,
  Input,
  LinearProgress,
  Card,
  ListItem,
  Button,
} from 'react-native-elements'
// import * as FileSystem from 'expo-file-system'
import Toast from 'react-native-toast-message'

import { FontAwesome, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons'

import PropTypes from 'prop-types'

import * as CONST from '../../consts.js'

const maxNickNameLength = 40  
const minNickNameLength = 4 

const SecretScreen = () => {
  const navigation = useNavigation()

  const [nickName, setNickName] = useState('')
  const [nickNameEntered, setNickNameEntered] = useState(false)

  const [canSubmit, setCanSubmit] = useState(false)

  useEffect(() => {

    navigation.setOptions({
      headerTitle: 'my login',
      headerTintColor: CONST.MAIN_COLOR,
      headerRight: renderHeaderRight,
      headerLeft: renderHeaderLeft,
      headerBackTitle: '',
      headerStyle: {
        backgroundColor: CONST.NAV_COLOR,
      },
    })
  }, [])// eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    // resetFields()
  }, [navigation])


  useEffect(() => {
    navigation.setOptions({
      headerTitle: 'my secret',
      headerTintColor: CONST.MAIN_COLOR,
      headerRight: renderHeaderRight,
      headerLeft: renderHeaderLeft,
      headerBackTitle: '',
      headerStyle: {
        backgroundColor: CONST.NAV_COLOR,
      },
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
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

  const renderHeaderRight = () => (
    <Ionicons
      onPress={
        canSubmit ? () => handleSubmit() : null
      }
      name="send"
      size={30}
      style={
        {
          marginRight: 10,
          color: canSubmit ? CONST.MAIN_COLOR : CONST.SECONDARY_COLOR,
        }
      }
    />
  )
  const renderHeaderLeft = () => (
    <FontAwesome
      name="chevron-left"
      size={30}
      style={
        {
          marginLeft: 10,
          color: CONST.MAIN_COLOR,
          width: 60,
        }
      }
      onPress={
        () => navigation.goBack()
      }
    />
  )

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollView}
        showsVerticalScrollIndicator={
          false
        }>
        <Card containerStyle={{ padding: 0 }}>
          <ListItem>
            <Text style={
              {
                color: CONST.MAIN_COLOR,
                fontSize: 20,
              }
            }>The secret allows you to carry incognito identity to a different device, or restore it from another phone.
            </Text>
          </ListItem>
        </Card>

        <Input
          placeholder="Nickname"
          autoCorrect={false}
          autoCapitalize="none"
          autoComplete="off"
          disabled={nickNameEntered}
          leftIcon={(
            <FontAwesome
              name="user"
              size={24}
              color="black"
            />
          )}
          value={nickName}
          onChangeText={text => setNickName(text.toLowerCase())}
          errorStyle={{ color: 'red' }}
          // errorMessage={errorsMap.get('nickName')}
        />
      </ScrollView>
    </SafeAreaView>
  )
}
export default SecretScreen
