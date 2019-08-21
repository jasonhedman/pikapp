import React from "react";
import {
  StyleSheet,
  Dimensions,
  Keyboard,
  TouchableWithoutFeedback,
  KeyboardAvoidingView
} from "react-native";
import { Block } from "galio-framework";

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
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} style={{height,width}}>
          <Block flex center middle style={{width,backgroundColor:colors.dBlue}}>
            <KeyboardAvoidingView
                enabled
                behavior="padding"
            >
              <Block flex middle>
              <Block center middle style={{width:width*.9,padding: 10, paddingBottom: height*.025,borderWidth:2, borderRadius:8, borderColor:colors.orange}}>
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
                            <Block middle style={{marginRight:"auto"}}>
                              <Button icon='navigate-before' onPress={() => this.props.navigation.navigate('Profile')} mode={'text'} theme={{colors:{primary:colors.orange},fonts:{medium:this.props.theme.fonts.regular}}} style={{marginRight:'auto'}}></Button>
                            </Block>
                            <Headline style={{color:colors.white,textAlign:'center',marginBottom:height*.025}}>Change Password</Headline>
                            <TextInput
                                secureTextEntry={true}
                                theme={{colors: {text:colors.white,placeholder:colors.white,underlineColor:colors.orange,selectionColor:colors.orange,primary:colors.orange}}}
                                style={[styles.input]}
                                mode={'outlined'}
                                placeholder="Current Password"
                                onChangeText={this.onCurrentPasswordChange}
                            />
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
                            <TextInput
                                secureTextEntry={true}
                                theme={{colors: {text:colors.white,placeholder:colors.white,underlineColor:colors.orange,selectionColor:colors.orange,primary:colors.orange}}}
                                style={[styles.input]}
                                mode={'outlined'}
                                placeholder="Confirm Password"
                                onChangeText={this.onConfirmPasswordChange}
                            />
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
                        </>
                        )
                    }
                    </Block>
              </Block>
            </KeyboardAvoidingView>
          </Block>
        </TouchableWithoutFeedback>
        
    );
  }
}

const styles = StyleSheet.create({
  createButton: {
    flex:0,
    height: height * .05,
    alignItems: "center",
    justifyContent: "center",
  },
  input: {
    marginTop:0,
    width:width*.8,
    height: height*.075,
    justifyContent:"center",
    marginBottom:height*.02
  }
});

export default withTheme(ChangePassword);
