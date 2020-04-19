import React from "react";
import { SafeAreaView, ScrollView } from "react-native";
import { withTheme } from "react-native-paper";
import { Block } from "galio-framework";
import firebase from "firebase";
import GroupInviteNotification from "../../components/Notifications/GroupInvitations/GroupInviteNotification";
import withAuthenticatedUser from "../../contexts/authenticatedUserContext/withAuthenticatedUser";

class GroupInvitations extends React.Component {
  constructor() {
    super();
    this.state = {
      invitations: new Array(),
      accepted: new Array(),
    };
  }

  componentDidMount() {
    let unsubscribe = firebase
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
        this.setState({ invitations });
      });
    this.unsubscribe = unsubscribe;
  }

  componentWillUnmount(){
    if(this.unsubscribe){
      this.unsubscribe();
    }
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
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.dBlue }}>
        <ScrollView flex style={{ padding: 16 }}>
          {this.state.invitations.map((invitation, index) => {
            return (
              <GroupInviteNotification
                group={invitation.group}
                currentUser={this.props._currentUserProfile}
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
  }
}

export default withTheme(withAuthenticatedUser(GroupInvitations));
