import { AppLoading } from 'expo';
import { Asset } from 'expo-asset';
import * as Font from 'expo-font';
import React, { useState } from 'react';
import { Platform, StatusBar, StyleSheet, View, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as firebase from 'firebase';
import 'firebase/firestore';
import { Appearance, AppearanceProvider, useColorScheme } from 'react-native-appearance';

import { DefaultTheme, Provider as PaperProvider } from 'react-native-paper';
import * as Permissions from 'expo-permissions';

import AppNavigator from './navigation/AppNavigator';
import { user } from 'firebase-functions/lib/providers/auth';


const {height,width} = Dimensions.get('window')

let theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    dBlue: '#121D28',
    orange: '#E68A54',
    dGreen: "#008162",
    lGreen: "#56B49E",
    grey: "#83838A",
    lBlue: "#263644",
    white: "#FFFFFF",
    primary: '#121D28',
    background: '#121D28',
  }
};

export default class App extends React.Component {
  //todo
  //change member screen when owner deletes game --> test this with dad
  //time limit on games
  //only get games within on screen --> onmapchange
  //only get games within map View
  //friend system!!!!
  constructor(){
    super();

    this.state = {
      isLoadingComplete: false
    }
  }

  // componentDidMount(){
  //   firebase.firestore().collection('users').get()
  //     .then((users) => {
  //       users.forEach((user) => {
  //         firebase.firestore().collection('users').doc(user.id).update({
  //           gameHistory: [],
  //           wins: 0,
  //           losses: 0,
  //           sports:{
  //             basketball: {
  //               wins:0,
  //               losses:0,
  //               ptsFor: 0,
  //               ptsAgainst:0
  //             },
  //             football: {
  //               wins:0,
  //               losses:0,
  //               ptsFor: 0,
  //               ptsAgainst:0
  //             },
  //             spikeball: {
  //               wins:0,
  //               losses:0,
  //               ptsFor: 0,
  //               ptsAgainst:0
  //             },
  //             volleyball: {
  //               wins:0,
  //               losses:0,
  //               ptsFor: 0,
  //               ptsAgainst:0
  //             },
  //             soccer: {
  //               wins:0,
  //               losses:0,
  //               ptsFor: 0,
  //               ptsAgainst:0
  //             },
  //           },
  //           friendsList:[],
  //           followers:[],
  //           points:0
  //         })
  //       })
  //     })
  // }
  
  render(){
    if(Appearance.getColorScheme() == 'light'){
      theme.colors.iosBackground = "#fff";
    } else if(Appearance.getColorScheme() == 'dark'){
      theme.colors.iosBackground = theme.colors.dBlue;
    }
    if (!this.state.isLoadingComplete) {
      return (
        <AppLoading
          style={{height,width,backgroundColor:theme.colors.dBlue,padding:0}}
          startAsync={loadResourcesAsync}
          onError={handleLoadingError}
          onFinish={() => this.setState({isLoadingComplete:true})}
        />
      );
    } else {
      theme.fonts.regular = {
        fontFamily: 'raleway'
      };
      theme.fonts.medium = {
        fontFamily: 'raleway'
      };
      return (
        <AppearanceProvider>
          <PaperProvider theme={theme}>
            <View style={styles.container}>
              <AppNavigator />
            </View>
          </PaperProvider>
        </AppearanceProvider>
      );
    }
  }
}

async function loadResourcesAsync() {
  const firebaseConfig = {
    apiKey: "AIzaSyBxFRIxQAqgsTsBQmz0nIGFkMuzbsOpBOE",
    authDomain: "pickapp-4dcc0.firebaseapp.com",
    databaseURL: "https://pickapp-4dcc0.firebaseio.com",
    projectId: "pickapp-4dcc0",
    storageBucket: "gs://pickapp-4dcc0.appspot.com/",
    messagingSenderId: "322765285697",
    appId: "1:322765285697:web:ecd162e09c8d5a3f"
  };
  firebase.initializeApp(firebaseConfig);
  await Promise.all([
    Font.loadAsync({
      ...Ionicons.font,
      "raleway": require('./assets/fonts/Raleway-Regular.ttf'),
    }),
    Permissions.askAsync(Permissions.LOCATION),
    Permissions.askAsync(Permissions.CAMERA_ROLL),
    firebase.auth().setPersistence(firebase.auth.Auth.Persistence.LOCAL),
  ]);
}

function handleLoadingError(error: Error) {
  // In this case, you might want to report the error to your error reporting
  // service, for example Sentry
  console.warn(error);
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor:theme.colors.dBlue,
    height,
    width
  },
});
