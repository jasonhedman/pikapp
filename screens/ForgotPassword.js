import React from "react";
import {
  StyleSheet,
  Dimensions,
  Keyboard,
  TouchableWithoutFeedback
} from "react-native";
import { Block } from "galio-framework";

import {Caption,Button,TextInput,Headline,withTheme,Portal,Dialog,HelperText,Modal, Subheading} from 'react-native-paper';


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
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <Block flex center middle style={{width,backgroundColor:colors.dBlue}}>
            <Block center middle style={{width:width*.9,padding: 10, paddingBottom: height*.025,borderWidth:2, borderRadius:8, borderColor:colors.orange}}>
              {
                this.state.submitted
                ? (
                  <>
                    <Headline style={{color:colors.white,textAlign:'center',marginBottom:height*.025}}>Check your email to reset your password.</Headline>
                    <Button mode="contained" dark={true} style={styles.createButton} onPress={() => {this.props.navigation.navigate("SignIn")}} theme={{colors:{primary:colors.orange},fonts:{medium:this.props.theme.fonts.regular}}}>
                      Back
                    </Button>
                  </>
                )
                : (
                  <>
                    <Block middle style={{marginRight:"auto"}}>
                      <Button icon='navigate-before' onPress={() => this.props.navigation.navigate('SignIn')} mode={'text'} theme={{colors:{primary:colors.orange},fonts:{medium:this.props.theme.fonts.regular}}} style={{marginRight:'auto'}}>
                          
                      </Button>
                    </Block>
                    <Headline style={{color:colors.white,textAlign:'center',marginBottom:height*.025}}>Forgot Password</Headline>
                    <TextInput
                        theme={{colors: {text:colors.white,placeholder:colors.white,underlineColor:colors.orange,selectionColor:colors.orange,primary:colors.orange}}}
                        style={[styles.input]}
                        mode={'outlined'}
                        placeholder="Email"
                        onChangeText={this.onModalEmailChange}
                    />
                    <Button mode="contained" dark={true} style={styles.createButton} onPress={this.onSubmit} theme={{colors:{primary:colors.orange},fonts:{medium:this.props.theme.fonts.regular}}}>
                        Reset Password
                    </Button>
                    <HelperText type="error" visible={this.state.error} theme={{colors:{error:colors.orange}}}>This email is not associated with an account.</HelperText>
                  </>
                )
              }
            </Block>
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
    marginBottom:height*.035
  }
});

export default withTheme(Register);
