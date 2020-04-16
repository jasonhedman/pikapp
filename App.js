import React from "react";
import { StyleSheet, View, Dimensions, StatusBar } from "react-native";
import { Appearance } from "react-native-appearance";
import { DefaultTheme, Provider as PaperProvider } from "react-native-paper";

import { AppLoading } from "expo";
import { Ionicons } from "@expo/vector-icons";
import * as Font from "expo-font";
import * as Permissions from "expo-permissions";
import * as firebase from "firebase";

import LogglyProvider from "./contexts/loggingContext/LogglyProvider";
import ignoreWarnings from "react-native-ignore-warnings";
import AppNavigator from "./navigation/AppNavigator";

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
          <LogglyProvider
            token="59059019-605b-4aee-8c56-614fd989cab7"
            logToConsole={true}
          >
            <PaperProvider theme={theme}>
              <StatusBar barStyle="light-content" />
              <AppNavigator />
            </PaperProvider>
          </LogglyProvider>
        </View>
      );
    }
  }

  async loadResourcesAsync() {
    const firebaseConfig = {
      apiKey: "AIzaSyBxFRIxQAqgsTsBQmz0nIGFkMuzbsOpBOE",
      authDomain: "pickapp-4dcc0.firebaseapp.com",
      databaseURL: "https://pickapp-4dcc0.firebaseio.com",
      projectId: "pickapp-4dcc0",
      storageBucket: "pickapp-4dcc0.appspot.com",
      messagingSenderId: "322765285697",
      appId: "1:322765285697:web:ecd162e09c8d5a3f",
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
  },
});

export default App;
