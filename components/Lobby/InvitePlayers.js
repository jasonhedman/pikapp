import React from "react";

import {
  TouchableWithoutFeedback,
  Keyboard,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  StyleSheet,
} from "react-native";

import { Block } from "galio-framework";

import * as firebase from "firebase";
require("firebase/functions");
import HeaderBlock from "../Utility/HeaderBlock";
import moment from "moment";
import { getDistance } from "geolib";
import * as geofirex from "geofirex";
const geo = geofirex.init(firebase);

import onShare from "../../services/onShare";

import {
  withTheme,
  Text,
  Headline,
  Button,
  ActivityIndicator,
} from "react-native-paper";

const { height } = Dimensions.get("screen");

class InvitePlayers extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      users: new Array(),
      nearby: new Array(),
      followingComplete: false,
      nearbyComplete: false,
      nearbySortedKeys: new Array(),
      friendsSortedKeys: new Array(),
    };
  }

  componentDidMount() {
    let nearby = new Object();
    const query = geo
      .query(firebase.firestore().collection("users"))
      .within(this.props.user.location, 10, "location");
    query.subscribe((nearby) =>
      this.setState({ nearby, nearbyComplete: true })
    );
  }

  onPress = (id, user) => {
    firebase
      .firestore()
      .collection("notifications")
      .add({
        type: "invite",
        game: {
          sport: this.props.game.sport,
          location: this.props.game.location,
        },
        from: this.props.user,
        to: user,
        time: moment().toDate(),
        expire: moment
          .unix(parseInt(this.props.game.startTime.time.seconds))
          .add(1, "h")
          .toDate(),
      });
  };

  onFindUsersPress = () => {
    this.props.setModalVisible(false);
    this.props.toSocialScreen();
  };

  render() {
    const colors = this.props.theme.colors;
    return (
      <TouchableWithoutFeedback
        onPress={Keyboard.dismiss}
        style={{ width: "100%" }}
      >
        <Block
          column
          center
          style={{ backgroundColor: colors.dBlue, width: "100%" }}
        >
          <Headline style={{color:colors.white,fontSize:20,marginBottom:8}}>Nearby Players</Headline>
          {this.state.nearbyComplete ? (
            Object.keys(this.state.nearby).length > 0 ? (
              <ScrollView style={styles.scrollview}>
                {this.state.nearby.map((user, key) => {
                  if (
                    this.props.user.friendsList.includes(user.id) ||
                    user.id == firebase.auth().currentUser.uid
                  ) {
                    return null;
                  } else {
                    let distance =
                      Math.round(user.hitMetadata.distance * 0.621371 * 10) /
                      10;
                    return (
                      <TouchableOpacity
                        onPress={() => this.onPress(user.id, user)}
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
                            <Text style={{ color: "#fff" }}>
                              @{user.username}
                            </Text>
                          </Block>
                          <Text style={{ color: "#fff" }}>{`${distance < 1 ? "<1" : distance} ${
                            distance > 1 ? "Miles Away" : "Mile Away"
                          }`}</Text>
                        </Block>
                      </TouchableOpacity>
                    );
                  }
                })}
                <TouchableOpacity
                  onPress={onShare}
                  style={{ width: "100%", marginBottom: 10 }}
                >
                  <Block
                    center
                    middle
                    style={{
                      borderColor: colors.orange,
                      borderWidth: 1,
                      borderRadius: 8,
                      padding: 10,
                      width: "100%",
                    }}
                  >
                    <Text style={{ color: "#fff" }}>Invite More Friends</Text>
                  </Block>
                </TouchableOpacity>
              </ScrollView>
            ) : (
              <Block
                center
                style={{
                  borderColor: colors.white,
                  borderWidth: 1,
                  borderRadius: 8,
                  width: "100%",
                  padding: 16,
                }}
              >
                <Headline
                  style={{
                    color: colors.grey,
                    fontSize: 20,
                    textAlign: "center",
                    marginBottom: 8,
                  }}
                >
                  No nearby players.
                </Headline>
                <Button
                  mode='contained'
                  dark={true}
                  onPress={onShare}
                  theme={{
                    colors: { primary: colors.orange },
                    fonts: { medium: this.props.theme.fonts.regular },
                  }}
                >
                  Invite Friends
                </Button>
              </Block>
            )
          ) : (
            <ActivityIndicator
              style={{ opacity: 1 }}
              animating={true}
              color={this.props.theme.colors.orange}
              size={"small"}
            />
          )}
        </Block>
      </TouchableWithoutFeedback>
    );
  }
}

const styles = StyleSheet.create({
  scrollview: {
    width: "100%",
    maxHeight: height * 0.5,
    borderRadius: 8,
    padding: 4,
    paddingBottom:0
  },
});

export default withTheme(InvitePlayers);
