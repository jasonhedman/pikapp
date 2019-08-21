import { AppLoading } from 'expo';
import { Asset } from 'expo-asset';
import * as Font from 'expo-font';
import React, { useState } from 'react';
import { Platform, StatusBar, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as firebase from 'firebase';
import { DefaultTheme, Provider as PaperProvider } from 'react-native-paper';

import AppNavigator from './navigation/AppNavigator';

const theme = {
  ...DefaultTheme,
  fonts: {
      regular: 'open-sans-regular',
      // medium: 'Roboto',
      // light: 'Roboto Light',
      // thin: 'Roboto Thin',
  },
  colors: {
    ...DefaultTheme.colors,
    primary: '#3498db',
    accent: '#f1c40f',
  }
};

export default class App extends React.Component {
  //todo
  //change member screen when owner deletes game --> test this with dad
  //complete profile page add records for each sport
  //time limit on games
  //only get games within on screen --> onmapchange
  //only get games within map View
  //friend system!!!!
  //map scrren listen to user change
  constructor(){
    super();

    this.state = {
      isLoadingComplete: false
    }
  }

  componentWillMount(){
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
    }
  render(){
    if (!this.state.isLoadingComplete) {
      return (
        <AppLoading
          startAsync={loadResourcesAsync}
          onError={handleLoadingError}
          onFinish={() => this.setState({isLoadingComplete:true})}
        />
      );
    } else {
      return (
        <PaperProvider theme={theme}>
          <View style={styles.container}>
            {Platform.OS === 'ios' && <StatusBar barStyle="default" />}
            <AppNavigator />
          </View>
        </PaperProvider>
      );
    }
  }
}

async function loadResourcesAsync() {
  await Promise.all([
    Asset.loadAsync([
      require('./assets/images/robot-dev.png'),
      require('./assets/images/robot-prod.png'),
    ]),
    Font.loadAsync({
      // This is the font that we are using for our tab bar
      ...Ionicons.font,
      // We include SpaceMono because we use it in HomeScreen.js. Feel free to
      // remove this if you are not using it in your app
      'space-mono': require('./assets/fonts/SpaceMono-Regular.ttf'),
      'open-sans-regular': require('./assets/fonts/OpenSans-Regular.ttf'),
    }),
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
    backgroundColor: '#fff',
  },
});
