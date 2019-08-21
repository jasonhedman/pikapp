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

class ChangeEmail extends React.Component {
  constructor(props){
    super(props);
    this.state = {
        currentPassword:'',
        email:'',
        submitted: false,
        emailBlur:false,
        emailTaken:false,
        emailInvalid:false,
    }
  }

  onEmailChange = (email) => {
    this.setState({email}, () => {
        if(this.state.emailBlur){
            this.checkEmail();
        }
    });
  }

  onCurrentPasswordChange = (currentPassword) => {
    this.setState({currentPassword});
  }


  onSubmit = () => {
    let user = firebase.auth().currentUser;
    let credential = firebase.auth.EmailAuthProvider.credential(user.email,this.state.currentPassword)
    firebase.auth().currentUser.reauthenticateWithCredential(credential)
        .then(() => {
            firebase.auth().currentUser.updateEmail(this.state.email.toLowerCase())
                .then(() => {
                    firebase.firestore().collection('users').doc(firebase.auth().currentUser.uid).update({
                        email:this.state.email.toLowerCase()
                    })
                        .then(() => {
                            this.setState({submitted:true})
                        })
                })
                .catch((err) => {
                    if(err.code == "auth/invalid-email"){
                        this.setState({emailInvalid:true})
                    }
                })
        })
        .catch((err) => {
            this.setState({passwordError:true});
        })
  }

  checkEmail = () => {
    firebase.firestore().collection('users').where("email", "==", this.state.email).get()
      .then((users) => {
        let i = 0;
        users.forEach((user) => {
          i++;
        })
        if(i > 0){
          this.setState({emailTaken:true});
        } else {
          this.setState({emailTaken:false});
        }
      })
      .catch((error) => {
        console.log(error);
      })
  }


  render() {
    colors = this.props.theme.colors;
    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <Block flex center middle style={{width,backgroundColor:colors.dBlue}}>
            <KeyboardAvoidingView
                style={{flex:1,justifyContent:'center', alignItems:'center'}}
                enabled
                behavior="padding"
            >
                    <Block center middle style={{width:width*.9,padding: 10, paddingBottom: height*.025,borderWidth:2, borderRadius:8, borderColor:colors.orange}}>
                    {
                        this.state.submitted
                        ? (
                        <>
                            <Headline style={{color:colors.white,fontSize:20,marginTop:height*.025,marginBottom:height*.025}}>Your email has been changed.</Headline>
                            <Button mode="contained" dark={true} style={{}} onPress={() => {this.props.navigation.navigate("Profile")}} theme={{colors:{primary:colors.orange},fonts:{medium:this.props.theme.fonts.regular}}}>
                                Back
                            </Button>
                        </>
                        )
                        : (
                        <>
                            <Block middle style={{marginRight:"auto"}}>
                            <Button icon='navigate-before' onPress={() => this.props.navigation.navigate('Profile')} mode={'text'} theme={{colors:{primary:colors.orange},fonts:{medium:this.props.theme.fonts.regular}}} style={{marginRight:'auto'}}>
                                
                            </Button>
                            </Block>
                            <Headline style={{color:colors.white,textAlign:'center',marginBottom:height*.025}}>Change Email</Headline>
                            <TextInput
                                secureTextEntry={true}
                                theme={{colors: {text:colors.white,placeholder:colors.white,underlineColor:colors.orange,selectionColor:colors.orange,primary:colors.orange}}}
                                style={[styles.input]}
                                mode={'outlined'}
                                placeholder="Current Password"
                                onChangeText={this.onCurrentPasswordChange}
                            />
                            <TextInput
                                theme={{colors: {text:colors.white,placeholder:colors.white,underlineColor:colors.orange,selectionColor:colors.orange,primary:colors.orange}}}
                                style={[styles.input]}
                                mode={'outlined'}
                                placeholder="New Email"
                                onChangeText={this.onEmailChange}
                                onBlur={() => {
                                    this.setState({emailBlur:true}, this.checkEmail);
                                }}
                            />
                            <Button mode="contained" disabled={this.state.emailTaken} dark={true} style={[styles.createButton, this.state.emailTaken ? {opacity:.3,backgroundColor:colors.orange}:null]} onPress={this.onSubmit} theme={{colors:{primary:colors.orange},fonts:{medium:this.props.theme.fonts.regular}}}>
                                Change Email
                            </Button>
                            {
                                this.state.emailBlur
                                ? <HelperText type="error" visible={this.state.emailTaken} theme={{colors:{error:colors.orange}}}>Email already in use</HelperText>
                                : null
                            }
                            {
                                this.state.passwordError
                                ? <HelperText type="error" visible={this.state.passwordError} theme={{colors:{error:colors.orange}}}>Password is incorrect</HelperText>
                                : null
                            }
                            {
                                this.state.emailInvalid
                                ? <HelperText type="error" visible={this.state.emailInvalid} theme={{colors:{error:colors.orange}}}>Email is invalid</HelperText>
                                : null
                            }
                        </>
                        )
                    }
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

export default withTheme(ChangeEmail);
