import React from "react";
import {
  StyleSheet,
  Dimensions,
} from "react-native";
import { Block } from "galio-framework";
import Form from '../components/Form';
import ButtonBlock from '../components/ButtonBlock';
import HeaderBlock from '../components/HeaderBlock';
import InputBlock from '../components/InputBlock';
import HelperText from '../components/HelperText';


import {TextInput,withTheme} from 'react-native-paper';


import * as firebase from 'firebase';

const { width, height } = Dimensions.get("screen");

class ChangePassword extends React.Component {
  constructor(props){
    super(props);
    this.state = {
        lengthError:true,
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
    this.setState({password}, () => {
      if(password.length >= 8){
        this.setState({lengthError:false})
      }
    });
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
            this.setState({passwordError:false}, () => {
              if(this.state.password == this.state.confirmPassword){
                if(this.state.password.length < 8) {
                  this.setState({lengthError:true})
                }
                firebase.auth().currentUser.updatePassword(this.state.password)
                  .then(() => {
                      this.setState({submitted:true})
                  })
                  .catch((err) => {
                      console.log(err);
                  })
              } else {
                  this.setState({matchError:true});
              }
            });
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
                <HeaderBlock text='Your Password Has Been Changed.' backButton={false}/>
                <ButtonBlock onPress={() => this.props.navigation.navigate("Profile")} text='Back'></ButtonBlock>
            </>
            )
            : (
            <>
              <HeaderBlock text='Change Password' backButton={true} backPress={() => this.props.navigation.navigate('Profile')} />
              <InputBlock 
                value={this.state.currentPassword}
                placeholder="Current Password" 
                onChange={this.onCurrentPasswordChange}
                secureTextEntry={true}
              />
              <InputBlock 
                value={this.state.password}
                placeholder="New Password" 
                onChange={this.onPasswordChange}
                secureTextEntry={true}
                onBlur={() => {
                  this.setState({passwordBlur:true})
                }}
              />
              <InputBlock 
                value={this.state.confirmPassword}
                placeholder="Confirm New Password" 
                onChange={this.onConfirmPasswordChange}
                secureTextEntry={true}
              />
              <ButtonBlock text='Change Password' onPress={this.onSubmit} disabled={(this.state.passwordBlur && this.state.password.length < 8) || this.state.lengthError} disabledStyles={{opacity:.3,backgroundColor:colors.orange}}>
                <>
                  <HelperText visible={this.state.passwordError} text='Incorrect current password.' />
                  <HelperText visible={this.state.passwordBlur && this.state.password.length < 8} text='Password must be more than 8 characters.' />
                  <HelperText visible={this.state.matchError} text='Passwords do not match.' />
                </>
              </ButtonBlock>
            </>
            )
          }
      </Form>
    );
  }
}

export default withTheme(ChangePassword);
