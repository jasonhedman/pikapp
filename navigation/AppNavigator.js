import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { Notifications } from "expo";
import * as Permissions from "expo-permissions";
import * as firebase from "firebase";

import withLogging from "../contexts/loggingContext/withLogging";
import AuthenticatedUserProvider from "../contexts/authenticatedUserContext/AuthenticatedUserProvider";
import MainTabNavigator from "./MainTabNavigator";
import AuthNavigation from "./AuthNavigation";

class AppNavigator extends React.Component {
  constructor(props) {
    super(props);

    this.logger("************** LOADING  ******************", "constructor");

    this.unsubscribe = null;

    this.state = {
      hasCurrentUser: false,
    };

    this.logger = this.logger.bind(this);
    this.registerForPushNotificationsAsync = this.registerForPushNotificationsAsync.bind(
      this
    );
  }

  logger(trace, method = null) {
    this.props._logger({
      component: this.constructor.name,
      method: method,
      trace: trace,
    });
  }

  componentDidMount() {
    this.logger("subscribe to auth changes", "componentDidMount");
    const unsubscribe = firebase.auth().onAuthStateChanged((user) => {
      if (user != null) {
        this.logger(`authStateChanged ${user.email}`, "componentDidMount");
        this.logger(`isAuthenticated ${user.email}`, "componentDidMount");
        this.registerForPushNotificationsAsync(user.uid);
        this.logger("set hasCurrentUserState true", "componentDidMount");
        this.setState({ hasCurrentUser: true });
      } else {
        this.logger(
          `loadResourcesAsync authStateChanged ==NOT AUTHD==`,
          "componentDidMount"
        );
        this.logger("set hasCurrentUserState false", "componentDidMount");
        this.setState({ hasCurrentUser: false });
      }
    });
    this.unsubscribe = unsubscribe;
  }

  componentWillUnmount() {
    this.logger("start", "componentWillUnmount");
    if (this.unsubscribe) {
      this.logger("unsubscribe auth changes", "componentWillUnmount");
      this.unsubscribe();
    }
  }

  render() {
    this.logger("start", "render");
    return (
      <NavigationContainer>
        {this.state.hasCurrentUser ? (
          <AuthenticatedUserProvider
            currentUserId={firebase.auth().currentUser.uid}
          >
            <MainTabNavigator />
          </AuthenticatedUserProvider>
        ) : (
          <AuthNavigation />
        )}
      </NavigationContainer>
    );
  }

  registerForPushNotificationsAsync = async (uid) => {
    this.logger("registerForPushNotificationsAsync", "start");
    const { status: existingStatus } = await Permissions.getAsync(
      Permissions.NOTIFICATIONS
    );
    this.logger(
      `existing push notification status: ${existingStatus}`,
      "registerForPushNotificationsAsync"
    );
    let finalStatus = existingStatus;
    if (existingStatus !== "granted") {
      const { status } = await Permissions.askAsync(Permissions.NOTIFICATIONS);
      finalStatus = status;
    }
    if (finalStatus !== "granted") {
      this.logger(
        `push notification status: ${finalStatus}`,
        "registerForPushNotificationsAsync"
      );
      return;
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
        this.logger(
          `Error Updating User Push Tokens: ${err}`,
          "registerForPushNotificationsAsync"
        );
      });
  };
}

export default withLogging(AppNavigator);
