import React from "react";
import { TouchableOpacity } from "react-native";
import { Block } from "galio-framework";
import { Text, withTheme, Button } from "react-native-paper";
import firebase from "firebase";
import "firebase/firestore";

class GroupInviteNotification extends React.Component {
  constructor() {
    super();
    this.state = {
      accepted: false,
    };
  }

  componentDidMount() {
    console.log('working');
    if (this.props.group.users.includes(firebase.auth().currentUser.uid)) {
      this.props.accept();
    }
  }

  accept = () => {
    Promise.all(
      this.props.group.users
        .map((user) => {
          return firebase
            .firestore()
            .collection("users")
            .doc(user)
            .collection("social")
            .add({
              to: user,
              from: this.props.currentUser,
              group: this.props.group,
              type: "groupMember",
              time: new Date(),
            });
        })
        .concat([
          this.setState({
            accepted: true,
          }),
          firebase
            .firestore()
            .collection("users")
            .doc(firebase.auth().currentUser.uid)
            .update({
              groups: firebase.firestore.FieldValue.arrayUnion(
                this.props.group.id
              ),
            }),
          firebase
            .firestore()
            .collection("groups")
            .doc(this.props.group.id)
            .update({
              users: firebase.firestore.FieldValue.arrayUnion(
                firebase.auth().currentUser.uid
              ),
              invites: firebase.firestore.FieldValue.arrayRemove(
                firebase.auth().currentUser.uid
              ),
            }),
          firebase
            .firestore()
            .collection("groups")
            .doc(this.props.group.id)
            .collection("messages")
            .add({
              content: `${this.props.currentUser.name} (@${this.props.currentUser.username}) joined the group.`,
              created: new Date(),
              type: "admin",
            }),
          this.props.accept(),
        ])
    );
  };

  decline = () => {
    Promise.all([
      firebase
        .firestore()
        .collection("users")
        .doc(firebase.auth().currentUser.uid)
        .collection("groupInvitations")
        .doc(this.props.invitationId)
        .delete(),
      firebase
        .firestore()
        .collection("groups")
        .doc(this.props.group.id)
        .update({
          invites: firebase.firestore.FieldValue.arrayRemove(
            firebase.auth().currentUser.uid
          ),
        }),
    ]);
  };

  render() {
    let colors = this.props.theme.colors;
    return (
      <TouchableOpacity
        onPress={() => {
          this.props.navigate("GroupInfo", { groupId: this.props.group.id });
        }}
      >
        <Block
          style={{
            borderWidth: 1,
            borderColor: colors.grey,
            borderRadius: 8,
            paddingVertical: 12,
            paddingHorizontal: 10,
            marginBottom: 8,
          }}
        >
          <Block row middle style={{ justifyContent: "space-between" }}>
            <Block>
              <Text style={{ color: colors.white }}>
                {this.props.group.title}
              </Text>
              <Text style={{ color: colors.grey }}>Group Invite</Text>
            </Block>
            <Block row>
              {this.state.accepted ? (
                <Button
                  mode="text"
                  dark={false}
                  onPress={() => {}}
                  theme={{
                    colors: { primary: colors.white },
                    fonts: { medium: this.props.theme.fonts.regular },
                  }}
                  uppercase={false}
                  compact={true}
                >
                  Joined
                </Button>
              ) : (
                <>
                  <Button
                    mode="contained"
                    dark={true}
                    onPress={this.accept}
                    theme={{
                      colors: { primary: colors.orange },
                      fonts: { medium: this.props.theme.fonts.regular },
                    }}
                    uppercase={false}
                    compact={true}
                  >
                    Accept
                  </Button>
                  <Button
                    mode="text"
                    dark={false}
                    onPress={this.decline}
                    theme={{
                      colors: { primary: colors.white },
                      fonts: { medium: this.props.theme.fonts.regular },
                    }}
                    uppercase={false}
                    compact={true}
                  >
                    Decline
                  </Button>
                </>
              )}
            </Block>
          </Block>
        </Block>
      </TouchableOpacity>
    );
  }
}

export default withTheme(GroupInviteNotification);
