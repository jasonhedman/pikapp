import React from "react";
import {
  StyleSheet,
  ScrollView,
  View,
  Animated,
  Keyboard,
  Easing,
  KeyboardAvoidingView,
} from "react-native";
import { Block } from "galio-framework";
import HeaderBlock from "../../components/Utility/HeaderBlock";
import Message from "../../components/Messaging/Message";
import MessageInput from "../../components/Messaging/MessageInput";
import { withTheme, Headline } from "react-native-paper";
import firebase from "firebase";
import firestore from "firebase/firestore";
import { SafeAreaView } from "react-navigation";
import { HeaderHeightContext } from "@react-navigation/stack";
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

  onSend = prop => {
    console.log(prop);
  };

  render() {
    const colors = this.props.theme.colors;
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.dBlue }}>
        <KeyboardAvoidingView behavior='padding' style={{ flex: 1 }}>
          <HeaderHeightContext.Consumer>
            {headerHeight => (
              <Block
                flex
                style={{ justifyContent: "flex-end", paddingTop: headerHeight }}
              >
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
                        picture={
                          this.props.route.params.pictures[message.senderId]
                        }
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
            )}
          </HeaderHeightContext.Consumer>
        </KeyboardAvoidingView>
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
