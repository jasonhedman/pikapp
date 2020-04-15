import { AppLoading } from 'expo';
import * as Font from 'expo-font';
import React from 'react';
import { StyleSheet, View, Dimensions, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as firebase from 'firebase';
import 'firebase/firestore';
import 'firebase/functions';
import { Appearance, AppearanceProvider } from 'react-native-appearance';

import { DefaultTheme, Provider as PaperProvider } from 'react-native-paper';
import * as Permissions from 'expo-permissions';

import AppNavigator from './navigation/AppNavigator';
import { user } from 'firebase-functions/lib/providers/auth';
import { SafeAreaProvider } from 'react-native-safe-area-context';

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
  constructor(){
    super();

    this.state = {
      isLoadingComplete: false
    }
  }
  
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
      theme.fonts.bold = {
        fontFamily: 'ralewaySemiBold'
      }
      return (
        <SafeAreaProvider>
          <AppearanceProvider>
            <PaperProvider theme={theme}>
              <StatusBar barStyle="light-content" /> 
              <View style={styles.container}>
                <AppNavigator />
              </View>
            </PaperProvider>
          </AppearanceProvider>
        </SafeAreaProvider>
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
    storageBucket: "pickapp-4dcc0.appspot.com",
    messagingSenderId: "322765285697",
    appId: "1:322765285697:web:ecd162e09c8d5a3f"
  };
  await Promise.all([
    firebase.initializeApp(firebaseConfig),
    Font.loadAsync({
      ...Ionicons.font,
      "raleway": require('./assets/fonts/Raleway-Regular.ttf'),
      'ralewaySemiBold': require('./assets/fonts/Raleway-SemiBold.ttf'),
    }),
    Permissions.askAsync(Permissions.LOCATION),
    firebase.auth().setPersistence(firebase.auth.Auth.Persistence.LOCAL),
  ])
  .then(() => {
  });
}

function handleLoadingError(error: Error) {
  console.warn(error);
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor:theme.colors.dBlue,
  },
});
