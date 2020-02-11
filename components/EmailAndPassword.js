import React from "react";
import {
  StyleSheet,
  Dimensions,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard
} from "react-native";
import { Block } from "galio-framework";
import {Button,TextInput,Headline,withTheme,HelperText} from 'react-native-paper';
import * as firebase from 'firebase';
import 'firebase/firestore';
import Form from './Form'

const { width, height } = Dimensions.get("screen");
class EmailAndPassword extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      email:"",
      password:"",
      error:false,
      emailBlur:false,
      passwordBlur:false,
      emailTaken:false,
      passwordConfirm:"",
      matchError:false,
    }
  }

  onEmailChange = (email, func) => {
    this.setState({email},func);
  }

  onPasswordChange = (password) => {
    this.setState({password});
  }
  onPasswordConfirmChange = (passwordConfirm) => {
    this.setState({passwordConfirm});
  }

  componentDidMount(){
    let prev = this.props.getState()[0];
    if(prev != undefined){
      this.setState({email:prev.email,password:prev.password,passwordConfirm:prev.passwordConfirm});
    }
  }

  _showDialog = () => this.setState({ error: true });

  _hideDialog = () => this.setState({ error: false });

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
        <Block style={styles.headerBlock} middle>
          <Headline style={{color:this.props.theme.colors.white}}>
            Sign Up
          </Headline>
        </Block>
        <Block style={styles.inputBlock}>
          <TextInput
            value={this.state.email}
            theme={{colors: {text:colors.white,placeholder:colors.white,underlineColor:colors.orange,selectionColor:colors.orange,primary:colors.orange}}}
            style={[styles.input]}
            mode={'outlined'}
            placeholder="Email"
            onChangeText={(val) => {
              this.onEmailChange(val.toLowerCase(), () => {
                if(this.state.emailBlur){
                  this.checkEmail()
                }
              })
            }}
            onBlur={() => {
              this.checkEmail()
              this.setState({emailBlur:true});
            }}
          />
          {
            this.state.emailBlur
            ? (
              <HelperText
                type="error"
                visible={!this.state.email.includes('@') || this.state.emailTaken}
                theme={{colors:{error:colors.orange}}}
                style={!this.state.email.includes('@') || this.state.emailTaken ? {} :{display:"none"}}
              >
                {!this.state.email.includes('@')  ? "Please enter a valid email." : this.state.emailTaken ? "This email is already in use. Please try again." : null}
              </HelperText>
            )
            : null
          }
        </Block>
        <Block style={styles.inputBlock}>
          <TextInput
            value={this.state.password}
            theme={{colors: {text:colors.white,placeholder:colors.white,underlineColor:colors.orange,selectionColor:colors.orange,primary:colors.orange}}}
            style={styles.input}
            mode={'outlined'}
            secureTextEntry={true}
            placeholder="Password"
            onChangeText={this.onPasswordChange}
            onBlur={() => {
              this.setState({passwordBlur:true});
            }}
          />
          {
            this.state.passwordBlur
            ? (
              <HelperText
                type="error"
                visible={!(this.state.password.length >= 8)}
                theme={{colors:{error:colors.orange}}}
                style={!(this.state.password.length >= 8) ? {} :{display:"none"}}
              >
                Your password must have at least 8 characters.
              </HelperText>
            )
            : null
          }
        </Block>
        <Block style={styles.inputBlock}>
          <TextInput
            value={this.state.passwordConfirm}
            theme={{colors: {text:colors.white,placeholder:colors.white,underlineColor:colors.orange,selectionColor:colors.orange,primary:colors.orange}}}
            style={styles.input}
            mode={'outlined'}
            secureTextEntry={true}
            placeholder="Confirm Password"
            onChangeText={this.onPasswordConfirmChange}
          />
          { this.state.matchError
            ? (
              <HelperText
                type="error"
                visible={this.state.matchError}
                theme={{colors:{error:colors.orange}}}
                style={this.state.matchError ? {} :{display:"none"}}
              >
                Passwords must match
              </HelperText>
            )
            : null
          }
        </Block>
        <Block row style={styles.buttonBlock}>
          <Button
            mode="contained"
            disabled={!this.state.password.length >= 8 || !this.state.email.includes("@") || this.state.emailTaken}
            onPress={() => {
                if(this.state.password == this.state.passwordConfirm){
                  this.props.saveState(0,this.state);
                  this.props.setState(this.state.email,this.state.password);
                  this.props.nextFn();
                } else {
                  this.setState({matchError:true});
                }
                
              }
            }
            style={[{marginLeft:"auto"}, this.state.password.length < 8 || !this.state.email.includes("@") || this.state.emailTaken ? {opacity: .3, backgroundColor:colors.orange} : null]} 
            theme={{colors:{primary:colors.orange},fonts:{medium:this.props.theme.fonts.regular}}}>
              Next
          </Button>
        </Block>
      </Form>
    );
  }
}

const styles = StyleSheet.create({
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
    marginBottom:12,
  },
  buttonBlock:{
    width:"100%",
    marginTop:16
  },
  headerBlock:{
    marginTop:16,
    marginBottom:16
  }
});

export default withTheme(EmailAndPassword);
