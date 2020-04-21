import React from "react";
import { StyleSheet, View, Dimensions, StatusBar } from "react-native";
import { Appearance } from "react-native-appearance";
import { DefaultTheme, Provider as PaperProvider } from "react-native-paper";

import { AppLoading } from "expo";
import { Ionicons } from "@expo/vector-icons";
import * as Font from "expo-font";
import * as Permissions from "expo-permissions";
import * as firebase from "firebase";
import ErrorBoundary from "./ErrorBoundary";

import LogglyProvider from "./contexts/loggingContext/LogglyProvider";
import ignoreWarnings from "react-native-ignore-warnings";
import AppNavigator from "./navigation/AppNavigator";
import { SafeAreaProvider } from "react-native-safe-area-view";

const { height, width } = Dimensions.get("window");

let theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    dBlue: "#121D28",
    orange: "#E68A54",
    dGreen: "#008162",
    lGreen: "#56B49E",
    grey: "#83838A",
    lBlue: "#263644",
    white: "#FFFFFF",
    primary: "#121D28",
    background: "#121D28",
  },
};

class App extends React.Component {
  constructor() {
    super();

    this.state = {
      isLoadingComplete: false,
    };

    ignoreWarnings(["componentWillMount has been renamed"]);

    this.loadResourcesAsync = this.loadResourcesAsync.bind(this);
    this.handleLoadingError = this.handleLoadingError.bind(this);

    if (Appearance.getColorScheme() == "light") {
      theme.colors.iosBackground = "#fff";
    } else if (Appearance.getColorScheme() == "dark") {
      theme.colors.iosBackground = theme.colors.dBlue;
    }
    theme.fonts.regular = {
      fontFamily: "raleway",
    };
    theme.fonts.medium = {
      fontFamily: "raleway",
    };
    theme.fonts.bold = { fontFamily: "ralewaySemiBold" };
  }

  render() {
    if (!this.state.isLoadingComplete) {
      return (
        <AppLoading
          style={{
            height,
            width,
            backgroundColor: theme.colors.dBlue,
            padding: 0,
          }}
          startAsync={this.loadResourcesAsync}
          onError={this.handleLoadingError}
          onFinish={() => this.setState({ isLoadingComplete: true })}
        />
      );
    } else {
      return (
        <View style={styles.container}>
          <SafeAreaProvider>
            <LogglyProvider
              token="59059019-605b-4aee-8c56-614fd989cab7"
              logToConsole={true}
            >
              <PaperProvider theme={theme}>
                <StatusBar barStyle="light-content" />
                <ErrorBoundary
                  onError={(error, stack) => {
                    console.log(`==== UNHANDLED ERROR: ${error}`);
                    console.log(stack);
                  }}
                >
                  <AppNavigator />
                </ErrorBoundary>
              </PaperProvider>
            </LogglyProvider>
          </SafeAreaProvider>
        </View>
      );
    }
  }

  async loadResourcesAsync() {
    const firebaseConfig = {
      apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
      authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
      databaseURL: process.env.REACT_APP_FIREBASE_DATABASE_URL,
      projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
      storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGE_SENDER_ID,
      appId: process.env.REACT_APP_FIREBASE_APP_ID,
    };

    await Promise.all([
      Font.loadAsync({
        ...Ionicons.font,
        raleway: require("./assets/fonts/Raleway-Regular.ttf"),
        ralewayBold: require("./assets/fonts/Raleway-SemiBold.ttf"),
      }),

      Permissions.askAsync(Permissions.LOCATION),

      new Promise((resolve) => {
        if (firebase.apps.length === 0) {
          firebase.initializeApp(firebaseConfig);
          firebase.auth().setPersistence(firebase.auth.Auth.Persistence.LOCAL);
        }
        resolve();
      }),
    ]).catch((err) => {
      // have to do something here. This is an app failure that should be
      // handled in the UI somehow AND should notify Pikapp that it happened
      // becuase it could be fatal.
      console.log("app: ***** loadResourcesAsync PROMISE ERROR ***");
      console.log(err);
    });
  }

  handleLoadingError(error) {
    console.warn(error);
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121D28",
  },
});

export default App;
