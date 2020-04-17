import React from "react";
import { SafeAreaView, ScrollView } from "react-native";
import { withTheme } from "react-native-paper";
import { Block } from "galio-framework";
import firebase from "firebase";
import Follower from "../../components/Notifications/Social/Follower";
import GroupMember from "../../components/Notifications/Social/GroupMember";

class SocialNotifications extends React.Component {
  constructor() {
    super();
    this.state = {
      notifications: new Array(),
      user: {},
      complete: false,
    };
  }

  componentDidMount() {
    Promise.all([
      firebase
        .firestore()
        .collection("users")
        .doc(firebase.auth().currentUser.uid)
        .collection("social")
        .orderBy("time", "desc")
        .onSnapshot((results) => {
          let notifications = [];
          results.forEach((result) => {
            let resultData = result.data();
            resultData.id = result.id;
            notifications.push(resultData);
          });
          this.setState({ notifications });
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

  render() {
    const colors = this.props.theme.colors;
    if (this.state.complete) {
      return (
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.dBlue }}>
          <ScrollView flex style={{ padding: 16 }}>
            {this.state.notifications.map((notification, index) => {
              if (notification.type == "follower") {
                return (
                  <Follower
                    user={notification.to}
                    currentUser={this.state}
                    follower={notification.from}
                    key={index}
                    navigate={this.props.navigation.navigate}
                  />
                );
              } else if (notification.type == "groupMember") {
                return (
                  <GroupMember
                    user={notification.from}
                    group={notification.group}
                    navigate={this.props.navigation.navigate}
                    key={index}
                  />
                );
              } else {
                return null;
              }
            })}
          </ScrollView>
        </SafeAreaView>
      );
    } else {
      return <Block flex style={{ backgroundColor: colors.dBlue }} />;
    }
  }
}

export default withTheme(SocialNotifications);
