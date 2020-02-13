import React from "react";
import {
  StyleSheet,
  Dimensions,
} from "react-native";
import { Block } from "galio-framework";

import {TextInput,withTheme} from 'react-native-paper';
import Form from '../components/Form';
import HeaderBlock from '../components/HeaderBlock';
import ButtonBlock from '../components/ButtonBlock';
import InputBlock from '../components/InputBlock';
import HelperText from '../components/HelperText';



import * as firebase from 'firebase';

const { width, height } = Dimensions.get("screen");

class Register extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      modalEmail:"",
      submitted: false,
      error:false
    }
  }

  onModalEmailChange = (modalEmail) => {
    this.setState({modalEmail:modalEmail.toLowerCase()});
  }

  onSubmit = () => {
    firebase.auth().sendPasswordResetEmail(this.state.modalEmail)
      .then(() => {
        this.setState({submitted:true})
      })
      .catch((err) => {
        this.setState({error:true})
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
              <HeaderBlock text='Check Your Email to Reset Your Password' backButton={false}/>
              <ButtonBlock onPress={() => this.props.navigation.navigate("SignIn")} text='Back'></ButtonBlock>
            </>
          )
          : (
            <>
              <HeaderBlock text='Forgot Password' backButton={true} backPress={() => this.props.navigation.navigate('SignIn')} />
              <InputBlock 
                value={this.state.modalEmail}
                placeholder="Email" 
                onChange={this.onModalEmailChange}
              />
              <ButtonBlock text='Reset Password' onPress={this.onSubmit}>
                <HelperText visible={this.state.error} text='This email is not associated with an account.' />
              </ButtonBlock>
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
    justifyContent: "center"
  },
  input: {
    justifyContent:"center"
  },
  inputBlock:{
    width:"100%",
    marginBottom:16,
  },
  headerBlock:{
    width:"100%",
    marginTop:16,
    marginBottom:16
  },
  backButton:{
    position:"absolute",
    left:0,

  }
});

export default withTheme(Register);
