import React from "react";
import { withTheme } from "react-native-paper";
import { getDistance } from "geolib";

import * as firebase from "firebase";
import "firebase/firestore";
import withAuthenticatedUser from "../../contexts/authenticatedUserContext/withAuthenticatedUser";

class NearbyUsersWidget extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      users: new Array(),
      complete: false,
    };
  }

  componentDidMount() {
    let currentUser = this.props._currentUserProfile;
    let nearbyLatKeys = [];
    let nearbyLngKeys = [];
    let nearbyLng = {};
    Promise.all([
      firebase
        .firestore()
        .collection("users")
        .where(
          "location.latitude",
          "<",
          currentUser.location.latitude + 5 * (1 / 69)
        )
        .where(
          "location.latitude",
          ">",
          currentUser.location.latitude - 5 * (1 / 69)
        )
        .get()
        .then((users) => {
          users.forEach((user) => {
            nearbyLatKeys.push(user.id);
          });
        }),
      firebase
        .firestore()
        .collection("users")
        .where(
          "location.longitude",
          "<",
          currentUser.location.longitude + 5 * (1 / 69)
        )
        .where(
          "location.longitude",
          ">",
          currentUser.location.longitude - 5 * (1 / 69)
        )
        .get()
        .then((users) => {
          users.forEach((user) => {
            nearbyLngKeys.push(user.id);
            nearbyLng[user.id] = user.data();
          });
        }),
    ]).then(() => {
      let nearbySortedKeys = nearbyLatKeys
        .filter(
          (value) => nearbyLngKeys.includes(value) && value != currentUser.id
        )
        .sort((a, b) => {
          return (
            getDistance(nearbyLng[a].location, currentUser.location) -
            getDistance(nearbyLng[b].location, currentUser.location)
          );
        });
      this.setState({
        users: nearbyLng,
        nearbySortedKeys,
        nearbyComplete: true,
      });
    });
  }

  render() {
    const colors = this.props.theme.colors;
    return null;
  }
}

export default withAuthenticatedUser(withTheme(NearbyUsersWidget));
