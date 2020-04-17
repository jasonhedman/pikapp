import React from "react";
import { StyleSheet } from "react-native";
import { Block } from "galio-framework";
import Form from "../../components/Utility/Form";
import ButtonBlock from "../../components/Utility/ButtonBlock";
import HeaderBlock from "../../components/Utility/HeaderBlock";
import { TextInput, withTheme, HelperText } from "react-native-paper";

import * as firebase from "firebase";

class ChangePassword extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      currentPassword: "",
      password: "",
      confirmPassword: "",
      submitted: false,
      passwordError: false,
      matchError: false,
      passwordBlur: false,
    };
  }

  onPasswordChange = (password) => {
    this.setState({ password });
  };

  onConfirmPasswordChange = (confirmPassword) => {
    this.setState({ confirmPassword });
  };

  onCurrentPasswordChange = (currentPassword) => {
    this.setState({ currentPassword });
  };

  onSubmit = () => {
    let user = firebase.auth().currentUser;
    let credential = firebase.auth.EmailAuthProvider.credential(
      user.email,
      this.state.currentPassword
    );
    firebase
      .auth()
      .currentUser.reauthenticateWithCredential(credential)
      .then(() => {
        if (this.state.password == this.state.confirmPassword) {
          firebase
            .auth()
            .currentUser.updatePassword(this.state.password)
            .then(() => {
              this.setState({ submitted: true });
            })
            .catch((err) => {
              console.log(err);
            });
        } else {
          this.setState({ matchError: true });
        }
      })
      .catch((err) => {
        this.setState({ passwordError: true });
      });
  };

  render() {
    colors = this.props.theme.colors;
    return (
      <Form>
        {this.state.submitted ? (
          <>
            <HeaderBlock text="Your Password Has Been Changed." />
            <ButtonBlock
              text="Back"
              onPress={() => this.props.navigation.navigate("Profile")}
            ></ButtonBlock>
          </>
        ) : (
          <>
            <Block style={styles.inputBlock}>
              <TextInput
                secureTextEntry={true}
                theme={{
                  colors: {
                    text: colors.white,
                    placeholder: colors.white,
                    underlineColor: colors.orange,
                    selectionColor: colors.orange,
                    primary: colors.orange,
                  },
                }}
                style={[styles.input]}
                mode={"outlined"}
                placeholder="Current Password"
                onChangeText={this.onCurrentPasswordChange}
              />
            </Block>
            <Block style={styles.inputBlock}>
              <TextInput
                secureTextEntry={true}
                theme={{
                  colors: {
                    text: colors.white,
                    placeholder: colors.white,
                    underlineColor: colors.orange,
                    selectionColor: colors.orange,
                    primary: colors.orange,
                  },
                }}
                style={[styles.input]}
                mode={"outlined"}
                placeholder="New Password"
                onChangeText={this.onPasswordChange}
                onBlur={() => {
                  this.setState({ passwordBlur: true });
                }}
              />
            </Block>
            <Block style={styles.inputBlock}>
              <TextInput
                secureTextEntry={true}
                theme={{
                  colors: {
                    text: colors.white,
                    placeholder: colors.white,
                    underlineColor: colors.orange,
                    selectionColor: colors.orange,
                    primary: colors.orange,
                  },
                }}
                style={[styles.input]}
                mode={"outlined"}
                placeholder="Confirm Password"
                onChangeText={this.onConfirmPasswordChange}
              />
            </Block>
            <ButtonBlock
              text="Change Password"
              onPress={this.onSubmit}
              disabled={
                this.state.passwordBlur && this.state.password.length < 8
              }
              disabledStyles={{ opacity: 0.3, backgroundColor: colors.orange }}
            >
              <>
                {this.state.passwordError ? (
                  <HelperText
                    type="error"
                    visible={this.state.passwordError}
                    theme={{ colors: { error: colors.orange } }}
                  >
                    Incorrect current password
                  </HelperText>
                ) : null}
                {this.state.passwordBlur && this.state.password.length < 8 ? (
                  <HelperText
                    type="error"
                    visible={this.state.password.length < 8}
                    theme={{ colors: { error: colors.orange } }}
                  >
                    Password must be more than 8 characters
                  </HelperText>
                ) : null}
                {this.state.matchError ? (
                  <HelperText
                    type="error"
                    visible={this.state.matchError}
                    theme={{ colors: { error: colors.orange } }}
                  >
                    Passwords do not match
                  </HelperText>
                ) : null}
              </>
            </ButtonBlock>
          </>
        )}
      </Form>
    );
  }
}

const styles = StyleSheet.create({
  createButton: {
    padding: 4,
    alignItems: "center",
    justifyContent: "center",
  },
  input: {
    justifyContent: "center",
  },
  inputBlock: {
    width: "100%",
    marginBottom: 12,
  },
  buttonBlock: {
    marginTop: 8,
  },
  headerBlock: {
    width: "100%",
    marginTop: 16,
    marginBottom: 16,
  },
});

export default withTheme(ChangePassword);
