import React from "react";
import {
  StyleSheet,
  ImageBackground,
  Dimensions,
  StatusBar,
  KeyboardAvoidingView
} from "react-native";
import { Block, Checkbox, Text, theme } from "galio-framework";

import {Button,TextInput,Headline,withTheme} from 'react-native-paper';

import { Icon, Input } from "../components";
import { Images, argonTheme } from "../constants";

import * as firebase from 'firebase';

const { width, height } = Dimensions.get("screen");

class Register extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      email: "",
      password: "",
    }
  }

  onEmailChange = (email) => {
    this.setState({email});
  }

  onPasswordChange = (password) => {
    this.setState({password});
  }

  onSignIn = () => {
    firebase.auth().setPersistence(firebase.auth.Auth.Persistence.LOCAL)
      .then(() => {
        firebase.auth().signInWithEmailAndPassword(this.state.email,this.state.password)
          .then(() => {
            this.props.navigation.navigate('Main');
          })
          .catch((err) => {
            console.error(err.toString());
          })
      })
      .catch(function(error) {
        var errorCode = error.code;
        var errorMessage = error.message;
        console.error("jdhfljka" + errorMessage);
      });
  }

  toSignUp = () => {
    this.props.navigation.navigate("SignUp")
  }

  render() {
    return (
      <Block flex middle>
        <StatusBar hidden />
        <ImageBackground
          source={Images.RegisterBackground}
          style={{ width, height, zIndex: 1 }}
        >
          <Block flex middle>
            <Block style={styles.registerContainer}>
              <Block flex>
                <Block flex={0.17} middle>
                  <Headline color={this.props.theme.colors.primary} size={12}>
                    Sign In
                  </Headline>
                </Block>
                <Block flex center>
                  <KeyboardAvoidingView
                    style={{ flex: 1 }}
                    behavior="padding"
                    enabled
                  >
                    <Block width={width * 0.8} style={{ marginBottom: 15 }}>
                      <TextInput
                        style={styles.input}
                        mode={'outlined'}
                        placeholder="Email"
                        onChangeText={this.onEmailChange}
                      />
                    </Block>
                    <Block width={width * 0.8}>
                      <TextInput
                        style={styles.input}
                        mode={'outlined'}
                        secureTextEntry={true}
                        placeholder="Password"
                        onChangeText={this.onPasswordChange}
                      />
                    </Block>
                    <Block middle>
                      <Button mode="contained" dark={true} style={styles.createButton} onPress={this.onSignIn}>
                          SIGN IN
                      </Button>
                    </Block>
                    <Block middle>
                      <Text color="#8898AA" size={12}>
                        Or if you do not have an account
                      </Text>
                    </Block>
                    <Block middle>
                      <Button mode="contained" dark={true} style={styles.createButton} onPress={this.toSignUp}>
                          SIGN UP
                      </Button>
                    </Block>
                  </KeyboardAvoidingView>
                </Block>
              </Block>
            </Block>
          </Block>
        </ImageBackground>
      </Block>
    );
  }
}

const styles = StyleSheet.create({
  registerContainer: {
    width: width * 0.9,
    height: height * 0.5,
    backgroundColor: "#F4F5F7",
    borderRadius: 4,
    shadowColor: argonTheme.COLORS.BLACK,
    shadowOffset: {
      width: 0,
      height: 4
    },
    shadowRadius: 8,
    shadowOpacity: 0.1,
    elevation: 1,
    overflow: "hidden"
  },
  socialConnect: {
    backgroundColor: argonTheme.COLORS.WHITE,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: "#8898AA"
  },
  socialButtons: {
    width: 120,
    height: 40,
    backgroundColor: "#fff",
    shadowColor: argonTheme.COLORS.BLACK,
    shadowOffset: {
      width: 0,
      height: 4
    },
    shadowRadius: 8,
    shadowOpacity: 0.1,
    elevation: 1
  },
  socialTextButtons: {
    color: argonTheme.COLORS.PRIMARY,
    fontWeight: "800",
    fontSize: 14
  },
  inputIcons: {
    marginRight: 12
  },
  passwordCheck: {
    paddingLeft: 15,
    paddingTop: 13,
    paddingBottom: 30
  },
  createButton: {
    width: width * 0.5,
    marginTop: 25,
    marginBottom: 25
  },
  input: {
    height: 50,
    justifyContent:"center"
  }
});

export default withTheme(Register);
