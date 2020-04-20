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

    this.props._trace(
      this,
      "************** Starting  ******************",
      "constructor"
    );

    this.unsubscribe = null;

    this.state = {
      loading: true,
      hasCurrentUser: false,
    };
    this.registerForPushNotificationsAsync = this.registerForPushNotificationsAsync.bind(
      this
    );
  }

  componentDidMount() {
    this.props._trace(this, "subscribe to auth changes", "componentDidMount");
    const unsubscribe = firebase.auth().onAuthStateChanged((user) => {
      if (user != null) {
        this.props._trace(
          this,
          `isAuthenticated ${user.email}`,
          "componentDidMount"
        );
        this.registerForPushNotificationsAsync(user.uid);
        this.props._trace(this, "set hasCurrentUser true", "componentDidMount");
        this.setState({ hasCurrentUser: true, loading: false });
      } else {
        this.props._trace(
          this,
          "authStateChanged - NO USER",
          "componentDidMount"
        );
        this.props._trace(
          this,
          "set hasCurrentUser false",
          "componentDidMount"
        );
        this.setState({ hasCurrentUser: false, loading: false });
      }
    });
    this.unsubscribe = unsubscribe;
  }

  componentWillUnmount() {
    this.props._trace(this, "component will unmount", "componentWillUnmount");
    if (this.unsubscribe) {
      this.props._trace(
        this,
        "unsubscribe auth listener",
        "componentWillUnmount"
      );
      this.unsubscribe();
    }
  }

  render() {
    this.props._trace(this, "start", "render component");

    var view = null;
    if (this.state.loading) {
      // show nothing while loading. just sit on splash page.
      view = null
    } else if (this.state.hasCurrentUser) {
      view = <AuthenticatedUserProvider currentUserId={firebase.auth().currentUser.uid} >
            <MainTabNavigator />
          </AuthenticatedUserProvider>
    } else {
      view = <AuthNavigation />
    }

    return (
      <NavigationContainer>
        { view }
      </NavigationContainer>
    );
  }

  registerForPushNotificationsAsync = async (uid) => {
    this.props._trace(
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
      this.props._trace(
        this,
        `push notification status: ${finalStatus}`,
        "registerForPushNotificationsAsync"
      );
      return;
    } else {
      this.props._trace(
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
        this.props._trace(
          this,
          `Error Updating User Push Tokens: ${err}`,
          "registerForPushNotificationsAsync"
        );
      });
  };
}

export default withLogging(AppNavigator);
