import React, { useRef, useState, useEffect } from 'react'
import { useFocusEffect } from '@react-navigation/native'

import { useDimensions } from '@react-native-community/hooks'

import { FontAwesome, Ionicons, AntDesign } from '@expo/vector-icons'
import Toast from 'react-native-toast-message'
import CachedImage, { CacheManager } from 'expo-cached-image'

import {
  View,
  TouchableOpacity,
  Alert,
  InteractionManager,
  ScrollView,
  SafeAreaView,
  StyleSheet,
  ActivityIndicator,
  Image,
} from 'react-native'

import { Text, Card, LinearProgress, Divider, Badge } from '@rneui/themed'
import { Col, Row, Grid } from 'react-native-easy-grid'

// import ReactNativeZoomableView from '@openspacelabs/react-native-zoomable-view/src/ReactNativeZoomableView'

// import ImageZoom from 'react-native-image-pan-zoom'

import PropTypes from 'prop-types'

import * as CONST from '../../consts'

const Photo = ({ photo }) => {
  // console.log({ photo })
  const { width, height } = useDimensions().window
  const topOffset = height / 3

  // const navigation = useNavigation()

  const styles = StyleSheet.create({
    photoContainer: {
      flex: 1,
      flexDirection: 'row',

      // backgroundColor: 'aliceblue',
      shadowColor: 'black',
      shadowOffset: { height: 2 },
      shadowOpacity: 0.3,
    },
    photo: {
      flex: 1,
      resizeMode: 'contain',
      width,
      height: Math.floor(photo.height * ((width - 50) / photo.width)),
    },
  })

  // console.log({ height: `${(photo.height * width) / photo.width}` })
  return (
    <View style={styles.photoContainer}>
      <CachedImage
        source={{
          uri: `${photo.imgUrl}`,
        }}
        cacheKey={`${photo.photoUuid}.webp`}
        style={styles.photo}
        placeholderContent={
          <CachedImage
            source={{
              uri: `${photo.thumbUrl}`,
              // expiresIn: 5, // seconds. This field is optional
            }}
            cacheKey={`${photo.photoUuid}-thumb.webp`}
            style={styles.photo}
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
          />
        }
      />
    </View>
  )
}

Photo.propTypes = {
  photo: PropTypes.object.isRequired,
}

export default Photo
