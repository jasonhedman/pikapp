import React from "react";
import {
  StyleSheet,
  Dimensions,
  View,
  TouchableWithoutFeedback,
  Keyboard,
  KeyboardAvoidingView,
  TouchableOpacity
} from "react-native";
import { Block} from "galio-framework";

import {Caption,Button,TextInput,Headline,withTheme,HelperText,Text} from 'react-native-paper';

import { Images, argonTheme } from "../constants";

import * as firebase from 'firebase';

const { width, height } = Dimensions.get("screen");

class Register extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      email: "",
      password: "",
      error: false,
      modalEmail:""
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
            this.setState({error:true})
          })
      })
      .catch(function(error) {
        this.setState({error:true})
      });
  }

  toSignUp = () => {
    this.props.navigation.navigate("SignUp")
  }

  _showDialog = () => this.setState({ error: true });

  _hideDialog = () => this.setState({ error: false });

  render() {

    colors = this.props.theme.colors;
    return (
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <Block flex middle>
          <View
            style={{ width, height, zIndex: 1, backgroundColor:colors.dBlue }}
          >
              <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior="padding"
                enabled
              >
                <Block flex middle>
                  <Block center middle style={[styles.registerContainer, {backgroundColor:colors.dBlue,borderColor:colors.orange}]}>
                      <Block style={styles.headerBlock} middle>
                        <Headline style={{color:this.props.theme.colors.white}}>
                          Sign In
                        </Headline>
                      </Block>                          
                      <Block style={styles.inputBlock}>
                        <TextInput
                          theme={{colors: {text:colors.white,placeholder:colors.white,underlineColor:colors.orange,selectionColor:colors.orange,primary:colors.orange}}}
                          style={[styles.input]}
                          mode={'outlined'}
                          placeholder="Email"
                          onChangeText={this.onEmailChange}
                        />
                      </Block>
                      <Block style={styles.inputBlock}>
                        <TextInput
                          theme={{colors: {text:colors.white,placeholder:colors.white,underlineColor:colors.orange,selectionColor:colors.orange,primary:colors.orange}}}
                          style={styles.input}
                          mode={'outlined'}
                          secureTextEntry={true}
                          placeholder="Password"
                          onChangeText={this.onPasswordChange}
                        />
                      </Block>
                      <Block middle center style={styles.buttonBlock}>
                        <Button mode="contained" dark={true} style={styles.createButton} onPress={this.onSignIn} theme={{colors:{primary:colors.orange},fonts:{medium:this.props.theme.fonts.regular}}}>
                            Sign In
                        </Button>
                        <HelperText type="error" visible={this.state.error} theme={{colors:{error:colors.orange}}}>Incorrect Email or Password</HelperText>
                        <TouchableOpacity onPress={() => this.props.navigation.navigate("ForgotPassword")}><Text style={{color:colors.grey}}>Forgot Password?</Text></TouchableOpacity>
                      </Block>
                  </Block>
                </Block>
              </KeyboardAvoidingView>
            <View style={{bottom: 32, position: 'absolute', zIndex: 999}}>
              <Block center middle width={width} style={{}}>
                <Caption style={{color:colors.grey}}>
                  If do not already have an account
                </Caption>
                <Button mode="text" onPress={this.toSignUp} dark={true} style={styles.createButton} theme={{colors:{primary:colors.lGreen},fonts:{medium:this.props.theme.fonts.regular}}}>
                    Sign Up
                </Button>
              </Block>
            </View>
          </View>
        </Block>
      </TouchableWithoutFeedback>
    );
  }
}

const styles = StyleSheet.create({
  registerContainer: {
    width: width * 0.9,
    borderRadius: 8,
    borderWidth: 2,
    padding:16,
  },
  createButton: {
    padding:4,
    alignItems: "center",
    justifyContent: "center"
  },
  input: {
    justifyContent:"center"
  },
  inputBlock:{
    width:"100%",
    marginBottom:12,
  },
  buttonBlock:{
    marginTop:8,
    width:"100%",
  },
  headerBlock:{
    marginTop:16,
    marginBottom:16
  }
});

export default withTheme(Register);
