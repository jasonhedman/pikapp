import React from "react";
import * as firebase from "firebase";
import firestore from "firebase/firestore";
import { withTheme, Button } from "react-native-paper";
import { Block } from "galio-framework";

class FollowButton extends React.Component {
  constructor(props) {
    super(props);
  }

  follow = () => {
    Promise.all([
      firebase
        .firestore()
        .collection("users")
        .doc(firebase.auth().currentUser.uid)
        .update({
          friendsList: firebase.firestore.FieldValue.arrayUnion(
            this.props.user.id
          ),
        }),
      firebase
        .firestore()
        .collection("users")
        .doc(this.props.user.id)
        .update({
          followers: firebase.firestore.FieldValue.arrayUnion(
            firebase.auth().currentUser.uid
          ),
        }),
      firebase
        .firestore()
        .collection("notifications")
        .add({
          type: "follower",
          from: this.props.currentUser,
          to: this.props.user,
          time: new Date(),
        }),
      firebase
        .firestore()
        .collection("users")
        .doc(this.props.user.id)
        .collection("social")
        .add({
          type: "follower",
          from: this.props.currentUser,
          to: this.props.user,
          time: new Date(),
        }),
    ]);
  };

  unfollow = () => {
    firebase
      .firestore()
      .collection("users")
      .doc(firebase.auth().currentUser.uid)
      .update({
        friendsList: firebase.firestore.FieldValue.arrayRemove(
          this.props.user.id
        ),
      });
    firebase
      .firestore()
      .collection("users")
      .doc(this.props.user.id)
      .update({
        followers: firebase.firestore.FieldValue.arrayRemove(
          firebase.auth().currentUser.uid
        ),
      });
  };

  render() {
    let colors = this.props.theme.colors;
    if (this.props.user.followers.includes(firebase.auth().currentUser.uid)) {
      return (
        <Block
          style={{
            borderWidth: 0.5,
            borderRadius: 8,
            borderColor: colors.white,
          }}
        >
          <Button
            mode='text'
            dark={true}
            compact={true}
            color={colors.white}
            labelStyle={{ fontSize: 12 }}
            onPress={this.unfollow}
            uppercase={false}
          >
            Following
          </Button>
        </Block>
      );
    } else {
      return (
        <Button
          mode='contained'
          dark={true}
          compact={true}
          color={colors.orange}
          labelStyle={{ fontSize: 12 }}
          onPress={this.follow}
          uppercase={false}
        >
          Follow
        </Button>
      );
    }
  }
}

export default withTheme(FollowButton);
