import React from "react";
import {
  StyleSheet,
  Dimensions,
} from "react-native";
import { Block } from "galio-framework";
import Form from '../components/Form';
import ButtonBlock from '../components/ButtonBlock';
import {TextInput,withTheme} from 'react-native-paper';
import HeaderBlock from '../components/HeaderBlock';
import InputBlock from '../components/InputBlock';
import HelperText from '../components/HelperText';


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
            this.setState({passwordError:false})
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
                    } else {
                      this.setState({emailInvalid:false})
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
                <HeaderBlock text='Your Email Has Been Changed.' backButton={false}/>
                <ButtonBlock onPress={() => this.props.navigation.navigate("Profile")} text='Back'></ButtonBlock>
            </>
            )
            : (
            <>
              <HeaderBlock text='Change Email' backButton={true} backPress={() => this.props.navigation.navigate('Profile')} />
              <InputBlock 
                value={this.state.currentPassword}
                placeholder="Current Password" 
                onChange={this.onCurrentPasswordChange}
                secureTextEntry={true}
              />
              <InputBlock 
                value={this.state.email}
                placeholder="New Email" 
                onChange={this.onEmailChange}
                onBlur={() => {
                  this.setState({emailBlur:true}, this.checkEmail);
                }}
              />
              <ButtonBlock text='Change Email' onPress={this.onSubmit} disabled={this.state.emailTaken || this.state.email.length == 0} disabledStyles={{opacity:.3,backgroundColor:colors.orange}}>
                  <>
                    <HelperText visible={this.state.emailBlur && this.state.emailTaken} text='Email already in use.' />
                    <HelperText visible={this.state.passwordError} text='Password is incorrect.' />
                    <HelperText visible={this.state.emailInvalid} text='Email is invalid.' />
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
