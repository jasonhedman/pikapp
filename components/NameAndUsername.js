import React from "react";
import {
  StyleSheet,
  Dimensions,
  KeyboardAvoidingView,
  View,
  TouchableWithoutFeedback,
  Keyboard
} from "react-native";
import { Block} from "galio-framework";

import {Button,TextInput,Headline,withTheme,IconButton,Avatar,TouchableRipple,HelperText} from 'react-native-paper';

import {argonTheme } from "../constants";

import * as firebase from 'firebase';
import 'firebase/firestore';

const { width, height } = Dimensions.get("screen");

import {ImagePicker} from 'expo';

class NameAndUsername extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      name: "",
      username: '',
      image: null,
      nameBlur:false,
      usernameBlur:false,
      usernameTaken:false,
    }
  }

  onNameChange = (name) => {
    this.setState({name});
  }

  onUsernameChange = (username, func) => {
    this.setState({username}, func);
  }

  pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [4, 3],
    });
    if (!result.cancelled) {
      this.setState({ image: result.uri });
    }

  };

  componentDidMount(){
    let prev = this.props.getState()[1];
    if(prev != undefined){
      this.setState({name:prev.name,username:prev.username,image:prev.image});
    }
  }

  checkUsername = () => {
    firebase.firestore().collection('users').where("username", "==", this.state.username).get()
      .then((users) => {
        let i = 0;
        users.forEach((user) => {
          i++;
        })
        if(i > 0){
          this.setState({usernameTaken:true});
        } else {
          this.setState({usernameTaken:false});
        }
      })
      .catch((error) => {
        console.log(error);
      })
  }

  render() {
    let colors = this.props.theme.colors;
    return (
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} style={{height,width}}>
        <Block center middle style={{height,width}}>
          <KeyboardAvoidingView enabled behavior="position">
            <Block center middle style={[styles.registerContainer, {backgroundColor:colors.dBlue,borderColor:colors.orange}]}>
              <Block style={styles.headerBlock} middle>
                <Headline style={{color:this.props.theme.colors.white}}>
                  Sign Up
                </Headline>
              </Block>
              <Block center middle style={{width:height*.075,height:height*.075,borderRadius:"50%",borderWidth:2,borderColor:this.props.theme.colors.orange,marginBottom:height*.015}}>
              {
                this.state.image != null
                ? (
                    <TouchableRipple onPress={this.pickImage}>
                        <Avatar.Image
                            source={{uri:this.state.image}}
                            size={height*.075-4}
                        />
                    </TouchableRipple>
                )
                : (
                    <IconButton
                        icon="add-a-photo"
                        onPress={this.pickImage}
                        color={this.props.theme.colors.white}
                        style={{margin:0}}
                    />
                )
              }
              </Block>
              <Block style={styles.inputBlock}>
                <TextInput
                  value={this.state.name}
                  theme={{colors: {text:colors.white,placeholder:colors.white,underlineColor:colors.orange,selectionColor:colors.orange,primary:colors.orange}}}
                  style={[styles.input]}
                  mode={'outlined'}
                  placeholder="Name"
                  onChangeText={this.onNameChange}
                  onBlur={() => {
                    this.setState({nameBlur:true});
                  }}
                />
                {
                  this.state.nameBlur
                  ? (
                    <HelperText
                      type="error"
                      visible={!this.state.name.length > 0}
                      theme={{colors:{error:colors.orange}}}
                    >
                      Please enter your name.
                    </HelperText>
                  )
                  : null
                }
              </Block>
              <Block style={styles.inputBlock}>
                <TextInput
                  value={this.state.username}
                  theme={{colors: {text:colors.white,placeholder:colors.white,underlineColor:colors.orange,selectionColor:colors.orange,primary:colors.orange}}}
                  style={styles.input}
                  mode={'outlined'}
                  placeholder="Username"
                  onChangeText={(val) => {
                    this.onUsernameChange(val.toLowerCase(), () => {
                      if(this.state.usernameBlur){
                        this.checkUsername()
                      }
                    });
                  }}
                  onBlur={() => {
                    this.checkUsername();
                    this.setState({usernameBlur:true});
                  }}
                />
                {
                  this.state.usernameBlur
                  ? (
                    <HelperText
                      type="error"
                      visible={!this.state.username.length > 0 || this.state.usernameTaken}
                      theme={{colors:{error:colors.orange}}}
                    >
                      {this.state.username.length <= 0 ? "Please enter a username." : this.state.usernameTaken ? "This username is taken. Please try another." : null}
                    </HelperText>
                  )
                  : null
                }
              </Block>
              <Block row style={styles.buttonBlock}>
                <Button 
                  onPress={() => {
                    this.props.saveState(1,this.state);
                    this.props.setState(this.state.name,this.state.username,this.state.image);
                    this.props.prevFn();
                  }} 
                  theme={{colors:{primary:colors.orange},fonts:{medium:this.props.theme.fonts.regular}}}
                >
                  Back
                </Button>
                <Button
                  disabled={this.state.name.length == 0 || this.state.username.length == 0 || this.state.usernameTaken}
                  mode="contained"
                  onPress={() => {
                    this.props.saveState(1,this.state);
                    this.props.setState(this.state.name,this.state.username,this.state.image);
                    this.props.nextFn();
                  }} 
                  style={[{marginLeft:"auto"}, this.state.name.length == 0 || this.state.username.length == 0 || this.state.usernameTaken ? {opacity: .3, backgroundColor:colors.orange} : null]} 
                  theme={{colors:{primary:colors.orange,disabled:colors.white},fonts:{medium:this.props.theme.fonts.regular}}}>
                    Next
                </Button>
              </Block>
            </Block>
          </KeyboardAvoidingView>
        </Block>
      </TouchableWithoutFeedback>
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
    marginBottom:height*.025,
    width: width * 0.5,
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

export default withTheme(NameAndUsername);
