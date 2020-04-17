import React from "react";
import { SafeAreaView, ScrollView, TouchableOpacity } from "react-native";
import { withTheme, Avatar } from "react-native-paper";
import { Block } from "galio-framework";
import { Text, Button } from "react-native-paper";
import firebase from "firebase";
import firestore from "firebase/firestore";
import ProfilePic from "../../components/Utility/ProfilePic";

class PendingRequests extends React.Component {
  constructor() {
    super();
    this.state = {
      requests: new Array(),
      group: {},
    };
  }

  componentDidMount() {
    firebase
      .firestore()
      .collection("groups")
      .doc(this.props.route.params.groupId)
      .onSnapshot((group) => {
        Promise.all(
          group.data().requests.map((request) => {
            return firebase
              .firestore()
              .collection("users")
              .doc(request)
              .get()
              .then((request) => {
                return request.data();
              });
          })
        ).then((requests) => {
          this.setState({ requests, group: group.data() });
        });
      });
  }

  accept = (request) => {
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
              from: request,
              group: this.state.group,
              time: new Date(),
            });
        })
        .concat([
          firebase
            .firestore()
            .collection("groups")
            .doc(this.props.route.params.groupId)
            .update({
              requests: firebase.firestore.FieldValue.arrayRemove(request.id),
              users: firebase.firestore.FieldValue.arrayUnion(request.id),
            }),
          firebase
            .firestore()
            .collection("users")
            .doc(request.id)
            .update({
              groups: firebase.firestore.FieldValue.arrayUnion(
                this.props.route.params.groupId
              ),
            }),
          firebase
            .firestore()
            .collection("groups")
            .doc(this.props.route.params.groupId)
            .collection("messages")
            .add({
              content: `${request.name} (@${request.username}) joined the group.`,
              created: new Date(),
              type: "admin",
            }),
        ])
    );
  };

  decline = (id) => {
    firebase
      .firestore()
      .collection("groups")
      .doc(this.props.route.params.groupId)
      .update({
        requests: firebase.firestore.FieldValue.arrayRemove(id),
      });
  };

  render() {
    const colors = this.props.theme.colors;
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.dBlue }}>
        <ScrollView flex style={{ padding: 16 }}>
          {this.state.requests.map((request, index) => {
            return (
              <TouchableOpacity
                onPress={() =>
                  this.props.navigation.navigate("UserProfile", {
                    userId: request.id,
                  })
                }
                style={{ marginBottom: 8 }}
              >
                <Block
                  key={index}
                  style={{
                    borderWidth: 1,
                    borderRadius: 8,
                    borderColor: colors.orange,
                    padding: 8,
                  }}
                  row
                  middle
                >
                    <ProfilePic
                      proPicUrl={request.proPicUrl}
                      size={35}
                    />
                  <Block style={{ marginLeft: 8, marginRight: "auto" }}>
                    <Text style={{ color: colors.white }}>
                      @{request.username}
                    </Text>
                    <Text style={{ color: colors.grey }}>{request.name}</Text>
                  </Block>
                  <Block row>
                    <Button
                      mode='contained'
                      dark={true}
                      onPress={() => this.accept(request)}
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
                      mode='text'
                      dark={false}
                      onPress={() => this.decline(request.id)}
                      theme={{
                        colors: { primary: colors.white },
                        fonts: { medium: this.props.theme.fonts.regular },
                      }}
                      uppercase={false}
                      compact={true}
                    >
                      Decline
                    </Button>
                  </Block>
                </Block>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </SafeAreaView>
    );
  }
}

export default withTheme(PendingRequests);
