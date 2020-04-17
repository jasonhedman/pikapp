import React from "react";
import {
  StyleSheet,
  ScrollView,
} from "react-native";
import { Block } from "galio-framework";
import Message from "../../components/Messaging/Message";
import MessageInput from "../../components/Messaging/MessageInput";
import { withTheme } from "react-native-paper";
import firebase from "firebase";
import { SafeAreaView } from "react-navigation";
import { Header } from "react-navigation-stack";
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
    Promise.all([
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

  onSend = (prop) => {
    console.log(prop);
  };

  render() {
    const colors = this.props.theme.colors;
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.dBlue }}>
        <Block flex style={{ justifyContent: "flex-end" }}>
          <ScrollView
            contentContainerStyle={{
              marginTop: "auto",
              flexDirection: "column-reverse",
              flex: 1,
              paddingHorizontal: 16,
            }}
          >
            {this.state.messages.map((message, index) => {
              return (
                <Message
                  key={index}
                  message={message}
                  messageAbove={this.state.messages[index + 1]}
                  messageBelow={this.state.messages[index - 1]}
                  navigation={this.props.navigation}
                />
              );
            })}
          </ScrollView>
          <MessageInput
            collection={this.props.route.params.collection}
            doc={this.props.route.params.doc}
            user={this.state.user}
          />
        </Block>
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    padding: 16,
    justifyContent: "flex-end",
    // backgroundColor:'blue'
  },
});

export default withTheme(MessageBoard);
