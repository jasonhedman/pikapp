import React from "react";
import { SafeAreaView, ScrollView, TouchableOpacity } from "react-native";
import { withTheme, Avatar } from "react-native-paper";
import { Block } from "galio-framework";
import { Text, Button } from "react-native-paper";
import firebase from "firebase";
import firestore from "firebase/firestore";
import ProfilePic from "../../components/Utility/ProfilePic";
import GroupInviteNotification from "../../components/Notifications/GroupInvitations/GroupInviteNotification";
import Follower from "../../components/Notifications/Social/Follower";
import GroupMember from "../../components/Notifications/Social/GroupMember";

class GroupInvitations extends React.Component {
  constructor() {
    super();
    this.state = {
      invitations: new Array(),
      accepted: new Array(),
    };
  }

  componentDidMount() {
    Promise.all([
      firebase
        .firestore()
        .collection("users")
        .doc(firebase.auth().currentUser.uid)
        .collection("groupInvitations")
        .orderBy("time", "desc")
        .onSnapshot((results) => {
          let invitations = [];
          results.forEach((result, index) => {
            let resultData = result.data();
            resultData.id = result.id;
            invitations.push(resultData);
          });
          this.setState({ invitations }, () => {
            Promise.all(
              this.state.invitations.map((invitation, index) => {
                firebase
                  .firestore()
                  .collection("groups")
                  .doc(invitation.group.id)
                  .onSnapshot((group) => {
                    let invitations = this.state.invitations;
                    invitations[index].group = group.data();
                    this.setState({invitations});
                  });
              })
            );
          });
        }),
      firebase
        .firestore()
        .collection("users")
        .doc(firebase.auth().currentUser.uid)
        .onSnapshot((user) => {
          this.setState({ user: user.data() });
        }),
    ]).then(() => {
      this.setState({ complete: true });
    });
  }

  accept = (invitation) => {
    this.setState({ accepted: this.state.accepted.concat([invitation.id]) });
  };

  componentWillUnmount() {
    Promise.all(
      this.state.accepted.map((invitation) => {
        firebase
          .firestore()
          .collection("users")
          .doc(firebase.auth().currentUser.uid)
          .collection("groupInvitations")
          .doc(invitation)
          .delete();
      })
    );
  }

  render() {
    const colors = this.props.theme.colors;
    if (this.state.complete) {
      return (
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.dBlue }}>
          <ScrollView flex style={{ padding: 16 }}>
            {this.state.invitations.map((invitation, index) => {
              return (
                <GroupInviteNotification
                  group={invitation.group}
                  currentUser={this.state.user}
                  invitationId={invitation.id}
                  accept={() => this.accept(invitation)}
                  key={index}
                  navigate={this.props.navigation.navigate}
                />
              );
            })}
          </ScrollView>
        </SafeAreaView>
      );
    } else {
      return <Block flex style={{ backgroundColor: colors.dBlue }} />;
    }
  }
}

export default withTheme(GroupInvitations);
