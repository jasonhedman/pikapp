import React from "react";
import * as firebase from "firebase";
import { withTheme, Button } from "react-native-paper";
import { Block } from "galio-framework";
import withAuthenticatedUser from "../../contexts/authenticatedUserContext/withAuthenticatedUser";

class FollowButton extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      following: this.props.user.followers.includes(firebase.auth().currentUser.uid)
    }
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
      firebase.firestore().collection("notifications").add({
        type: "follower",
        from: this.props._currentUserProfile,
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
          from: this.props._currentUserProfile,
          to: this.props.user,
          time: new Date(),
        }),
      this.setState({
        following:true
      })
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
    this.setState({
      following:false
    })
  };

  render() {
    let colors = this.props.theme.colors;
    if (this.state.following) {
      return (
        <Block
          style={{
            borderWidth: 0.5,
            borderRadius: 8,
            borderColor: colors.white,
          }}
        >
          <Button
            mode="text"
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
          mode="contained"
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

export default withTheme(withAuthenticatedUser (FollowButton));
