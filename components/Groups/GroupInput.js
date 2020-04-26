import React from "react";
import { StyleSheet, Keyboard } from "react-native";
import { Block } from "galio-framework";
import { withTheme, TextInput, IconButton } from "react-native-paper";
import firebase from "firebase";

class GroupInput extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      message: "",
      error: false,
    };
  }

  onChange = (message) => {
    this.setState({ message });
  };

  sendMessage = () => {
    firebase
      .firestore()
      .collection("groups")
      .doc(this.props.group.id)
      .update({
        updated: new Date()
      })
    firebase
      .firestore()
      .collection("groups")
      .doc(this.props.group.id)
      .collection("messages")
      .add({
        type: "message",
        content: this.state.message,
        created: new Date(),
        senderId: this.props.user.id,
        sender: {
          username: this.props.user.username,
          proPicUrl: this.props.user.proPicUrl,
        },
      });
    this.setState({ message: "" });
    Keyboard.dismiss();
  };

  navToGameForm = () => {
    this.props.navigate('GameForm', {group: {id: this.props.group.id, title: this.props.group.title}})
  }

  render() {
    colors = this.props.theme.colors;
    return (
      <Block row middle style={{}}>
        <IconButton
          onPress={this.navToGameForm}
          color={colors.orange}
          icon='plus'
        />
        <TextInput
          value={this.state.message}
          theme={{
            colors: {
              text: colors.white,
              placeholder: colors.white,
              underlineColor: colors.orange,
              selectionColor: colors.orange,
              primary: colors.orange,
            },
          }}
          mode={"outlined"}
          placeholder={"Message"}
          onChangeText={this.onChange}
          blurOnSubmit={true}
          multiline={true}
          onSubmitEditing={this.sendMessage}
          returnKeyType={"send"}
          style={{ flex: 1, marginTop: -8 }}
          dense={true}
        />
        <IconButton
          onPress={this.sendMessage}
          color={colors.orange}
          icon='send'
        />
      </Block>
    );
  }
}

const styles = StyleSheet.create({});

export default withTheme(GroupInput);
