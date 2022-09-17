import React, { useEffect, useState } from "react";
import { useNavigation } from "@react-navigation/native";

import { Alert, SafeAreaView, StyleSheet, ScrollView } from "react-native";

import {
  Text,
  Input,
  LinearProgress,
  Card,
  ListItem,
  Button,
} from "@rneui/themed";

// import * as FileSystem from 'expo-file-system'
import Toast from "react-native-toast-message";

import { FontAwesome, Ionicons, MaterialIcons } from "@expo/vector-icons";

import PropTypes from "prop-types";

import * as CONST from "../../consts.js";
import Footer from "../../components/Footer";

function PlacesList() {
  const navigation = useNavigation();

  const [nickName, setNickName] = useState("");
  const [nickNameEntered, setNickNameEntered] = useState(false);

  const [canSubmit, setCanSubmit] = useState(false);

  useEffect(() => {
    navigation.setOptions({
      headerTitle: "places near me",
      headerTintColor: CONST.MAIN_COLOR,
      headerRight: renderHeaderRight,
      headerLeft: renderHeaderLeft,
      headerBackTitle: "",
      headerStyle: {
        backgroundColor: CONST.NAV_COLOR,
      },
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    // resetFields()
  }, [navigation]);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
    },
    scrollView: {
      alignItems: "center",
      marginHorizontal: 0,
      paddingBottom: 300,
    },
  });

  const renderHeaderRight = () => (
    <MaterialIcons
      onPress={
        () => navigation.navigate('AddNewPlace')
      }
      name='add-circle'
      size={40}
      style={{
        marginRight: 10,
        color: CONST.MAIN_COLOR,
      }}
    />
  );

  const renderHeaderLeft = () => {};

  return (
    <SafeAreaView style={styles.container}>
      <Text>List of places</Text>
      <Footer />
    </SafeAreaView>
  );
}
export default PlacesList;
