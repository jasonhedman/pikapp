import React from "react";
import { TouchableOpacity } from "react-native";
import { Block } from "galio-framework";
import { withTheme, Text, Avatar, Button } from "react-native-paper";

import firebase from "firebase";
import moment from "moment";

import basketball from "../../../assets/images/Basketball.png";
import soccer from "../../../assets/images/Soccer.png";
import spikeball from "../../../assets/images/Spikeball.png";
import volleyball from "../../../assets/images/Volleyball.png";
import football from "../../../assets/images/Football.png";
import withAuthenticatedUser from "../../../contexts/authenticatedUserContext/withAuthenticatedUser";

const sports = {
  basketball: basketball,
  soccer: soccer,
  spikeball: spikeball,
  volleyball: volleyball,
  football: football,
};

class GroupResult extends React.Component {
  constructor(props) {
    super(props);
    console.log(this.props.group)
    this.state = {
      mostRecent: {},
      complete: false,
      sports: Object.keys(this.props.group.sports).filter(
        (sport) => this.props.group.sports[sport] > 0
      ),
      member: this.props.group.users.includes(firebase.auth().currentUser.uid),
      group: this.props.group,
      groupUsers: this.props.group.users.length,
    };
  }

  join = () => {
    Promise.all(
      this.state.group.users
        .map((user) => {
          firebase
            .firestore()
            .collection("users")
            .doc(user)
            .collection("social")
            .add({
              type: "groupMember",
              from: this.props._currentUserProfile,
              group: this.state.group,
              time: new Date(),
            });
        })
        .concat([
          firebase
            .firestore()
            .collection("groups")
            .doc(this.state.group.id)
            .update({
              users: firebase.firestore.FieldValue.arrayUnion(
                firebase.auth().currentUser.uid
              ),
              invites: firebase.firestore.FieldValue.arrayRemove(
                firebase.auth().currentUser.uid
              ),
              updated: new Date(),
            }),
          firebase
            .firestore()
            .collection("users")
            .doc(firebase.auth().currentUser.uid)
            .update({
              groups: firebase.firestore.FieldValue.arrayUnion(
                this.state.group.id
              ),
            }),
          firebase
            .firestore()
            .collection("groups")
            .doc(this.state.group.id)
            .collection("messages")
            .add({
              content: `${this.props._currentUserProfile.name} (@${this.props._currentUserProfile.username}) joined the group.`,
              created: new Date(),
              type: "admin",
            }),
          this.setState({
            member: true,
            groupUsers: this.state.groupUsers + 1,
          }),
        ])
    );
  };

  request = () => {
    Promise.all([
      firebase
        .firestore()
        .collection("groups")
        .doc(this.state.group.id)
        .update({
          requests: firebase.firestore.FieldValue.arrayUnion(
            firebase.auth().currentUser.uid
          ),
        }),
      this.setState({
        action: true,
      }),
    ]);
  };

  removeRequest = () => {
    Promise.all([
      firebase
        .firestore()
        .collection("groups")
        .doc(this.state.group.id)
        .update({
          requests: firebase.firestore.FieldValue.arrayRemove(
            firebase.auth().currentUser.uid
          ),
        }),
      this.setState({
        action: false,
      }),
    ]);
  };

  leave = () => {
    Promise.all([
      firebase
        .firestore()
        .collection("groups")
        .doc(this.state.group.id)
        .update({
          users: firebase.firestore.FieldValue.arrayRemove(
            firebase.auth().currentUser.uid
          ),
          coOwners: firebase.firestore.FieldValue.arrayRemove(
            firebase.auth().currentUser.uid
          ),
          admins: firebase.firestore.FieldValue.arrayRemove(
            firebase.auth().currentUser.uid
          ),
          updated: new Date(),
        }),
      firebase
        .firestore()
        .collection("users")
        .doc(firebase.auth().currentUser.uid)
        .update({
          groups: firebase.firestore.FieldValue.arrayRemove(
            this.state.group.id
          ),
        }),
      firebase
        .firestore()
        .collection("groups")
        .doc(this.state.group.id)
        .collection("messages")
        .add({
          content: `${this.props._currentUserProfile.name} (@${this.props._currentUserProfile.username}) left the group.`,
          created: new Date(),
          type: "admin",
        }),
      this.setState({
        member: false,
      }),
    ]);
  };

  render() {
    const colors = this.props.theme.colors;
    return (
      <TouchableOpacity
        onPress={() => {
          this.props.navigate("GroupInfo", {
            groupId: this.state.group.id,
            groupTitle: this.state.group.title,
          });
        }}
      >
        <Block
          row
          middle
          style={{
            borderWidth: 1,
            borderRadius: 8,
            borderColor: colors.orange,
            paddingVertical: 10,
            paddingHorizontal: 6,
            marginBottom: 8,
          }}
        >
          <Block center middle row style={{ marginRight: 6 }}>
            {this.state.sports.map((sport, index) => {
              if (this.state.group.sports[sport] > 0) {
                return (
                  <Block
                    key={index}
                    style={{
                      borderWidth: 1,
                      borderRadius: "50%",
                      borderColor: colors.orange,
                      padding: 6,
                      backgroundColor: colors.dBlue,
                      marginLeft: index == 0 ? 0 : -18,
                    }}
                  >
                    <Avatar.Image size={24} source={sports[sport]} />
                  </Block>
                );
              }
            })}
          </Block>
          <Block flex>
            <Text style={{}}>
              <Text
                style={{ color: colors.white, flex: -1 }}
                numberOfLines={1}
                ellipsizeMode='tail'
              >
                {this.state.group.title}
              </Text>
              <Text style={{ color: colors.grey, fontSize: 16 }}>{`  •  ${
                this.state.group.users.length
              } ${
                this.state.group.users.length == 1 ? "User" : "Users"
              }`}</Text>
            </Text>
            <Text style={{ color: colors.grey }}>
              {this.state.group.private ? "Private Group" : "Open Group"}
            </Text>
          </Block>
          <Block>
            {this.state.member ? (
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
                  onPress={this.leave}
                  uppercase={false}
                >
                  Joined
                </Button>
              </Block>
            ) : this.state.group.private ? (
              this.state.action ? (
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
                    onPress={this.removeRequest}
                    uppercase={false}
                  >
                    Requested
                  </Button>
                </Block>
              ) : (
                <Button
                  mode='contained'
                  dark={true}
                  compact={true}
                  color={colors.orange}
                  labelStyle={{ fontSize: 12 }}
                  onPress={this.request}
                  uppercase={false}
                >
                  Request
                </Button>
              )
            ) : (
              <Button
                mode='contained'
                dark={true}
                compact={true}
                color={colors.orange}
                labelStyle={{ fontSize: 12 }}
                onPress={this.join}
                uppercase={false}
              >
                Join
              </Button>
            )}
          </Block>
        </Block>
      </TouchableOpacity>
    );
  }
}

export default withTheme(withAuthenticatedUser(GroupResult));
