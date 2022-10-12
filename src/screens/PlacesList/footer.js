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

import * as CONST from '../../consts'

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
    <Grid
      style={{
        position: 'absolute',
        bottom: 35,
        right: 0,
        left: 0,
        backgroundColor: CONST.FOOTER_COLOR,
        width,
        height: CONST.FOOTER_HEIGHT,
      }}
    >
      {/* drawer button */}
      <Col
        style={{
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <FontAwesome
          onPress={() => navigation.openDrawer()}
          name="navicon"
          size={25}
          style={{
            color: CONST.MAIN_COLOR,
            position: 'absolute',
            bottom: 0,
            left: 15,
          }}
        />
      </Col>
    </Grid>
    // </SafeAreaView>
  )
}

export default Footer
