import React from "react";
import {
  StyleSheet,
  TouchableWithoutFeedback,
  Keyboard,
  SafeAreaView,
} from "react-native";
import { Block } from "galio-framework";
import { withTheme, Switch, Text, Chip } from "react-native-paper";
import ButtonBlock from "../../components/Utility/ButtonBlock";
import "firebase/firestore";
import InputBlock from "../../components/Utility/InputBlock";
import firebase from "firebase";

class EditGroup extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      title: this.props.route.params.group.title,
      description: this.props.route.params.group.description,
      private: this.props.route.params.group.private,
    };
  }

  onTitleChange = (title) => {
    this.setState({ title });
  };

  onDescriptionChange = (description) => {
    this.setState({ description });
  };

  update = () => {
    if (this.state.private == false) {
      Promise.all(
        this.props.route.params.group.requests.map((request, index) => {
          return Promise.all([
            firebase
              .firestore()
              .collection("users")
              .doc(request)
              .update({
                groups: firebase.firestore.FieldValue.arrayUnion(
                  this.props.route.params.group.id
                ),
              }),
            firebase
              .firestore()
              .collection("groups")
              .doc(this.props.route.params.group.id)
              .update({
                users: firebase.firestore.FieldValue.arrayUnion(request),
                requests: firebase.firestore.FieldValue.arrayRemove(request),
              }),
          ]);
        })
      ).then(() => {
        firebase
          .firestore()
          .collection("groups")
          .doc(this.props.route.params.group.id)
          .update({
            private: this.state.private,
            title: this.state.title,
            description: this.state.description,
            updated: new Date()
          })
          .then(() => {
            firebase
              .firestore()
              .collection("groups")
              .doc(this.props.route.params.group.id)
              .collection("messages")
              .doc()
              .set({
                content: "Group Updated",
                created: new Date(),
                senderId: null,
                senderName: null,
                type: "admin",
              })
              .then(() => {
                this.props.navigation.goBack();
              });
          });
      });
    } else {
      firebase
        .firestore()
        .collection("groups")
        .doc(this.props.route.params.group.id)
        .update({
          private: this.state.private,
          title: this.state.title,
          description: this.state.description,
        })
        .then(() => {
          firebase
            .firestore()
            .collection("groups")
            .doc(this.props.route.params.group.id)
            .collection("messages")
            .doc()
            .set({
              content: "Group Updated",
              created: new Date(),
              senderId: null,
              senderName: null,
              type: "admin",
            })
            .then(() => {
              this.props.navigation.goBack();
            });
        });
    }
  };

  render() {
    const colors = this.props.theme.colors;
    return (
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} style={{ flex: 1 }}>
        <SafeAreaView
          style={{
            flex: 1,
            backgroundColor: colors.dBlue,
            justifyContent: "center",
          }}
        >
          <Block
            center
            style={[
              styles.registerContainer,
              { backgroundColor: colors.dBlue, borderColor: colors.orange },
            ]}
          >
            <InputBlock
              value={this.state.title}
              placeholder='Title'
              onChange={this.onTitleChange}
              multiline={false}
              dense={true}
            />
            <InputBlock
              value={this.state.description}
              placeholder='Description'
              onChange={this.onDescriptionChange}
              multiline={true}
              dense={true}
            />
            <Block center middle>
              <Text style={{ color: "#fff", marginBottom: 12 }}>
                {this.state.private ? "Private Group" : "Open Group"}
              </Text>
              <Switch
                value={this.state.private}
                onValueChange={() => {
                  this.setState({ private: !this.state.private });
                  Keyboard.dismiss();
                }}
                color={colors.orange}
                style={{ marginBottom: 12 }}
              />
            </Block>
            <ButtonBlock
              text='Edit Group'
              onPress={this.update}
              disabled={
                this.state.title.length == 0 ||
                this.state.description.length == 0
              }
              disabledStyles={{
                opacity: 0.3,
                backgroundColor: colors.orange,
              }}
              uppercase={false}
            />
          </Block>
        </SafeAreaView>
      </TouchableWithoutFeedback>
    );
  }
}

const styles = StyleSheet.create({
  registerContainer: {
    width: "100%",
    borderRadius: 8,
    borderWidth: 2,
    padding: 16,
  },
});

export default withTheme(EditGroup);
