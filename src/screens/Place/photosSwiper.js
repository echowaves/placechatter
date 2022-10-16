import React, { useEffect, useRef, useState, useContext } from 'react'

import { useDimensions } from '@react-native-community/hooks'

import PropTypes from 'prop-types'

import { FontAwesome, AntDesign } from '@expo/vector-icons'
import Toast from 'react-native-toast-message'

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

import { Text, Card, Icon, Button } from '@rneui/themed'

import Swiper from 'react-native-swiper'

import Photo from './Photo'

import * as CONST from '../../consts'

const PhotosSwiper = ({ route, navigation }) => {
  const { index } = route.params
  const [placeContext, setPlaceContext] = useContext(CONST.PlaceContext)
  // const [authContext, setAuthContext] = useContext(CONST.AuthContext)
  const [currentIndex, setCurrentIndex] = useState(index)

  const { width, height } = useDimensions().window
  const topOffset = height / 3

  const renderHeaderLeft = () => (
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

  const renderHeaderTitle = () => <Text>{`photo: ${currentIndex + 1}`}</Text>

  useEffect(() => {
    navigation.setOptions({
      headerTitle: renderHeaderTitle,
      headerLeft: renderHeaderLeft,
      headerStyle: {
        backgroundColor: CONST.NAV_COLOR,
      },
    })
  }, [])

  useEffect(() => {
    navigation.setOptions({
      headerTitle: renderHeaderTitle,
    })
  }, [currentIndex])

  const pushToFront = async () => {
    console.log({ currentIndex })
    const { photos } = placeContext
    await setPlaceContext({
      ...placeContext,
      photos: [],
    })
    await setPlaceContext({
      ...placeContext,
      photos: [
        photos[currentIndex],
        ...photos.slice(0, currentIndex),
        ...photos.slice(currentIndex + 1),
      ],
    })
    navigation.goBack()
  }

  const deleteCurrentPhoto = async () => {
    const { photos } = placeContext
    await setPlaceContext({
      ...placeContext,
      photos: [],
    })

    await setPlaceContext({
      ...placeContext,
      photos: [
        ...photos.slice(0, currentIndex),
        ...photos.slice(currentIndex + 1),
      ],
    })
    navigation.goBack()
  }

  return (
    // <GestureHandlerRootView>
    <Swiper
      keyboardShouldPersistTaps="always"
      removeClippedSubviews={false}
      // height="100%"
      // width="100%"
      bounces
      autoplay={false}
      horizontal
      loop={false}
      index={currentIndex}
      onIndexChanged={(newIndex) => {
        setCurrentIndex(newIndex)
      }} // otherwise will jump to wrong photo onLayout
      loadMinimal
      scrollEnabled
      loadMinimalSize={1}
      showsPagination={false}
      pagingEnabled
    >
      {placeContext?.photos.map((photo) => (
        <View key={photo.photoUuid}>
          <Photo photo={photo} />
          {currentIndex !== 0 && (
            <Card>
              <Button
                onPress={pushToFront}
                size="lg"
                iconRight
                // color={canSubmit ? CONST.MAIN_COLOR : CONST.SECONDARY_COLOR}
                // disabled={!canSubmit}
              >
                {`  Push to Front`}
                <Icon
                  type="material-community"
                  name="page-first"
                  color="white"
                />
              </Button>
            </Card>
          )}
          <Card>
            <Button
              onPress={deleteCurrentPhoto}
              size="lg"
              color="red"
              iconRight
            >
              {`  Delete`}
              <Icon name="delete" color="white" />
            </Button>
          </Card>
        </View>
      ))}
    </Swiper>
    // </GestureHandlerRootView>
  )
}

PhotosSwiper.defaultProps = {}

PhotosSwiper.propTypes = {
  route: PropTypes.object.isRequired,
}

export default PhotosSwiper
