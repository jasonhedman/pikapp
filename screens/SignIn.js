import React from "react";
import {
  StyleSheet,
  Dimensions,
  View,
  TouchableOpacity
} from "react-native";
import { Block} from "galio-framework";
import {Caption,Button,TextInput,withTheme,Text} from 'react-native-paper';
import Form from '../components/Form';
import * as firebase from 'firebase';
import ButtonBlock from '../components/ButtonBlock';
import HeaderBlock from '../components/HeaderBlock';
import InputBlock from '../components/InputBlock';
import HelperText from '../components/HelperText';


const { width, height } = Dimensions.get("screen");

class Register extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      email: "",
      password: "",
      error: false,
      modalEmail:""
    }
  }

  onEmailChange = (email) => {
    this.setState({email});
  }


  onPasswordChange = (password) => {
    this.setState({password});
  }

  onSignIn = () => {
    firebase.auth().setPersistence(firebase.auth.Auth.Persistence.LOCAL)
      .then(() => {
        firebase.auth().signInWithEmailAndPassword(this.state.email,this.state.password)
          .then(() => {
            this.props.navigation.navigate('Main');
          })
          .catch((err) => {
            this.setState({error:true})
          })
      })
      .catch(function(error) {
        this.setState({error:true})
      });
  }

  toSignUp = () => {
    this.props.navigation.navigate("SignUp")
  }

  _showDialog = () => this.setState({ error: true });

  _hideDialog = () => this.setState({ error: false });

  render() {

    colors = this.props.theme.colors;
    return (
      <View style={{height,width}}>
        <Form>
          <HeaderBlock text='Sign In' />
          <InputBlock
            value={this.state.email}
            placeholder="Email" 
            onChange={this.onEmailChange}
          />
          <InputBlock 
            value={this.state.password}
            placeholder="Password" 
            onChange={this.onPasswordChange}
            secureTextEntry={true}
          />
          <ButtonBlock onPress={this.onSignIn} text='Sign In'>
            <>
              <HelperText visible={this.state.error} text='Incorrect Email or Password.' styles={{marginBottom:8}} />
              <TouchableOpacity onPress={() => this.props.navigation.navigate("ForgotPassword")}><Text style={{color:colors.grey}}>Forgot Password?</Text></TouchableOpacity>
            </>
          </ButtonBlock>
          {/* <Block middle center style={styles.buttonBlock}>
            <Button mode="contained" dark={true} style={styles.createButton} onPress={this.onSignIn} theme={{colors:{primary:colors.orange},fonts:{medium:this.props.theme.fonts.regular}}}>
                Sign In
            </Button>
          </Block> */}
        </Form>
          <View style={{bottom: 32, position: 'absolute', zIndex: 999}}>
            <Block center middle width={width} style={{}}>
              <Caption style={{color:colors.grey}}>
                If do not already have an account
              </Caption>
              <Button mode="text" onPress={this.toSignUp} dark={true} style={styles.createButton} theme={{colors:{primary:colors.lGreen},fonts:{medium:this.props.theme.fonts.regular}}}>
                  Sign Up
              </Button>
            </Block>
          </View>
          </View>
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
    justifyContent: "center",
    marginBottom:8
  },
  input: {
    justifyContent:"center"
  },
  inputBlock:{
    width:"100%",
    marginBottom:12,
  },
  buttonBlock:{
    marginTop:8,
    width:"100%",
  },
  headerBlock:{
    marginTop:16,
    marginBottom:16
  }
});

export default withTheme(Register);
