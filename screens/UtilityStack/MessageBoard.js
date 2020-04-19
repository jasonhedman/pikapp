import React from "react";
import { StyleSheet, FlatList } from "react-native";
import { Block } from "galio-framework";
import Message from "../../components/Messaging/Message";
import MessageInput from "../../components/Messaging/MessageInput";
import { withTheme } from "react-native-paper";
import firebase from "firebase";
import { SafeAreaView } from "react-navigation";
import UserMessage from "../../components/Groups/UserMessage";
import AdminMessage from "../../components/Groups/AdminMessage";
import withAuthenticatedUser from "../../contexts/authenticatedUserContext/withAuthenticatedUser";
class MessageBoard extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      messages: new Array(),
      user: {},
      complete: false,
    };
  }

  componentDidMount() {
      firebase
        .firestore()
        .collection(this.props.route.params.collection)
        .doc(this.props.route.params.doc)
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
          this.setState({ messages, complete: true });
        })
      
  }

  onSend = (prop) => {
    console.log(prop);
  };

  render() {
    const colors = this.props.theme.colors;
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.dBlue }}>
        <Block flex style={{ justifyContent: "flex-end", paddingHorizontal:8}}>
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
          <MessageInput
            collection={this.props.route.params.collection}
            doc={this.props.route.params.doc}
            user={this.props._currentUserProfile}
          />
        </Block>
      </SafeAreaView>
    );
  }
}

export default withTheme(withAuthenticatedUser( MessageBoard));
