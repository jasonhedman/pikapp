import React from "react";
import { ScrollView } from "react-native";
import { withTheme } from "react-native-paper";
import { Block } from "galio-framework";
import firebase from "firebase";
import GroupInput from "../../components/Groups/GroupInput";
import UserMessage from "../../components/Groups/UserMessage";
import AdminMessage from "../../components/Groups/AdminMessage";
import PendingRequestsPreview from "../../components/Groups/PendingRequestsPreview";

class GroupScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      group: {},
      messages: new Array(),
      user: {},
    };
  }

  componentDidMount() {
    Promise.all([
      firebase
        .firestore()
        .collection("groups")
        .doc(this.props.route.params.groupId)
        .onSnapshot((group) => {
          this.props.navigation.setOptions({
            headerTitle: group.data().title,
          });
          this.setState({ group: group.data() });
        }),
      firebase
        .firestore()
        .collection("groups")
        .doc(this.props.route.params.groupId)
        .collection("messages")
        .orderBy("created", "desc")
        .limit(50)
        .onSnapshot((allMessages) => {
          let messages = [];
          allMessages.forEach((message) => {
            messages.push(message.data());
          });
          this.setState({ messages });
        }),
      firebase
        .firestore()
        .collection("users")
        .doc(firebase.auth().currentUser.uid)
        .get()
        .then((user) => {
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
        <Block
          style={{
            flex: 1,
            backgroundColor: colors.dBlue,
          }}
        >
          {Object.keys(this.state.group).length > 0 &&
          (this.state.group.owner == firebase.auth().currentUser.uid ||
            this.state.group.admins.includes(firebase.auth().currentUser.uid) ||
            this.state.group.coOwners.includes(
              firebase.auth().currentUser.uid
            )) &&
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
        </Block>
      );
    } else {
      return <Block flex style={{ backgroundColor: colors.dBlue }}></Block>;
    }
  }
}

export default withTheme(GroupScreen);
