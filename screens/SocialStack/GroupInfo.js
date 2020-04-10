import React from "react";
import {
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Dimensions,
} from "react-native";
import { withTheme, Text, Button, Portal, Modal } from "react-native-paper";
import { Block } from "galio-framework";

import firebase from "firebase";
import "firebase/firestore";
import GroupMember from "../../components/Groups/GroupMember";
import SportInfo from "../../components/Groups/SportInfo";

const { width, height } = Dimensions.get("screen");

class GroupInfo extends React.Component {
  constructor() {
    super();
    this.state = {
      group: {},
      pictures: {},
      complete: false,
      modalVisible: false,
      deleted: false,
    };
  }

  joinGroup = () => {
    Promise.all([
      firebase
        .firestore()
        .collection("groups")
        .doc(this.props.route.params.groupId)
        .update({
          users: firebase.firestore.FieldValue.arrayUnion(
            firebase.auth().currentUser.uid
          ),
        }),
      firebase
        .firestore()
        .collection("users")
        .doc(firebase.auth().currentUser.uid)
        .update({
          groups: firebase.firestore.FieldValue.arrayUnion(
            this.props.route.params.groupId
          ),
        }),
    ]);
  };

  requestGroup = () => {
    Promise.all([
      firebase
        .firestore()
        .collection("groups")
        .doc(this.props.route.params.groupId)
        .update({
          requests: firebase.firestore.FieldValue.arrayUnion(
            firebase.auth().currentUser.uid
          ),
        }),
    ]);
  };

  leaveGroup = () => {
    Promise.all([
      firebase
        .firestore()
        .collection("groups")
        .doc(this.props.route.params.groupId)
        .update({
          users: firebase.firestore.FieldValue.arrayRemove(
            firebase.auth().currentUser.uid
          ),
        }),
      firebase
        .firestore()
        .collection("users")
        .doc(firebase.auth().currentUser.uid)
        .update({
          groups: firebase.firestore.FieldValue.arrayRemove(
            this.props.route.params.groupId
          ),
        }),
    ]).then(() => {
      this.props.navigation.popToTop();
    });
  };

  deleteGroup = () => {
    Promise.all([
      this.state.group.users.map(user => {
        return firebase
          .firestore()
          .collection("users")
          .doc(user)
          .update({
            groups: firebase.firestore.FieldValue.arrayRemove(
              this.props.route.params.groupId
            ),
          });
      }),
    ]).then(() => {
      this.setState({ deleted: true }, () => {
        firebase
          .firestore()
          .collection("groups")
          .doc(this.props.route.params.groupId)
          .delete();
        this.props.navigation.popToTop();
      });
    });
  };

  componentDidMount() {
    Promise.all([
      firebase
        .firestore()
        .collection("groups")
        .doc(this.props.route.params.groupId)
        .onSnapshot(group => {
          if (group.exists) {
            this.setState({ group: group.data() }, () => {
              this.props.navigation.setOptions({
                headerTitle: group.data().title,
              });
              if (
                group.data().users.includes(firebase.auth().currentUser.uid)
              ) {
                this.props.navigation.setOptions({
                  headerRight: () => (
                    <Button
                      mode='text'
                      color={this.props.theme.colors.orange}
                      onPress={this.leaveGroup}
                      compact={true}
                      uppercase={false}
                    >
                      Leave
                    </Button>
                  ),
                });
              } else {
                if (group.data().private == true) {
                  this.props.navigation.setOptions({
                    headerRight: () => (
                      <Button
                        mode='text'
                        color={this.props.theme.colors.orange}
                        onPress={this.requestGroup}
                        compact={true}
                        uppercase={false}
                        disabled={this.state.group.requests.includes(firebase.auth().currentUser.uid)}
                      >
                        Request
                      </Button>
                    ),
                  });
                } else {
                  this.props.navigation.setOptions({
                    headerRight: () => (
                      <Button
                        mode='text'
                        color={this.props.theme.colors.orange}
                        onPress={this.joinGroup}
                        compact={true}
                        uppercase={false}
                      >
                        Join
                      </Button>
                    ),
                  });
                }
              }
              let pictures = {};
              Promise.all(
                group.data().users.map(user => {
                  return firebase
                    .storage()
                    .ref("profilePictures/" + user)
                    .getDownloadURL()
                    .then(url => {
                      pictures[user] = url;
                    })
                    .catch(err => {
                      pictures[user] = null;
                    });
                })
              ).then(() => {
                this.setState({ pictures });
              });
            });
          }
        }),
      firebase
        .firestore()
        .collection("users")
        .doc(firebase.auth().currentUser.uid)
        .onSnapshot(user => {
          this.setState({ user: user.data() });
        }),
    ]).then(() => {
      this.setState({ complete: true });
    });
  }

