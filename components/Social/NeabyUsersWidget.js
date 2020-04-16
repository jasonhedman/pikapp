import React from "react";
import {
  Dimensions,
  Keyboard,
  TouchableWithoutFeedback,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { Block } from "galio-framework";
import { TabView, SceneMap } from "react-native-tab-view";
import {
  withTheme,
  TextInput,
  Text,
  ActivityIndicator,
  Subheading,
} from "react-native-paper";
import { getDistance } from "geolib";
import HeaderBlock from "../../components/Utility/HeaderBlock";

import * as firebase from "firebase";
import "firebase/firestore";

const { height, width } = Dimensions.get("window");

class NearbyUsersWidget extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      users: new Array(),
      user: {},
      complete: false,
    };
  }

  componentDidMount() {
    // let currentUser;
    // firebase
    //   .firestore()
    //   .collection("users")
    //   .doc(firebase.auth().currentUser.uid)
    //   .get()
    //   .then((user) => {
    //     this.setState({ user: user.data() });
    //     return user.data();
    //   })
    //   .then((user) => {
    //     let nearbyLatKeys = [];
    //     let nearbyLngKeys = [];
    //     let nearbyLng = {};
    //     Promise.all([
    //       firebase
    //         .firestore()
    //         .collection("users")
    //         .where(
    //           "location.latitude",
    //           "<",
    //           user.location.latitude + 5 * (1 / 69)
    //         )
    //         .where(
    //           "location.latitude",
    //           ">",
    //           user.location.latitude - 5 * (1 / 69)
    //         )
    //         .get()
    //         .then((users) => {
    //           users.forEach((user) => {
    //             nearbyLatKeys.push(user.id);
    //           });
    //         }),
    //       firebase
    //         .firestore()
    //         .collection("users")
    //         .where(
    //           "location.longitude",
    //           "<",
    //           user.location.longitude + 5 * (1 / 69)
    //         )
    //         .where(
    //           "location.longitude",
    //           ">",
    //           user.location.longitude - 5 * (1 / 69)
    //         )
    //         .get()
    //         .then((users) => {
    //           users.forEach((user) => {
    //             nearbyLngKeys.push(user.id);
    //             nearbyLng[user.id] = user.data();
    //           });
    //         }),
    //     ]).then(() => {
    //       let nearbySortedKeys = nearbyLatKeys
    //         .filter(
    //           (value) =>
    //             nearbyLngKeys.includes(value) &&
    //             value != firebase.auth().currentUser.uid
    //         )
    //         .sort((a, b) => {
    //           return (
    //             getDistance(nearbyLng[a].location, user.location) -
    //             getDistance(nearbyLng[b].location, user.location)
    //           );
    //         });
    //       this.setState({
    //         users: nearbyLng,
    //         nearbySortedKeys,
    //         nearbyComplete: true,
    //       });
    //     });
    //   });
  }

  render() {
    const colors = this.props.theme.colors;
    return (
        null
    );
  }
}

export default withTheme(NearbyUsersWidget);
