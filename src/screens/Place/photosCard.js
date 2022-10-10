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

import { Text, Card, LinearProgress, Divider, Badge, Icon } from '@rneui/themed'

import { Col, Row, Grid } from 'react-native-easy-grid'

import PropTypes from 'prop-types'

import * as CONST from '../../consts'

const FOOTER_HEIGHT = 70

function PhotosCard(props) {
  const { photos, takePhoto } = props

  const { width, height } = useDimensions().window
  const navigation = useNavigation()

  return (
    <Card>
      <Card.Title>place photos</Card.Title>
      {takePhoto && (
        <Icon name="add-circle" color={CONST.MAIN_COLOR} onPress={takePhoto} />
      )}
    </Card>
  )
}

export default PhotosCard
