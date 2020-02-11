import React from "react";
import {
  StyleSheet,
  Dimensions,
  View,
} from "react-native";
import { Block} from "galio-framework";
import MultiStep from "react-native-multistep-wizard";
import {Caption,Button,withTheme} from 'react-native-paper';


import NameAndUsername from '../components/NameAndUsername';
import EmailAndPassword from '../components/EmailAndPassword';
import AgeAndIntensity from '../components/AgeAndIntensity';


import * as firebase from 'firebase';
import firestore from 'firebase/firestore';
import Constants from 'expo-constants'
import * as Permissions from 'expo-permissions'
import {ImagePicker} from 'expo';
const { width, height } = Dimensions.get("screen");

class Register extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      email: "",
      password: "",
      name: "",
      username: "",
      dob:"",
      intensity:"",
      image: null,
      isLastStep  : false,
      isFirstStep : false,
      currentIndex: 0,
      currentInput: null
    }
  }

  // componentDidMount() {
  //   this.getPermissionAsync();
    
  // }


  // getPermissionAsync = async () => {
  //   if (Constants.platform.ios) {
  //     const { status } = await Permissions.askAsync(Permissions.CAMERA_ROLL);
  //     if (status !== 'granted') {
  //       alert('Sorry, we need camera roll permissions to make this work!');
  //     }
  //   }
  // }

  setNameAndUsername = (name,username,image) => {
    this.setState({name,username,image});
  }

  setEmailAndPassword = (email,password,passwordConfirm) => {
    this.setState({email,password,passwordConfirm});
  }

  setDob = (dob,func) => {
    this.setState({dob},func);
  }

  onSignUp = () => {    
    firebase.auth().createUserWithEmailAndPassword(this.state.email,this.state.password)
      .then((cred) => {
        firebase.firestore().collection('users').doc(cred.user.uid).set({
          name: this.state.name,
          currentGame:null,
          username: this.state.username,
          dob: this.state.dob,
          gameHistory: [],
          wins: 0,
          losses: 0,
          points:0,
          email: this.state.email,
          sports:{
            basketball: {
              wins:0,
              losses:0,
              ptsFor: 0,
              ptsAgainst:0
            },
            football: {
              wins:0,
              losses:0,
              ptsFor: 0,
              ptsAgainst:0
            },
            spikeball: {
              wins:0,
              losses:0,
              ptsFor: 0,
              ptsAgainst:0
            },
            volleyball: {
              wins:0,
              losses:0,
              ptsFor: 0,
              ptsAgainst:0
            },
            soccer: {
              wins:0,
              losses:0,
              ptsFor: 0,
              ptsAgainst:0
            },
          },
          friendsList:[],
          followers:[]
        })
        .then(() => {
          uploadImageAsync(this.state.image, cred)
        })
      })
      .catch((err) => {
        console.error(err.toString());
      })
  }

  toSignIn = () => {
    this.props.navigation.navigate("SignIn");
  }

  _pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [4, 3],
    });
    if (!result.cancelled) {
      this.setState({ image: result.uri });
    }

  };

  render() {
    //if image is null submit default image
    let colors = this.props.theme.colors;    
    return (
      <View style={{flex:1}}>
        <MultiStep 
          onFinish={() => {this.onSignUp()}}
          steps={[
            {name: 'StepOne', component: <EmailAndPassword setState={this.setEmailAndPassword}/>},
            {name: 'StepTwo', component: <NameAndUsername setState={this.setNameAndUsername} pickImage={this._pickImage}/>},
            {name: "StepThree", component: <AgeAndIntensity setState={this.setDob}/>},
            
          ]} 
        />
        <View style={{bottom: height*.025, position: 'absolute', zIndex: 999}}>
          <Block center middle height={height*.1} width={width} style={{}}>
            <Caption style={{color:colors.grey}}>
              If you already have an account
            </Caption>
            <Button mode="text" onPress={this.toSignIn} dark={true} style={styles.createButton} theme={{colors:{primary:colors.lGreen},fonts:{medium:this.props.theme.fonts.regular}}}>
                Sign In
            </Button>
          </Block>
          <Block middle>
            
          </Block>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  registerContainer: {
    width: width * 0.9,
    height: height * 0.5,
    borderRadius: 8,
    borderWidth: 2,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4
    },
    shadowRadius: 8,
    shadowOpacity: 0.1,
    elevation: 1,
    overflow: "hidden"
  },
  socialConnect: {
    backgroundColor: "#FFF",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: "#8898AA"
  },
  socialButtons: {
    width: 120,
    height: 40,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4
    },
    shadowRadius: 8,
    shadowOpacity: 0.1,
    elevation: 1
  },
  inputIcons: {
    marginRight: 12
  },
  passwordCheck: {
    paddingLeft: 15,
    paddingTop: 13,
    paddingBottom: 30
  },
  createButton: {
    marginBottom:height*.025,
    height: height * .05,
    width: width * 0.5,
    alignItems: "center",
    justifyContent: "center"
  },
  input: {
    height: height*.075,
    justifyContent:"center"
  }
});

async function uploadImageAsync(uri, cred) {
  if(uri != null) {
    const blob = await new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.onload = function() {
        resolve(xhr.response);
      };
      xhr.onerror = function(e) {
        console.log(e);
        reject(new TypeError('Network request failed'));
      };
      xhr.responseType = 'blob';
      xhr.open('GET', uri, true);
      xhr.send(null);
    });
  
    const ref = firebase.storage().ref().child("profilePictures/" + cred.user.uid);
    const snapshot = await ref.put(blob);
  
    // We're done with the blob, close and release it
    blob.close();
  }
}

export default withTheme(Register);
