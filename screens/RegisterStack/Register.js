import React from "react";
import { StyleSheet, Dimensions, SafeAreaView } from "react-native";
import { Block } from "galio-framework";
import MultiStep from "../../components/SignUp/Wizard";
import { Caption, Button, withTheme } from "react-native-paper";

import NameAndUsername from "../../components/SignUp/NameAndUsername";
import EmailAndPassword from "../../components/SignUp/EmailAndPassword";
import AgeAndIntensity from "../../components/SignUp/AgeAndIntensity";

import * as firebase from "firebase";
import { ImagePicker } from "expo";
const { width, height } = Dimensions.get("screen");

class Register extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      email: "",
      password: "",
      name: "",
      username: "",
      dob: "",
      intensity: "",
      image: null,
      isLastStep: false,
      isFirstStep: false,
      currentIndex: 0,
      currentInput: null,
    };
  }

  setNameAndUsername = (name, username, image) => {
    this.setState({ name, username, image });
  };

  setEmailAndPassword = (email, password, passwordConfirm) => {
    this.setState({ email, password, passwordConfirm });
  };

  setDob = (dob, func) => {
    this.setState({ dob }, func);
  };

  onSignUp = () => {
    firebase
      .auth()
      .createUserWithEmailAndPassword(this.state.email, this.state.password)
      .then((cred) => {
        firebase.firestore().collection('users').doc(cred.user.uid).set({
          id: cred.user.uid,
          name: this.state.name,
          username: this.state.username,
          dob: this.state.dob,
          gameHistory: [],
          wins: 0,
          losses: 0,
          points:0,
          gamesPlayed:0,
          email: this.state.email,
          proPicUrl: null,
          notifications: [],
          calendar: [],
          sports:{
            basketball: {
              gamesPlayed:0,
            },
            football: {
              gamesPlayed:0,
            },
            spikeball: {
              gamesPlayed:0,
            },
            volleyball: {
              gamesPlayed:0,
            },
            soccer: {
              gamesPlayed:0,
            },
            frisbee: {
              gamesPlayed:0,
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
      });
  };

  toSignIn = () => {
    this.props.navigation.navigate("SignIn");
  };

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
    let colors = this.props.theme.colors;
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.dBlue }}>
        <MultiStep
          onFinish={() => {
            this.onSignUp();
          }}
          steps={[
            {
              name: "StepOne",
              component: (
                <EmailAndPassword setState={this.setEmailAndPassword} />
              ),
            },
            {
              name: "StepTwo",
              component: (
                <NameAndUsername
                  setState={this.setNameAndUsername}
                  pickImage={this._pickImage}
                />
              ),
            },
            {
              name: "StepThree",
              component: <AgeAndIntensity setState={this.setDob} />,
            },
          ]}
        />
        <Block center middle width={width} style={{}}>
          <Caption style={{ color: colors.grey }}>
            If you already have an account
          </Caption>
          <Button
            uppercase={false}
            mode="text"
            onPress={this.toSignIn}
            dark={true}
            style={styles.createButton}
            theme={{
              colors: { primary: colors.lGreen },
              fonts: { medium: this.props.theme.fonts.regular },
            }}
          >
            Sign In
          </Button>
        </Block>
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  createButton: {
    padding: 4,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
});

async function uploadImageAsync(uri, cred) {
  if (uri != null) {
    const blob = await new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.onload = function () {
        resolve(xhr.response);
      };
      xhr.onerror = function (e) {
        console.log(e);
        reject(new TypeError("Network request failed"));
      };
      xhr.responseType = "blob";
      xhr.open("GET", uri, true);
      xhr.send(null);
    });

    const ref = firebase
      .storage()
      .ref()
      .child("profilePictures/" + cred.user.uid);
    const snapshot = await ref.put(blob);
    blob.close();
    ref.getDownloadURL().then((url) =>
      firebase.firestore().collection("users").doc(cred.user.uid).update({
        proPicUrl: url,
      })
    );
  }
}

export default withTheme(Register);
