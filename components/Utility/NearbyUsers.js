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

const FirstRoute = () => (
  <Block flex style={[{ backgroundColor: "#ff4081" }]} />
);
const SecondRoute = () => (
  <Block flex style={[{ backgroundColor: "#673ab7" }]} />
);

class GroupInvite extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      users: new Array(),
      user: {},
      complete: false,
    };
  }

  componentDidMount() {
    let currentUser;
    firebase
      .firestore()
      .collection("users")
      .doc(firebase.auth().currentUser.uid)
      .get()
      .then(user => {
        this.setState({ user: user.data() });
        return user.data();
      })
      .then(user => {
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
              user.location.latitude + 5 * (1 / 69)
            )
            .where(
              "location.latitude",
              ">",
              user.location.latitude - 5 * (1 / 69)
            )
            .get()
            .then(users => {
              users.forEach(user => {
                nearbyLatKeys.push(user.id);
              });
            }),
          firebase
            .firestore()
            .collection("users")
            .where(
              "location.longitude",
              "<",
              user.location.longitude + 5 * (1 / 69)
            )
            .where(
              "location.longitude",
              ">",
              user.location.longitude - 5 * (1 / 69)
            )
            .get()
            .then(users => {
              users.forEach(user => {
                nearbyLngKeys.push(user.id);
                nearbyLng[user.id] = user.data();
              });
            }),
        ]).then(() => {
          let nearbySortedKeys = nearbyLatKeys
            .filter(
              value =>
                nearbyLngKeys.includes(value) &&
                value != firebase.auth().currentUser.uid
            )
            .sort((a, b) => {
              return (
                getDistance(nearbyLng[a].location, user.location) -
                getDistance(nearbyLng[b].location, user.location)
              );
            });
          this.setState({
            users: nearbyLng,
            nearbySortedKeys,
            nearbyComplete: true,
          });
        });
      });
  }

  render() {
    const colors = this.props.theme.colors;
    return (
      <>
        <ScrollView style={{ flex:1 }}>
          {this.state.nearbyComplete ? (
            this.state.nearbySortedKeys.map((userId, key) => {
              let user = this.state.users[userId];
              let distance = Math.round(
                getDistance(user.location, this.state.user.location) *
                  0.000621371
              );
              return (
                <TouchableOpacity
                  onPress={() => this.props.onPress(user)}
                  key={key}
                  style={{ width: "100%" }}
                >
                  <Block
                    row
                    center
                    middle
                    style={{
                      justifyContent: "space-between",
                      borderColor: colors.orange,
                      borderWidth: 1,
                      borderRadius: 8,
                      padding: 10,
                      width: "100%",
                      marginBottom: 10,
                    }}
                  >
                    <Block column>
                      <Text style={{ color: "#fff" }}>{user.name}</Text>
                      <Text style={{ color: "#fff" }}>@{user.username}</Text>
                    </Block>
                    <Text style={{ color: "#fff" }}>{`${
                      distance < 1 ? "<1" : distance
                    } ${distance < 2 ? "Mile" : "Miles"} Away`}</Text>
                  </Block>
                </TouchableOpacity>
              );
            })
          ) : (
            <ActivityIndicator
              style={{ opacity: 1 }}
              animating={true}
              color={this.props.theme.colors.orange}
              size={"small"}
            />
          )}
        </ScrollView>
      </>
    );
  }
}

export default withTheme(GroupInvite);
