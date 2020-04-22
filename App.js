import React from "react";
import { StyleSheet, View, Dimensions, StatusBar } from "react-native";
import { Appearance } from "react-native-appearance";
import { DefaultTheme, Provider as PaperProvider } from "react-native-paper";
import { NavigationContainer } from "@react-navigation/native";
import { SafeAreaProvider } from "react-native-safe-area-view";
import ignoreWarnings from "react-native-ignore-warnings";
import { Notifications } from "expo";
import {
  REACT_APP_FIREBASE_API_KEY,
  REACT_APP_FIREBASE_AUTH_DOMAIN,
  REACT_APP_FIREBASE_DATABASE_URL,
  REACT_APP_FIREBASE_PROJECT_ID,
  REACT_APP_FIREBASE_STORAGE_BUCKET,
  REACT_APP_FIREBASE_MESSAGE_SENDER_ID,
  REACT_APP_FIREBASE_APP_ID
} from 'react-native-dotenv'

import { AppLoading } from "expo";
import { Ionicons } from "@expo/vector-icons";
import * as Font from "expo-font";
import * as Permissions from "expo-permissions";

import * as firebase from "firebase";

import ErrorBoundary from "./ErrorBoundary";
import MainTabNavigator from "./navigation/MainTabNavigator";
import AuthNavigation from "./navigation/AuthNavigation";
import AuthenticatedUserProvider from "./contexts/authenticatedUserContext/AuthenticatedUserProvider";
import trace from "./services/trace";

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
    trace(this, "constructing component", "constructor");

    this.state = {
      hasCurrentUser: false,
      isLoadingAuthComplete: true,
      isLoadingComplete: false,
    };

    ignoreWarnings(["componentWillMount has been renamed"]);

    this.loadResourcesAsync = this.loadResourcesAsync.bind(this);
    this.handleLoadingError = this.handleLoadingError.bind(this);
    this.registerForPushNotificationsAsync = this.registerForPushNotificationsAsync.bind(
      this
    );

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
    if (!this.state.isLoadingComplete || !this.state.isLoadingAuthComplete) {
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
              <PaperProvider theme={theme}>
                <StatusBar barStyle="light-content" />
                <ErrorBoundary
                  onError={(error, stack) => {
                    console.log(`==== UNHANDLED ERROR: ${error}`);
                    console.log(stack);
                  }}
                >
                  {this.state.hasCurrentUser ? (
                    <AuthenticatedUserProvider
                      currentUserId={firebase.auth().currentUser.uid}
                    >
                      <NavigationContainer><MainTabNavigator /></NavigationContainer>
                    </AuthenticatedUserProvider>
                  ) : (
                    <NavigationContainer><AuthNavigation /></NavigationContainer>
                  )}
                </ErrorBoundary>
              </PaperProvider>
          </SafeAreaProvider>
        </View>
      );
    }
  }

  async loadResourcesAsync() {
    const firebaseConfig = {
      apiKey: REACT_APP_FIREBASE_API_KEY,
      authDomain: REACT_APP_FIREBASE_AUTH_DOMAIN,
      databaseURL: REACT_APP_FIREBASE_DATABASE_URL,
      projectId: REACT_APP_FIREBASE_PROJECT_ID,
      storageBucket: REACT_APP_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: REACT_APP_FIREBASE_MESSAGE_SENDER_ID,
      appId: REACT_APP_FIREBASE_APP_ID,
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

    this.authUserSnapshotListener()

  }

  authUserSnapshotListener() {
    trace(this, "subscribe to auth changes", "authUserSnapshotListener");
    const unsubscribe = firebase.auth().onAuthStateChanged((user) => {
      trace(this, "authStateChanged", "authUserSnapshotListener");
      if (user != null) {
        trace(
          this,
          `isAuthenticated ${user.email}`,
          "authUserSnapshotListener"
        );
        this.registerForPushNotificationsAsync(user.uid);
        trace(this, "set hasCurrentUser true", "authUserSnapshotListener");
        this.setState({ hasCurrentUser: true, isLoadingAuthComplete: true });
      } else {
        trace(this, "authStateChanged - NO USER", "authUserSnapshotListener");
        trace(this, "set hasCurrentUser false", "authUserSnapshotListener");
        this.setState({ hasCurrentUser: false, isLoadingAuthComplete: true });
      }
    });
    this.unsubscribe = unsubscribe;
  }

  unsubscribeAuthUserSnapshotListener() {
    if (this.unsubscribe) {
      trace(
        this,
        "unsubscribe auth listener",
        "unsubscribeAuthUserSnapshotListener"
      );
      this.unsubscribe();
    }
  }

  registerForPushNotificationsAsync = async (uid) => {
    trace(
      this,
      "registering push notification",
      "registerForPushNotificationsAsync"
    );
    const { status: existingStatus } = await Permissions.getAsync(
      Permissions.NOTIFICATIONS
    );
    let finalStatus = existingStatus;
    if (existingStatus !== "granted") {
      const { status } = await Permissions.askAsync(Permissions.NOTIFICATIONS);
      finalStatus = status;
    }
    if (finalStatus !== "granted") {
      trace(
        this,
        `push notification status: ${finalStatus}`,
        "registerForPushNotificationsAsync"
      );
      return;
    } else {
      trace(
        this,
        "push notification granted",
        "registerForPushNotificationsAsync"
      );
    }

    let token = await Notifications.getExpoPushTokenAsync();

    firebase
      .firestore()
      .collection("users")
      .where("pushToken", "==", token)
      .get()
      .then((users) => {
        users.forEach((user) => {
          if (user.id != uid) {
            firebase.firestore().collection("users").doc(user.id).update({
              pushToken: firebase.firestore.FieldValue.delete(),
            });
          }
        });
      })
      .then(() => {
        firebase.firestore().collection("users").doc(uid).update({
          pushToken: token,
        });
      })
      .catch((err) => {
        trace(
          this,
          `Error Updating User Push Tokens: ${err}`,
          "registerForPushNotificationsAsync"
        );
      });
  };

  componentWillUnmount() {
    trace(this, "component will unmount", "componentWillUnmount");
    this.unsubscribeAuthUserSnapshotListener();
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
