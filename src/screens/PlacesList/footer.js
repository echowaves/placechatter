import React, { useRef, useState /* useEffect */ } from 'react'
import { useFocusEffect, useNavigation } from '@react-navigation/native'

import { useDimensions } from '@react-native-community/hooks'

import { FontAwesome, Ionicons, AntDesign } from '@expo/vector-icons'
import Toast from 'react-native-toast-message'

import {
  View,
  TouchableOpacity,
  Alert,
  InteractionManager,
  ScrollView,
  SafeAreaView,
  StyleSheet,
} from 'react-native'

import { Text, Card, LinearProgress, Divider, Badge } from '@rneui/themed'

import { Col, Row, Grid } from 'react-native-easy-grid'

import PropTypes from 'prop-types'

import * as CONSTS from '../../consts'

function Footer() {
  const { width, height } = useDimensions().window
  const navigation = useNavigation()

  return (
    // <SafeAreaView
    //   style={{
    //     backgroundColor: CONST.FOOTER_COLOR,
    //     width,
    //     height: FOOTER_HEIGHT,
    //     position: 'absolute',
    //     bottom: 0,
    //     right: 0,
    //     left: 0,
    //   }}
    // >
    <View
      style={{
        position: 'absolute',
        bottom: 0,
        right: 0,
        left: 0,
        // backgroundColor: 'rgba(0,0,0,0.5)',
        width,
        // height: CONSTS.FOOTER_HEIGHT,
      }}
    >
      {/* drawer button */}
      <TouchableOpacity
        style={{
          justifyContent: 'center',
          alignItems: 'center',
          borderRadius: 50,
          backgroundColor: 'white',
          height: 50,
          width: 50,
          position: 'absolute',
          bottom: 10,
          left: 35,
        }}
        onPress={() => {
          navigation.openDrawer()
        }}
      >
        <FontAwesome
          name="navicon"
          size={25}
          style={{
            color: CONSTS.MAIN_COLOR,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        />
      </TouchableOpacity>

      <TouchableOpacity
        style={{
          justifyContent: 'center',
          alignItems: 'center',
          borderRadius: 50,
          backgroundColor: 'white',
          height: 50,
          width: 50,
          position: 'absolute',
          bottom: 10,
          right: 35,
        }}
        onPress={() => {
          navigation.openDrawer()
        }}
      >
        <Ionicons
          name="chatbubble-ellipses"
          size={35}
          style={{
            color: CONSTS.MAIN_COLOR,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        />
      </TouchableOpacity>
    </View>
  )
}

export default Footer
