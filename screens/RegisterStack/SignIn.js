import React from "react";
import {
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Block } from "galio-framework";
import { Caption, Button, withTheme, Text } from "react-native-paper";
import * as firebase from "firebase";

import Form from "../../components/Utility/Form";
import ButtonBlock from "../../components/Utility/ButtonBlock";
import InputBlock from "../../components/Utility/InputBlock";
import HelperText from "../../components/Utility/HelperText";

const { width, height } = Dimensions.get("screen");

class Register extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      email: "",
      password: "",
      error: false,
      modalEmail: "",
    };
  }

  onEmailChange = (email) => {
    this.setState({ email });
  };

  onPasswordChange = (password) => {
    this.setState({ password });
  };

  onSignIn = () => {
    firebase
      .auth()
      .setPersistence(firebase.auth.Auth.Persistence.LOCAL)
      .then(() => {
        firebase
          .auth()
          .signInWithEmailAndPassword(this.state.email, this.state.password)
          .then(() => {})
          .catch((err) => {
            this.setState({ error: true });
          });
      })
      .catch(function (error) {
        this.setState({ error: true });
      });
  };

  toSignUp = () => {
    this.props.navigation.navigate("SignUp");
  };

  _showDialog = () => this.setState({ error: true });

  _hideDialog = () => this.setState({ error: false });

  render() {
    colors = this.props.theme.colors;
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.dBlue }}>
          <Form>
            <InputBlock
              value={this.state.email}
              placeholder="Email"
              onChange={this.onEmailChange}
            />
            <InputBlock
              value={this.state.password}
              placeholder="Password"
              onChange={this.onPasswordChange}
              secureTextEntry={true}
            />
            <ButtonBlock
              onPress={this.onSignIn}
              uppercase={false}
              text="Sign In"
            >
              <>
                <HelperText
                  visible={this.state.error}
                  text="Incorrect Email or Password."
                  styles={{ marginBottom: 8 }}
                />
                <TouchableOpacity
                  onPress={() =>
                    this.props.navigation.navigate("ForgotPassword")
                  }
                >
                  <Text style={{ color: colors.grey }}>Forgot Password?</Text>
                </TouchableOpacity>
              </>
            </ButtonBlock>
          </Form>
          <Block center middle width={width} style={{}}>
            <Caption style={{ color: colors.grey }}>
              If do not already have an account
            </Caption>
            <Button
              uppercase={false}
              mode="text"
              onPress={this.toSignUp}
              dark={true}
              style={styles.createButton}
              theme={{
                colors: { primary: colors.lGreen },
                fonts: { medium: this.props.theme.fonts.regular },
              }}
            >
              Sign Up
            </Button>
          </Block>
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  createButton: {
    padding: 4,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
});

export default withTheme(Register);
