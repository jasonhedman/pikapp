import React from "react";
import {
  StyleSheet,
  Dimensions,
  Keyboard,
  TouchableWithoutFeedback,
  KeyboardAvoidingView
} from "react-native";
import { Block } from "galio-framework";
import Form from '../components/Form';
import {Caption,Button,TextInput,Headline,withTheme,Portal,Dialog,HelperText,Text, Subheading} from 'react-native-paper';


import * as firebase from 'firebase';

const { width, height } = Dimensions.get("screen");

class ChangePassword extends React.Component {
  constructor(props){
    super(props);
    this.state = {
        currentPassword:'',
        password:"",
        confirmPassword:"",
        submitted: false,
        passwordError:false,
        matchError:false,
        passwordBlur:false
    }
  }

  onPasswordChange = (password) => {
    this.setState({password});
  }

  onConfirmPasswordChange = (confirmPassword) => {
    this.setState({confirmPassword});
  }

  onCurrentPasswordChange = (currentPassword) => {
    this.setState({currentPassword});
  }


  onSubmit = () => {
    let user = firebase.auth().currentUser;
    let credential = firebase.auth.EmailAuthProvider.credential(user.email,this.state.currentPassword)
    firebase.auth().currentUser.reauthenticateWithCredential(credential)
        .then(() => {
            if(this.state.password == this.state.confirmPassword){
                firebase.auth().currentUser.updatePassword(this.state.password)
                    .then(() => {
                        this.setState({submitted:true})
                    })
                    .catch((err) => {
                        console.log(err);
                    })
            } else {
                this.setState({matchError:true})
            }
        })
        .catch((err) => {
            this.setState({passwordError:true});
        })
  }


  render() {
    colors = this.props.theme.colors;
    return (
      <Form>
        {
            this.state.submitted
            ? (
            <>
                <Headline style={{color:colors.white,fontSize:20,marginTop:height*.025,marginBottom:height*.025}}>Your password has been changed.</Headline>
                <Button mode="contained" dark={true} style={{}} onPress={() => {this.props.navigation.navigate("Profile")}} theme={{colors:{primary:colors.orange},fonts:{medium:this.props.theme.fonts.regular}}}>
                    Back
                </Button>
            </>
            )
            : (
            <>
              <Block style={styles.headerBlock}>
                <Button onPress={() => this.props.navigation.navigate('Profile')} mode={'text'} compact={true} icon={'keyboard-backspace'} theme={{colors:{primary:colors.orange}}} style={{position:'absolute', left:-8,top:0, padding:0,zIndex:100}}>
                </Button>
                <Headline style={{color:colors.white,textAlign:'center'}}>Change Password</Headline>
              </Block>
              <Block style={styles.inputBlock}>
                <TextInput
                  secureTextEntry={true}
                  theme={{colors: {text:colors.white,placeholder:colors.white,underlineColor:colors.orange,selectionColor:colors.orange,primary:colors.orange}}}
                  style={[styles.input]}
                  mode={'outlined'}
                  placeholder="Current Password"
                  onChangeText={this.onCurrentPasswordChange}
                />
              </Block>
              <Block style={styles.inputBlock}>
                <TextInput
                  secureTextEntry={true}
                  theme={{colors: {text:colors.white,placeholder:colors.white,underlineColor:colors.orange,selectionColor:colors.orange,primary:colors.orange}}}
                  style={[styles.input]}
                  mode={'outlined'}
                  placeholder="New Password"
                  onChangeText={this.onPasswordChange}
                  onBlur={() => {
                      this.setState({passwordBlur:true})
                  }}
                />
              </Block>
              <Block style={styles.inputBlock}>
                <TextInput
                  secureTextEntry={true}
                  theme={{colors: {text:colors.white,placeholder:colors.white,underlineColor:colors.orange,selectionColor:colors.orange,primary:colors.orange}}}
                  style={[styles.input]}
                  mode={'outlined'}
                  placeholder="Confirm Password"
                  onChangeText={this.onConfirmPasswordChange}
                />
              </Block>
              <Block style={styles.buttonBlock}>
                <Button mode="contained" disabled={this.state.passwordBlur && this.state.password.length < 8} dark={true} style={[styles.createButton, this.state.passwordBlur && this.state.password.length < 8 ? {opacity:.3,backgroundColor:colors.orange}:null]} onPress={this.onSubmit} theme={{colors:{primary:colors.orange},fonts:{medium:this.props.theme.fonts.regular}}}>
                  Change Password
                </Button>
                {
                  this.state.passwordError
                  ? <HelperText type="error" visible={this.state.passwordError} theme={{colors:{error:colors.orange}}}>Incorrect current password</HelperText>
                  : null
                }
                {
                  this.state.passwordBlur && this.state.password.length < 8
                  ? <HelperText type="error" visible={this.state.password.length < 8} theme={{colors:{error:colors.orange}}}>Password must be more than 8 characters</HelperText>
                  : null
                }
                {
                  this.state.matchError
                  ? <HelperText type="error" visible={this.state.matchError} theme={{colors:{error:colors.orange}}}>Passwords do not match</HelperText>
                  : null
                }
              </Block>
            </>
            )
          }
      </Form>
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
    justifyContent: "center",
  },
  input: {
    justifyContent:"center"
  },
  inputBlock:{
    width:"100%",
    marginBottom:12,
  },
  buttonBlock:{
    marginTop:8
  },
  headerBlock:{
    width:"100%",
    marginTop:16,
    marginBottom:16
  },
});

export default withTheme(ChangePassword);
