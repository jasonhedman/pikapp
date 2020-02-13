import React from "react";
import {
  StyleSheet,
  Dimensions,
} from "react-native";
import { Block } from "galio-framework";
import {Button,TextInput,withTheme} from 'react-native-paper';
import * as firebase from 'firebase';
import 'firebase/firestore';
import Form from './Form'
import HeaderBlock from './HeaderBlock';
import InputBlock from './InputBlock';
import HelperText from './HelperText';

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
      passwordConfirmBlur:false,
      matchError:false
    }
  }

  onEmailChange = (email, func) => {
    this.setState({email},func);
  }

  onPasswordChange = (password) => {
    this.setState({password});
  }
  onPasswordConfirmChange = (passwordConfirm) => {
    this.setState({passwordConfirm}, () => {
      if(this.state.password != this.state.passwordConfirm){
        this.setState({matchError:true});
      } else {
        this.setState({matchError:false});
      }
    });
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
        <HeaderBlock text='Sign Up' />
        <InputBlock 
          value={this.state.email}
          placeholder="Email" 
          onChange={(val) => {
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
        >
          <HelperText visible={(!this.state.email.includes('@') || this.state.emailTaken)&&this.state.emailBlur} text={!this.state.email.includes('@')  ? "Please enter a valid email." : this.state.emailTaken ? "This email is already in use. Please try again." : null} />
        </InputBlock>
        <InputBlock 
          value={this.state.password}
          placeholder="Password" 
          onChange={this.onPasswordChange}
          onBlur={() => {
            this.setState({passwordBlur:true});
          }}
          secureTextEntry={true}
        >
          <HelperText visible={(!(this.state.password.length >= 8))&&this.state.passwordBlur} text={'Your password must have at least 8 characters.'} />
        </InputBlock>
        <InputBlock 
          value={this.state.passwordConfirm}
          placeholder="Confirm Password" 
          onChange={this.onPasswordConfirmChange}
          onBlur={() => {
            this.setState({passwordConfirmBlur:true});
          }}
          secureTextEntry={true}
        >
          <HelperText visible={this.state.matchError && this.state.passwordConfirmBlur} text={'Passwords must match.'} />
        </InputBlock>
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
