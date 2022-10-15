import React, { useEffect, useRef, useState } from 'react'

import { useDimensions } from '@react-native-community/hooks'

import PropTypes from 'prop-types'

import { FontAwesome, AntDesign } from '@expo/vector-icons'
import Toast from 'react-native-toast-message'

import // View,
'react-native'

import { Text, Card, Icon, Button } from '@rneui/themed'

import Swiper from 'react-native-swiper'

import Photo from './Photo'

import * as CONST from '../../consts'

const PhotosSwiper = ({ route, navigation }) => {
  const { photos, index } = route.params
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
      {photos.map((photo) => (
        <>
          <Photo photo={photo} />
          {currentIndex !== 0 && (
            <Card>
              <Button
                // onPress={takePhoto}
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
              // onPress={() => navigation.navigate('Place', { placeUuid })}
              size="lg"
              color="red"
              iconRight
            >
              {`  Delete`}
              <Icon name="delete" color="white" />
            </Button>
          </Card>
        </>
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
