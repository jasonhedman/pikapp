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

import basketball from "../../assets/images/Basketball.png";
import soccer from "../../assets/images/Soccer.png";
import spikeball from "../../assets/images/Spikeball.png";
import volleyball from "../../assets/images/Volleyball.png";
import football from "../../assets/images/Football.png";

import firebase from "firebase";
import withAuthenticatedUser from "../../contexts/authenticatedUserContext/withAuthenticatedUser";

const sports = {
  Basketball: basketball,
  Soccer: soccer,
  Spikeball: spikeball,
  Volleyball: volleyball,
  Football: football,
};

class CreateGroup extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      title: "",
      description: "",
      private: false,
      basketball: false,
      soccer: false,
      spikeball: false,
      volleyball: false,
      football: false,
      user: {},
    };
  }

  componentDidMount() {
    
  }

  onTitleChange = (title) => {
    this.setState({ title });
  };

  onDescriptionChange = (description) => {
    this.setState({ description });
  };

  onCreate = () => {
    let currentUser = firebase.auth().currentUser.uid;
    let groupData = {
      users: [currentUser],
      private: this.state.private,
      owner: currentUser,
      admins: [],
      coOwners: [],
      gameHistory: [],
      calendar: [],
      requests: [],
      title: this.state.title,
      description: this.state.description,
      sports: {
        basketball: 0,
        football: 0,
        soccer: 0,
        frisbee: 0,
        volleyball: 0,
        spikeball:0
      },
      updated: new Date()
    };
    firebase
      .firestore()
      .collection("groups")
      .add(groupData)
      .then((group) => {
        groupData.id = group.id;
        if (this.state.private == false) {
          this.props._currentUserProfile.followers.forEach((user) => {
            firebase
              .firestore()
              .collection("users")
              .doc(user)
              .collection("social")
              .add({
                from: this.props._currentUserProfile,
                group: groupData,
                type: "newGroup",
                time: new Date(),
              });
          });
        }
        Promise.all([
          firebase
            .firestore()
            .collection("groups")
            .doc(group.id)
            .collection("messages")
            .doc()
            .set({
              content: "Group Created",
              created: new Date(),
              senderId: null,
              senderName: null,
              type: "admin",
            }),
          firebase.firestore().collection("groups").doc(group.id).update({
            id: group.id,
          }),
          firebase
            .firestore()
            .collection("users")
            .doc(firebase.auth().currentUser.uid)
            .update({
              groups: firebase.firestore.FieldValue.arrayUnion(group.id),
            }),
        ]).then(() => {
          this.props.navigation.popToTop();
          this.props.navigation.navigate("GroupProfile", { groupId: group.id });
        });
      });
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
              text='Create Group'
              onPress={this.onCreate}
              disabled={
                this.state.title.length == 0 ||
                this.state.description.length == 0
              }
              disabledStyles={{ opacity: 0.3, backgroundColor: colors.orange }}
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

export default withTheme(withAuthenticatedUser( CreateGroup));
