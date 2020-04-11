import React from "react";
import { SafeAreaView, ScrollView, KeyboardAvoidingView } from "react-native";
import { withTheme } from "react-native-paper";
import { Block } from "galio-framework";
import firebase from "firebase";
import firestore from "firebase/firestore";
import { HeaderHeightContext } from "@react-navigation/stack";
import HeaderBlock from "../../components/Utility/HeaderBlock";
import GroupInput from "../../components/Groups/GroupInput";
import UserMessage from "../../components/Groups/UserMessage";
import AdminMessage from "../../components/Groups/AdminMessage";
import { Header } from "react-navigation-stack";
import PendingRequestsPreview from "../../components/Groups/PendingRequestsPreview";

class GroupScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      group: {},
      messages: new Array(),
      user: {},
      pictures: {},
    };
  }

  componentDidMount() {
    Promise.all([
      firebase
        .firestore()
        .collection("groups")
        .doc(this.props.route.params.groupId)
        .onSnapshot(group => {
          this.props.navigation.setOptions({
            headerTitle: group.data().title,
          });
          this.setState({ group: group.data() }, () => {
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
        }),
      firebase
        .firestore()
        .collection("groups")
        .doc(this.props.route.params.groupId)
        .collection("messages")
        .orderBy("created", "desc")
        .limit(50)
        .onSnapshot(allMessages => {
          let messages = [];
          allMessages.forEach(message => {
            messages.push(message.data());
          });
          this.setState({ messages });
        }),
      firebase
        .firestore()
        .collection("users")
        .doc(firebase.auth().currentUser.uid)
        .get()
        .then(user => {
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
        <HeaderHeightContext.Consumer>
          {headerHeight => (
            <Block
              style={{
                flex: 1,
                backgroundColor: colors.dBlue,
                paddingTop: headerHeight,
              }}
            >
              <KeyboardAvoidingView behavior='padding' style={{ flex: 1 }}>
                {Object.keys(this.state.group).length > 0 &&
                this.state.group.admins.includes(
                  firebase.auth().currentUser.uid
                ) &&
                this.state.group.requests.length > 0 ? (
                  <PendingRequestsPreview
                    requests={this.state.group.requests}
                    navigate={this.props.navigation.navigate}
                    groupId={this.state.group.id}
                  />
                ) : null}
                <ScrollView
                  contentContainerStyle={{
                    marginTop: "auto",
                    flexDirection: "column-reverse",
                    flex: 1,
                    paddingHorizontal: 8,
                  }}
                >
                  {this.state.messages.map((message, index) => {
                    if (message.type == "message") {
                      return (
                        <UserMessage
                          key={index}
                          message={message}
                          messageAbove={this.state.messages[index + 1]}
                          messageBelow={this.state.messages[index - 1]}
                          picture={this.state.pictures[message.senderId]}
                        />
                      );
                    } else if (message.type == "admin") {
                      return <AdminMessage key={index} message={message} />;
                    }
                  })}
                </ScrollView>
                <GroupInput
                  collection='groups'
                  doc={this.props.route.params.groupId}
                  user={this.state.user}
                />
              </KeyboardAvoidingView>
            </Block>
          )}
        </HeaderHeightContext.Consumer>
      );
    } else {
      return <Block flex style={{ backgroundColor: colors.dBlue }}></Block>;
    }
  }
}

export default withTheme(GroupScreen);