  navToUserProfile = id => {
    this.props.navigation.push("UserProfile", { userId: id });
  };

  render() {
    const colors = this.props.theme.colors;
    if (
      !this.state.deleted &&
      this.state.complete &&
      Object.keys(this.state.group).length > 0
    ) {
      return (
        <>
          <Portal>
            <Modal
              contentContainerStyle={[
                {
                  backgroundColor: this.props.theme.colors.dBlue,
                  borderColor: colors.orange,
                },
                styles.modalStyle,
              ]}
              visible={this.state.modalVisible}
              onDismiss={() => {
                this.setState({ modalVisible: false });
              }}
            >
              <Block center middle>
                <Text
                  style={{
                    color: colors.white,
                    textAlign: "center",
                    marginBottom: 8,
                  }}
                >
                  Are you sure you want to delete this group?
                </Text>
                <Button
                  mode='contained'
                  color={colors.orange}
                  onPress={this.deleteGroup}
                  dark={true}
                  compact={true}
                  uppercase={false}
                  labelStyle={{ fontSize: 12 }}
                >
                  Delete Group
                </Button>
              </Block>
            </Modal>
          </Portal>
          <SafeAreaView style={{ flex: 1, backgroundColor: colors.dBlue }}>
            <Block center middle>
              <Text style={{ color: colors.white, fontSize: 12 }}>
                {this.state.group.description}
              </Text>
            </Block>
            <ScrollView contentContainerStyle={{ padding: 16 }}>
              <Block
                row
                style={{ justifyContent: "space-between", marginBottom: 8 }}
              >
                <Text style={{ color: "white" }}>Members</Text>
                <TouchableOpacity onPress={() => this.props.navigation.navigate('GroupInvite', {groupId:this.state.group.id})}>
                  <Text style={{ color: colors.orange }}>Invite Users</Text>
                </TouchableOpacity>
              </Block>
              <Block>
                {this.state.group.users.map((user, index) => {
                  return (
                    <GroupMember
                      user={user}
                      picture={this.state.pictures[user]}
                      key={index}
                      navToUserProfile={this.navToUserProfile}
                      group={this.state.group}
                    />
                  );
                })}
              </Block>
              <Block
                row
                style={{ justifyContent: "space-between", marginBottom: 8 }}
              >
                <Text style={{ color: "white" }}>Sports</Text>
                <Text style={{ color: colors.white }}>Games Played</Text>
              </Block>
              <Block>
                {Object.keys(this.state.group.sports).map((sport, index) => {
                  return (
                    <SportInfo
                      sport={sport}
                      gamesPlayed={this.state.group.sports[sport]}
                      key={index}
                    />
                  );
                })}
              </Block>
              <Block center middle>
                {this.state.group.users.includes(
                  firebase.auth().currentUser.uid
                ) ? (
                  <>
                    {this.state.group.admins.includes(
                      firebase.auth().currentUser.uid
                    ) ? (
                      <Button
                        mode='text'
                        color={colors.orange}
                        onPress={() =>
                          this.props.navigation.navigate("EditGroup", {
                            group: this.state.group,
                          })
                        }
                        compact={true}
                        uppercase={false}
                      >
                        Edit Group
                      </Button>
                    ) : null}
                    <Button
                      mode='text'
                      color={colors.orange}
                      onPress={this.leaveGroup}
                      compact={true}
                      uppercase={false}
                    >
                      Leave Group
                    </Button>
                    {this.state.group.owner ==
                    firebase.auth().currentUser.uid ? (
                      <Button
                        mode='text'
                        color={colors.orange}
                        onPress={() => this.setState({ modalVisible: true })}
                        compact={true}
                        uppercase={false}
                      >
                        Delete Group
                      </Button>
                    ) : null}
                  </>
                ) : this.state.group.private ? (
                  <Button
                    mode='text'
                    color={this.props.theme.colors.orange}
                    onPress={this.requestGroup}
                    compact={true}
                    uppercase={false}
                    disabled={this.state.group.requests.includes(firebase.auth().currentUser.uid)}
                  >
                    Request
                  </Button>
                ) : (
                  <Button
                    mode='text'
                    color={colors.orange}
                    onPress={this.joinGroup}
                    compact={true}
                    uppercase={false}
                  >
                    Join Group
                  </Button>
                )}
              </Block>
            </ScrollView>
          </SafeAreaView>
        </>
      );
    } else {
      return <Block flex style={{ backgroundColor: colors.dBlue }}></Block>;
    }
  }
}

const styles = StyleSheet.create({
  modalStyle: {
    marginLeft: "auto",
    marginRight: "auto",
    borderRadius: 8,
    borderWidth: 2,
    width: width - 32,
    padding: 16,
  },
});

export default withTheme(GroupInfo);
