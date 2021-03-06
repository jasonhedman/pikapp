import React from "react";
import { StyleSheet, TouchableOpacity } from "react-native";
import { Block } from "galio-framework";
import * as firebase from "firebase";

const moment = require("moment");

import { withTheme, Text, Button, IconButton } from "react-native-paper";

import ProfilePic from "../Utility/ProfilePic";

class LobbyMember extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      user: {},
      complete: false,
    };
  }

  componentDidMount() {
    const unsubscribe = firebase
      .firestore()
      .collection("users")
      .doc(this.props.user.id)
      .onSnapshot((user) => {
        this.setState({ user: user.data(), complete: true });
      });
    this.unsubscribe = unsubscribe;
  }

  componentWillUnmount() {
    if (this.unsubscribe) {
      this.unsubscribe();
    }
  }

  onPress = () => {
    if (this.props.bringingEquipment) {
      firebase
        .firestore()
        .collection("games")
        .doc(this.props.gameId)
        .update({
          equipment: firebase.firestore.FieldValue.arrayRemove(
            this.props.user.id
          ),
        });
    } else {
      firebase
        .firestore()
        .collection("games")
        .doc(this.props.gameId)
        .update({
          equipment: firebase.firestore.FieldValue.arrayUnion(
            this.props.user.id
          ),
        });
    }
  };

  render() {
    let colors = this.props.theme.colors;
    if (this.state.complete) {
      return (
        <TouchableOpacity
          onPress={() => {
            if (this.state.user.id != firebase.auth().currentUser.uid) {
              this.props.navToUserProfile(this.state.user.id);
            }
          }}
        >
          <Block row middle center style={styles.container}>
            <ProfilePic
              size={40}
              addEnabled={false}
              proPicUrl={this.state.user.proPicUrl}
            />
            <Block flex column style={{ marginLeft: 12 }}>
              <Text style={{ color: "#FFF" }}>{this.state.user.name}</Text>
              <Text style={{ color: "#FFF" }}>@{this.state.user.username}</Text>
              <Text style={{ color: "#FFF" }}>{`Age: ${moment().diff(
                moment.unix(parseInt(this.state.user.dob.seconds)),
                "years",
                false
              )}`}</Text>
            </Block>
            {this.state.user.id == firebase.auth().currentUser.uid ? (
              <IconButton
                icon={this.props.bringingEquipment ? "basketball" : "cancel"}
                color={
                  this.props.bringingEquipment ? colors.orange : colors.white
                }
                animated={true}
                onPress={this.onPress}
                style={{ margin: 0 }}
              />
            ) : (
              <IconButton
                icon={this.props.bringingEquipment ? "basketball" : "cancel"}
                color={
                  this.props.bringingEquipment ? colors.orange : colors.white
                }
                animated={true}
                onPress={() => {}}
                style={{ margin: 0 }}
              />
            )}
          </Block>
        </TouchableOpacity>
      );
    } else {
      return null;
    }
  }
}

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderRadius: 8,
    borderColor: "#E68A54",
    padding: 8,
    marginBottom: 8,
    width: "100%",
  },
  containerAvailable: {
    borderWidth: 1,
    borderRadius: 8,
    borderColor: "#FFF",
    padding: 16,
    marginBottom: 8,
    width: "100%",
  },
});
export default withTheme(LobbyMember);
