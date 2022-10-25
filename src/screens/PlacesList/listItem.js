import React, { useEffect, useState } from 'react'
import { useNavigation } from '@react-navigation/native'
import { useDimensions } from '@react-native-community/hooks'

import * as Location from 'expo-location'

import {
  Alert,
  SafeAreaView,
  StyleSheet,
  ScrollView,
  View,
  FlatList,
  RefreshControl,
} from 'react-native'
import TouchableScale from 'react-native-touchable-scale' // https://github.com/kohver/react-native-touchable-scale
import { LinearGradient } from 'expo-linear-gradient'

import * as SecureStore from 'expo-secure-store'

import {
  Text,
  Input,
  LinearProgress,
  Card,
  Button,
  Overlay,
  Divider,
  ListItem,
  Avatar,
} from '@rneui/themed'

import { gql } from '@apollo/client'
import Spinner from 'react-native-loading-spinner-overlay'

// import * as FileSystem from 'expo-file-system'
import Toast from 'react-native-toast-message'

import { FontAwesome, Ionicons, MaterialIcons } from '@expo/vector-icons'
import { Col, Row, Grid } from 'react-native-easy-grid'

import CachedImage from 'expo-cached-image'

function listItem({ item, item: { cards }, navigation }) {
  // console.log({ item })
  // eslint-disable-next-line no-shadow
  const renderPhotoItem = function ({ item, index }) {
    // console.log({ item })
    const {
      photo,
      photo: { thumbUrl },
    } = item
    // console.log({ thumbUrl })
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
            expiresIn: 1, // seconds. This field is optional
          }}
          cacheKey={`${photo.photoUuid}-thumb`}
          resizeMode="contain"
          style={{
            flex: 1,
            alignSelf: 'stretch',
            width: 100,
            height: 100,
            borderRadius: 10,
          }}
        />
      </View>
    )
  }

  // console.log({ cards: cards.filter((card) => card?.photo !== null) })
  return (
    <ListItem
      onPress={() =>
        navigation.navigate('Place', { placeUuid: item.place.placeUuid })
      }
      style={{ paddingVertical: 8 }}
      Component={TouchableScale}
      friction={90} //
      tension={100} // These props are passed to the parent component (here TouchableScale)
      activeScale={0.95} //
      linearGradientProps={{
        colors: ['#FF9800', '#F44336'],
        start: { x: 1, y: 0 },
        end: { x: 0.2, y: 0 },
      }}
      ViewComponent={LinearGradient} // Only if no expo
    >
      {/* <Avatar rounded source={{ uri: avatar_url }} /> */}

      <ListItem.Content>
        <ListItem.Title
          style={{
            color: 'white',
            fontWeight: 'bold',
          }}
        >
          <Text style={{ position: 'absolute', right: 0 }}>{`${(
            item.place.distance * 0.000621371192
          ).toFixed(1)}mi`}</Text>
          {/* <ListItem.Chevron color="white" /> */}
        </ListItem.Title>

        <FlatList
          horizontal={true}
          data={cards.filter((card) => card?.photo !== null)}
          renderItem={renderPhotoItem}
          // keyExtractor={(item) => item.id}
          // extraData={selectedId}
        />
        <ListItem.Title
          style={{
            color: 'white',
            fontWeight: 'bold',
          }}
        >
          {`${item.place.placeName}`}
        </ListItem.Title>
        <ListItem.Subtitle style={{ color: 'white' }}>
          {`${item.place.streetAddress1}, ${item.place.city}, ${item.place.region}`}
        </ListItem.Subtitle>
      </ListItem.Content>
    </ListItem>
  )
}
export default listItem
