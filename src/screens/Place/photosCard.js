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
  FlatList,
} from 'react-native'

import { Text, Card, LinearProgress, Divider, Badge, Icon } from '@rneui/themed'

import { Col, Row, Grid } from 'react-native-easy-grid'

import CachedImage from 'expo-cached-image'

import PropTypes from 'prop-types'

import * as CONST from '../../consts'

const FOOTER_HEIGHT = 70

function PhotosCard(props) {
  const { photos, takePhoto } = props

  const { width, height } = useDimensions().window
  const navigation = useNavigation()

  const renderItem = function ({ item, index }) {
    const { photoUuid, thumbUrl } = item
    // console.log({ index })
    return (
      <View
        key={index}
        style={{
          padding: 5,
        }}
      >
        <CachedImage
          source={{
            uri: `${thumbUrl}`,
            // expiresIn: 5, // seconds. This field is optional
          }}
          cacheKey={`${photoUuid}-thumb`}
          resizeMode="contain"
          style={{
            flex: 1,
            alignSelf: 'stretch',
            width: 150,
            height: 150,
            borderRadius: 10,
          }}
        />
      </View>
    )
  }

  return (
    <Card>
      <Card.Title>place photos</Card.Title>
      {takePhoto && (
        <Icon name="add-circle" color={CONST.MAIN_COLOR} onPress={takePhoto} />
      )}
      <FlatList
        horizontal={true}
        data={photos}
        renderItem={renderItem}
        // keyExtractor={(item) => item.id}
        // extraData={selectedId}
      />
    </Card>
  )
}

export default PhotosCard
