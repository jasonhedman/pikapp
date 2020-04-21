import React from "react";
import { ScrollView, FlatList } from "react-native";
import { withTheme } from "react-native-paper";
import { Block } from "galio-framework";
import firebase from "firebase";
import GroupInput from "../../components/Groups/GroupInput";
import UserMessage from "../../components/Groups/UserMessage";
import AdminMessage from "../../components/Groups/AdminMessage";
import PendingRequestsPreview from "../../components/Groups/PendingRequestsPreview";
import withAuthenticatedUser from "../../contexts/authenticatedUserContext/withAuthenticatedUser";

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
    const groupUnsubscribe = firebase
      .firestore()
      .collection("groups")
      .doc(this.props.route.params.groupId)
      .onSnapshot((group) => {
        this.props.navigation.setOptions({
          headerTitle: group.data().title,
        });
        this.setState({ group: group.data(), complete: true });
      });
    const messagesUnsubscribe = firebase
      .firestore()
      .collection("groups")
      .doc(this.props.route.params.groupId)
      .collection("messages")
      .orderBy("created", "desc")
      .limit(50)
      .onSnapshot((allMessages) => {
        let messages = [];
        allMessages.forEach((message) => {
          let messageData = message.data();
          messageData.id = message.id;
          messages.push(messageData);
        });
        this.setState({ messages });
      });
    this.unsubscribe = [groupUnsubscribe, messagesUnsubscribe];
  }

  componentWillUnmount() {
    if (this.unsubscribe) {
      this.unsubscribe.forEach((func) => {
        func();
      });
    }
  }

  render() {
    const colors = this.props.theme.colors;
    if (this.state.complete) {
      return (
        <Block
          style={{
            flex: 1,
            backgroundColor: colors.dBlue,
            paddingHorizontal: 8,
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
              group={this.state.group}
            />
          ) : null}
          <FlatList
            data={this.state.messages}
            keyExtractor={(message) => message.id}
            renderItem={({ item, index }) => {
              if (item.type == "message") {
                return (
                  <UserMessage
                    message={item}
                    messageAbove={this.state.messages[index + 1]}
                    messageBelow={this.state.messages[index - 1]}
                  />
                );
              } else if (item.type == "admin") {
                return <AdminMessage message={item} />;
              }
            }}
            inverted={true}
          />
          <GroupInput
            collection='groups'
            doc={this.props.route.params.groupId}
            user={this.props._currentUserProfile}
          />
        </Block>
      );
    } else {
      return <Block flex style={{ backgroundColor: colors.dBlue }}></Block>;
    }
  }
}

export default withTheme(withAuthenticatedUser(GroupScreen));
