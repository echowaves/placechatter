import React, { useRef, useState /* useEffect */ } from 'react'
import { useFocusEffect } from '@react-navigation/native'

import { useDimensions } from '@react-native-community/hooks'

import { FontAwesome, Ionicons, AntDesign } from '@expo/vector-icons'
import Toast from 'react-native-toast-message'
import CachedImage from 'expo-cached-image'

import {
  View,
  TouchableOpacity,
  Alert,
  InteractionManager,
  ScrollView,
  SafeAreaView,
  StyleSheet,
  ActivityIndicator,
} from 'react-native'

import { Text, Card, LinearProgress, Divider, Badge } from '@rneui/themed'
import { Col, Row, Grid } from 'react-native-easy-grid'

// import ReactNativeZoomableView from '@openspacelabs/react-native-zoomable-view/src/ReactNativeZoomableView'

// import ImageZoom from 'react-native-image-pan-zoom'

import PropTypes from 'prop-types'

import * as CONST from '../../consts'

const Photo = ({ photo }) => {
  const { width, height } = useDimensions().window
  const topOffset = height / 3

  // const navigation = useNavigation()

  const styles = StyleSheet.create({
    photoContainer: {
      width,
      height: width + 10,

      //   backgroundColor: '#333399',
    },
    photo: {
      width: width - 10,
      height: width - 10,
      position: 'absolute',
      top: 10,
      bottom: 0,
      right: 5,
      left: 5,
      borderRadius: 10,
      backgroundColor: '#333399',
    },
  })

  return (
    <View style={styles.photoContainer}>
      <CachedImage
        source={{
          uri: `${photo.thumbUrl}`,
          // expiresIn: 5, // seconds. This field is optional
        }}
        cacheKey={`${photo.photoUuid}-thumb.webp`}
        resizeMode="contain"
        style={styles.photo}
      />
      <CachedImage
        source={{
          uri: `${photo.imgUrl}`,
        }}
        cacheKey={`${photo.photoUuid}.webp`}
        placeholderContent={
          // optional
          <ActivityIndicator
            color={CONST.MAIN_COLOR}
            size="small"
            style={{
              flex: 1,
              justifyContent: 'center',
            }}
          />
        }
        resizeMode="contain"
        style={styles.photo}
      />
    </View>
  )
}

Photo.propTypes = {
  photo: PropTypes.object.isRequired,
}

export default Photo
