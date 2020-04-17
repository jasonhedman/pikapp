import React from "react";
import {
  StyleSheet,
  TouchableWithoutFeedback,
  Keyboard,
  KeyboardAvoidingView,
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

const sports = {
  Basketball: basketball,
  Soccer: soccer,
  Spikeball: spikeball,
  Volleyball: volleyball,
  Football: football,
};

class EditGroup extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      title: this.props.route.params.group.title,
      description: this.props.route.params.group.description,
      private: this.props.route.params.group.private,
      basketball: false,
      soccer: false,
      spikeball: false,
      volleyball: false,
      football: false,
    };
    Object.keys(this.props.route.params.group.sports).forEach((sport) => {
      this.state[sport] = true;
    });
  }

  onTitleChange = (title) => {
    this.setState({ title });
  };

  onDescriptionChange = (description) => {
    this.setState({ description });
  };

  update = () => {
    let sportsObject = {
      basketball: this.state.basketball,
      soccer: this.state.soccer,
      spikeball: this.state.spikeball,
      volleyball: this.state.volleyball,
      football: this.state.football,
    };
    let sportsList = Object.keys(sportsObject).filter((sport) => {
      return sportsObject[sport];
    });
    let sports = {};
    sportsList.forEach(
      (sport) =>
        (sports[sport] =
          this.props.route.params.group.sports[sport] == undefined
            ? 0
            : this.props.route.params.group.sports[sport])
    );
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
            sports: sports,
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
          sports: sports,
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
          <KeyboardAvoidingView
            style={{ flex: 1, justifyContent: "center", padding: 16 }}
            behavior="padding"
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
                placeholder="Title"
                onChange={this.onTitleChange}
                multiline={false}
                dense={true}
              />
              <InputBlock
                value={this.state.description}
                placeholder="Description"
                onChange={this.onDescriptionChange}
                multiline={true}
                dense={true}
              />
              <Text style={{ color: colors.white, marginBottom: 10 }}>
                Sports
              </Text>
              <Block middle row style={{ flexWrap: "wrap", marginBottom: 10 }}>
                {Object.keys(sports).map((sport, index) => {
                  return (
                    <Chip
                      onPress={() => {
                        this.setState({
                          [sport.toLowerCase()]: !this.state[
                            sport.toLowerCase()
                          ],
                        });
                        Keyboard.dismiss();
                      }}
                      selected={this.state[sport.toLowerCase()]}
                      mode={"outlined"}
                      style={{ backgroundColor: colors.orange, margin: 2 }}
                      textStyle={{ color: colors.white }}
                      key={index}
                    >
                      {sport}
                    </Chip>
                  );
                })}
              </Block>
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
                text="Edit Group"
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
          </KeyboardAvoidingView>
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
