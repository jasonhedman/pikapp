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
              <Block style={styles.headerBlock}>
                <Headline style={{color:colors.white,textAlign:'center',marginBottom:height*.025}}>Check your email to reset your password.</Headline>
              </Block>
              <Button mode="contained" dark={true} style={styles.createButton} onPress={() => {this.props.navigation.navigate("SignIn")}} theme={{colors:{primary:colors.orange},fonts:{medium:this.props.theme.fonts.regular}}}>
                Back
              </Button>
            </>
          )
          : (
            <>
              <Block style={styles.headerBlock}>
                <Button icon='keyboard-backspace' compact={true} style={styles.backButton} onPress={() => this.props.navigation.navigate('SignIn')} mode={'text'} theme={{colors:{primary:colors.orange},fonts:{medium:this.props.theme.fonts.regular}}}></Button>
                <Headline style={{color:colors.white,textAlign:'center'}}>Forgot Password</Headline>
              </Block>
              <Block style={styles.inputBlock}>
                <TextInput
                    theme={{colors: {text:colors.white,placeholder:colors.white,underlineColor:colors.orange,selectionColor:colors.orange,primary:colors.orange}}}
                    style={styles.input}
                    mode={'outlined'}
                    placeholder="Email"
                    onChangeText={this.onModalEmailChange}
                />
              </Block>
              <Block middle center style={styles.buttonBlock}>
                <Button mode="contained" dark={true} style={styles.createButton} onPress={this.onSubmit} theme={{colors:{primary:colors.orange},fonts:{medium:this.props.theme.fonts.regular}}}>
                    Reset Password
                </Button>
                <HelperText type="error" style={this.state.error ? {} : {display:"none"}} visible={this.state.error} theme={{colors:{error:colors.orange}}}>This email is not associated with an account.</HelperText>
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
    justifyContent: "center"
  },
  input: {
    justifyContent:"center"
  },
  inputBlock:{
    width:"100%",
    marginBottom:16,
  },
  buttonBlock:{
    marginTop:8,
    width:"100%",
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
