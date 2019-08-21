import React from "react";
import {
  StyleSheet,
  ImageBackground,
  Dimensions,
  StatusBar,
  KeyboardAvoidingView,
  ScrollView,
  Picker,
  Image
} from "react-native";
import { Block, Checkbox, Text, theme } from "galio-framework";

import { Button, Icon, Input, Select } from "../components";
import { Images, argonTheme } from "../constants";

import * as firebase from 'firebase';
import 'firebase/firestore';
import {ImagePicker, Permissions, Constants} from 'expo';
const { width, height } = Dimensions.get("screen");

class Register extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      email: "",
      password: "",
      name: "",
      username: "",
      age:"",
      intensity:"",
      image: null
    }
  }

  componentDidMount() {
    this.getPermissionAsync();
  }

  getPermissionAsync = async () => {
    if (Constants.platform.ios) {
      const { status } = await Permissions.askAsync(Permissions.CAMERA_ROLL);
      if (status !== 'granted') {
        alert('Sorry, we need camera roll permissions to make this work!');
      }
    }
  }

  onEmailChange = (email) => {
    this.setState({email});
  }

  onPasswordChange = (password) => {
    this.setState({password});
  }

  onNameChange = (name) => {
    this.setState({name});
  }

  onUsernameChange = (username) => {
    this.setState({username});
  }

  onAgeChange = (age) => {
    this.setState({age});
  }

  onIntensityChange = (index, intensity) => {
    this.setState({intensity});
  }

  onSignUp = () => {
    firebase.auth().createUserWithEmailAndPassword(this.state.email,this.state.password)
      .then((cred) => {
        firebase.firestore().collection('users').doc(cred.user.uid).set({
          name: this.state.name,
          username: this.state.username,
          age: parseInt(this.state.age),
          intensity: this.state.intensity,
          gameHistory: [],
          wins: 0,
          losses: 0,
        })
        return cred;
      })
      .then((cred) => {
        uploadImageAsync(this.state.image, cred)
          .then(() => {
            this.props.navigation.navigate("Main")
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
    return (
      <Block flex middle>
        <StatusBar hidden />
        <ImageBackground
          source={Images.RegisterBackground}
          style={{ width, height, zIndex: 1 }}
        >
          <Block flex middle>
            <Block style={styles.registerContainer}>
              <ScrollView flex style={styles.scrollContainer}>
                <Block flex={0.17} middle>
                  <Text h5>
                    Sign Up
                  </Text>
                </Block>
                <Block flex center>
                  <KeyboardAvoidingView
                    style={{ flex: 1 }}
                    behavior="padding"
                    enabled
                  >
                    <Block width={width * 0.8} style={{ marginBottom: 15 }}>
                      <Button
                        title="Pick an image from camera roll"
                        onPress={this._pickImage}
                      />
                      {
                        this.state.image && <Image source={{ uri: this.state.image }} style={{ width: 200, height: 200 }} />
                      }
                    </Block>
                    <Block width={width * 0.8} style={{ marginBottom: 15 }}>
                      <Input
                        borderless
                        placeholder="Name"
                        onChangeText={this.onNameChange}
                        iconContent={
                          <Icon
                            size={16}
                            color={argonTheme.COLORS.ICON}
                            name="ios-person"
                            family="Ionicons"
                            style={styles.inputIcons}
                          />
                        }
                      />
                    </Block>
                    <Block width={width * 0.8} style={{ marginBottom: 15 }}>
                      <Input
                        borderless
                        placeholder="Email"
                        onChangeText={this.onEmailChange}
                        iconContent={
                          <Icon
                            size={16}
                            color={argonTheme.COLORS.ICON}
                            name="ic_mail_24px"
                            family="ArgonExtra"
                            style={styles.inputIcons}
                          />
                        }
                      />
                    </Block>
                    <Block width={width * 0.8} style={{ marginBottom: 15 }}>
                      <Input
                        password
                        borderless
                        placeholder="Password"
                        onChangeText={this.onPasswordChange}
                        iconContent={
                          <Icon
                            size={16}
                            color={argonTheme.COLORS.ICON}
                            name="padlock-unlocked"
                            family="ArgonExtra"
                            style={styles.inputIcons}
                          />
                        }
                      />
                    </Block>
                    <Block width={width * 0.8} style={{ marginBottom: 15 }}>
                      <Input
                        borderless
                        placeholder="Username"
                        onChangeText={this.onUsernameChange}
                        iconContent={
                          <Icon
                            size={16}
                            color={argonTheme.COLORS.ICON}
                            name="ios-contacts"
                            family="Ionicons"
                            style={styles.inputIcons}
                          />
                        }
                      />
                    </Block>
                    <Block width={width * 0.8} style={{ marginBottom: 15 }}>
                      <Input
                        borderless
                        placeholder="Age"
                        onChangeText={this.onAgeChange}
                        iconContent={
                          <Icon
                            size={16}
                            color={argonTheme.COLORS.ICON}
                            name="ios-calendar"
                            family="Ionicons"
                            style={styles.inputIcons}
                          />
                        }
                        keyboardType={'numeric'}
                      />
                    </Block>
                    <Block width={width * 0.8}>
                      <Select
                        frontIcon={"ios-basketball"}
                        frontIconFamily={"Ionicons"}
                        options={["Casual", "Intermediate", "Competitive"]}
                        defaultValue="Intensity Level"
                        onSelect={this.onIntensityChange}
                        style={{width:"100%"}}
                        placeholderText={"Intesity Level"}
                      />
                    </Block>
                    <Block row width={width * 0.75}>
                      <Checkbox
                        checkboxStyle={{
                          borderWidth: 3
                        }}
                        color={argonTheme.COLORS.PRIMARY}
                        label="I agree with the"
                      />
                      <Button
                        style={{ width: 100 }}
                        color="transparent"
                        textStyle={{
                          color: argonTheme.COLORS.PRIMARY,
                          fontSize: 14
                        }}
                      >
                        Privacy Policy
                      </Button>
                    </Block>
                    <Block middle>
                      <Button color="primary" style={styles.createButton} onPress={this.onSignUp}>
                        <Text bold size={14} color={argonTheme.COLORS.WHITE}>
                          CREATE ACCOUNT
                        </Text>
                      </Button>
                    </Block>
                    <Block middle>
                      <Text color="#8898AA" size={12}>
                        Or if you already have an account
                      </Text>
                    </Block>
                    <Block middle>
                      <Button color="secondary" style={styles.createButton} onPress={this.toSignIn}>
                        <Text bold size={14} color={argonTheme.COLORS.BLACK}>
                          SIGN IN
                        </Text>
                      </Button>
                    </Block>
                  </KeyboardAvoidingView>
                </Block>
              </ScrollView>
            </Block>
          </Block>
        </ImageBackground>
      </Block>
    );
  }
}

const styles = StyleSheet.create({
  registerContainer: {
    width: width * 0.9,
    height: height * 0.78,
    backgroundColor: "#F4F5F7",
    borderRadius: 4,
    shadowColor: argonTheme.COLORS.BLACK,
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
    backgroundColor: argonTheme.COLORS.WHITE,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: "#8898AA"
  },
  socialButtons: {
    width: 120,
    height: 40,
    backgroundColor: "#fff",
    shadowColor: argonTheme.COLORS.BLACK,
    shadowOffset: {
      width: 0,
      height: 4
    },
    shadowRadius: 8,
    shadowOpacity: 0.1,
    elevation: 1
  },
  socialTextButtons: {
    color: argonTheme.COLORS.PRIMARY,
    fontWeight: "800",
    fontSize: 14
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
    width: width * 0.5,
    marginTop: 25,
    marginBottom: 25
  },
  scrollContainer: {
    marginTop: 25
  }
});

async function uploadImageAsync(uri, cred) {
  // Why are we using XMLHttpRequest? See:
  // https://github.com/expo/expo/issues/2402#issuecomment-443726662
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

export default Register;
