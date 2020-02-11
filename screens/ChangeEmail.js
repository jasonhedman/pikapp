import React from "react";
import {
  StyleSheet,
  Dimensions,
} from "react-native";
import { Block } from "galio-framework";
import Form from '../components/Form';
import ButtonBlock from '../components/ButtonBlock';
import {Button,TextInput,Headline,withTheme,HelperText} from 'react-native-paper';


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

  onCurrentEmailChange = (currentPassword) => {
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
        <Form>
          {
            this.state.submitted
            ? (
            <>
                <Headline style={{color:colors.white,fontSize:20,marginTop:height*.025,marginBottom:height*.025}}>Your email has been changed.</Headline>
                <ButtonBlock text='Back' onPress={() => this.props.navigation.navigate("Profile")}></ButtonBlock>
            </>
            )
            : (
            <>
                <Block style={styles.headerBlock} middle>
                  <Button onPress={() => this.props.navigation.navigate('Profile')} mode={'text'} compact={true} icon={'keyboard-backspace'} theme={{colors:{primary:colors.orange}}} style={{position:'absolute', left:-8, padding:0}}></Button>
                  <Headline style={{color:this.props.theme.colors.white}}>Change Email</Headline>
                </Block>
                <Block style={styles.inputBlock}>
                  <TextInput
                    secureTextEntry={true}
                    theme={{colors: {text:colors.white,placeholder:colors.white,underlineColor:colors.orange,selectionColor:colors.orange,primary:colors.orange}}}
                    style={[styles.input]}
                    mode={'outlined'}
                    placeholder="Current Email"
                    onChangeText={this.onCurrentEmailChange}
                  />
                </Block>
                <Block style={styles.inputBlock}>
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
                </Block>
                <ButtonBlock text='Change Email' onPress={this.onSubmit} disabled={this.state.emailTaken} disabledStyles={{opacity:.3,backgroundColor:colors.orange}}>
                    <>
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
                </ButtonBlock>
            </>
            )
        }
      </Form>
    );
  }
}

const styles = StyleSheet.create({
  createButton: {
    alignItems: "center",
    justifyContent: "center",
    padding:4
  },
  input: {
    justifyContent:"center"
  },
  inputBlock:{
    width:"100%",
    marginBottom:12,
  },
  headerBlock:{
    width:'100%',
    marginTop:16,
    marginBottom:16
  }
});

export default withTheme(ChangeEmail);
