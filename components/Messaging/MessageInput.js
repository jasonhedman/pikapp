import React from "react";
import { StyleSheet, Keyboard } from "react-native";
import { Block } from "galio-framework";
import { withTheme, TextInput, IconButton } from "react-native-paper";
import firebase from "firebase";

class MessageInput extends React.Component {
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
        firebase.firestore().collection(this.props.collection).doc(this.props.doc).collection('messages').add({
            content: this.state.message,
            created: new Date(),
            type:'message',
            senderId: this.props.user.id,
            sender: {
                username: this.props.user.username,
                proPicUrl: this.props.user.proPicUrl
            }
        })
        this.setState({message:''})
        Keyboard.dismiss()
    }

  render() {
    colors = this.props.theme.colors;
    return (
      <Block row middle style={{ padding: 8 }}>
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
          style={{ flex: 1, marginTop: 0 }}
          dense={true}
        />
        <Block>
          <IconButton
            onPress={this.sendMessage}
            color={colors.orange}
            icon="send"
            style={{ marginTop: 8 }}
          />
        </Block>
      </Block>
    );
  }
}

const styles = StyleSheet.create({
  image: {
    height: 50,
    width: 50,
    backgroundColor: "blue",
    marginTop: "auto",
  },
  body: {
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
});

export default withTheme(MessageInput);
