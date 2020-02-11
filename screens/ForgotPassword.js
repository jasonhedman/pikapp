import React from "react";
import {
  StyleSheet,
  Dimensions,
  Keyboard,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  View
} from "react-native";
import { Block } from "galio-framework";

import {Button,TextInput,Headline,withTheme,HelperText} from 'react-native-paper';
import Form from '../components/Form';
import HeaderBlock from '../components/HeaderBlock';
import ButtonBlock from '../components/ButtonBlock';


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
              <Block style={styles.inputBlock}>
                <TextInput
                    theme={{colors: {text:colors.white,placeholder:colors.white,underlineColor:colors.orange,selectionColor:colors.orange,primary:colors.orange}}}
                    style={styles.input}
                    mode={'outlined'}
                    placeholder="Email"
                    onChangeText={this.onModalEmailChange}
                />
              </Block>
              <ButtonBlock text='Reset Password' onPress={this.onSubmit}>
                <HelperText type="error" style={this.state.error ? {} : {display:"none"}} visible={this.state.error} theme={{colors:{error:colors.orange}}}>This email is not associated with an account.</HelperText>
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
