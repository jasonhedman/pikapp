import React from "react";
import {
  StyleSheet,
  Dimensions,
  Keyboard,
  TouchableWithoutFeedback,
  TouchableOpacity,
} from "react-native";
import { Block } from "galio-framework";
import {
  Button,
  TextInput,
  withTheme,
  IconButton,
  TouchableRipple,
} from "react-native-paper";
import * as firebase from "firebase";
import "firebase/firestore";
import SlideModal from "react-native-modal";
const { width, height } = Dimensions.get("screen");
import * as Permissions from "expo-permissions";
import * as ImagePicker from "expo-image-picker";
import ProfilePic from "../../components/Utility/ProfilePic";
import Form from "../../components/Utility/Form";
import ButtonBlock from "../../components/Utility/ButtonBlock";
import HeaderBlock from "../../components/Utility/HeaderBlock";
import InputBlock from "../../components/Utility/InputBlock";
import HelperText from "../../components/Utility/HelperText";
import { Header } from "react-navigation-stack";
import LoadingOverlay from "../../components/Utility/LoadingOverlay";

class EditProfile extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      name: this.props.route.params.user.name,
      username: this.props.route.params.user.username,
      image: null,
      nameBlur: false,
      usernameBlur: false,
      usernameTaken: false,
      intensity: null,
      visible: false,
      loading: false,
      showErr: false,
      imageLoaded: false,
    };
  }

  onNameChange = name => {
    this.setState({ name });
  };

  onUsernameChange = (username, func) => {
    this.setState({ username }, func);
  };

  pickImage = async () => {
    let permission = await Permissions.getAsync(Permissions.CAMERA_ROLL);
    if (permission.status != "granted") {
      permission = await Permissions.askAsync(Permissions.CAMERA_ROLL);
    }
    if (permission.status == "granted") {
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        allowsEditing: true,
        aspect: [4, 3],
      });
      if (!result.cancelled) {
        this.setState({ image: result.uri, visible: false });
      }
    } else {
      alert(
        "You cannot upload a profile picture without first allowing access to your camera roll."
      );
    }
  };

  componentDidMount() {
    Permissions.getAsync(Permissions.CAMERA_ROLL).then(permission => {
      this.setState({
        crPermission: permission.status == "granted" ? true : false,
      });
    });
    firebase
      .storage()
      .ref("profilePictures/" + this.props.route.params.user.id)
      .getDownloadURL()
      .then(url => {
        this.setState({ image: url, imageLoaded: true });
      })
      .catch(() => {
        this.setState({ image: null, imageLoaded: true });
      });
  }

  checkUsername = () => {
    firebase
      .firestore()
      .collection("users")
      .where("username", "==", this.state.username)
      .get()
      .then(users => {
        let i = 0;
        users.forEach(user => {
          i++;
        });
        if (i > 0) {
          this.setState({ usernameTaken: true });
        } else {
          this.setState({ usernameTaken: false });
        }
      })
      .catch(error => {
        console.log(error);
      });
  };

  onSubmit = () => {
    this.setState({ loading: true });
    let promise =
      this.state.image != null
        ? uploadImageAsync(this.state.image, firebase.auth().currentUser.uid)
        : firebase
            .storage()
            .ref()
            .child("profilePictures/" + firebase.auth().currentUser.uid)
            .delete()
            .catch(() => {});
    Promise.all([promise]).then(() => {
      firebase
        .firestore()
        .collection("users")
        .doc(firebase.auth().currentUser.uid)
        .update({
          name: this.state.name,
          username: this.state.username,
          updated: new Date(),
        })
        .then(() => {
          this.props.navigation.goBack();
        });
    });
  };

  removeImage = () => {
    this.setState({ image: null, visible: false });
  };

  render() {
    colors = this.props.theme.colors;
    return (
      <>
        {this.state.loading ? <LoadingOverlay /> : null}
        <SlideModal
          animationIn='slideInUp'
          transparent={true}
          isVisible={this.state.visible}
          onBackdropPress={() => this.setState({ visible: false })}
          style={{
            width,
            marginLeft: 0,
            padding: 0,
            marginBottom: 0,
            justifyContent: "flex-end",
            zIndex: 100,
          }}
          backdropColor={colors.dBlue}
          coverScreen={false}
        >
          <Block
            center
            middle
            style={{
              width,
              backgroundColor: colors.dBlue,
              borderTopWidth: 2,
              borderTopColor: colors.orange,
              alignItems: "center",
              padding: 16,
            }}
          >
            <Button
              mode='contained'
              dark={true}
              style={[styles.button]}
              onPress={this.pickImage}
              theme={{
                colors: { primary: colors.orange },
                fonts: { medium: this.props.theme.fonts.regular },
              }}
              uppercase={false}
            >
              Change New Image
            </Button>
            <HelperText
              type='error'
              visible={this.state.showErr}
              theme={{ colors: { error: colors.orange } }}
              style={this.state.showErr ? {} : { display: "none" }}
            >
              You must grant access to your camera roll first.
            </HelperText>
            <Button
              mode='text'
              dark={true}
              style={[
                styles.button,
                {
                  borderWidth: 0.5,
                  borderRadius: 8,
                  borderColor: colors.orange,
                },
              ]}
              onPress={this.removeImage}
              theme={{
                colors: { primary: colors.orange },
                fonts: { medium: this.props.theme.fonts.regular },
              }}
              uppercase={false}
            >
              Delete Image
            </Button>
          </Block>
        </SlideModal>
        <Block
          flex
          style={{ paddingTop: Header.HEIGHT, backgroundColor: colors.dBlue }}
        >
          <Form>
            <TouchableOpacity
              onPress={() => this.setState({ visible: true })}
              style={{ marginBottom: 12 }}
            >
              {this.state.imageLoaded ? (
                <ProfilePic
                  size={80}
                  proPicUrl={this.state.image}
                  addEnabled={true}
                />
              ) : null}
            </TouchableOpacity>
            <InputBlock
              value={this.state.name}
              placeholder='Name'
              onChange={this.onNameChange}
              onBlur={() => this.setState({ nameBlur: true })}
            >
              <HelperText
                visible={!this.state.name.length > 0 && this.state.nameBlur}
                text='Please enter your name.'
              />
            </InputBlock>
            <InputBlock
              value={this.state.username}
              placeholder='Username'
              onChange={val => {
                this.onUsernameChange(val.toLowerCase(), () => {
                  if (this.state.usernameBlur) {
                    this.checkUsername();
                  }
                });
              }}
              onBlur={() => {
                this.checkUsername();
                this.setState({ usernameBlur: true });
              }}
            >
              <HelperText
                visible={
                  (!this.state.username.length > 0 ||
                    this.state.usernameTaken) &&
                  this.state.usernameBlur
                }
                text={
                  this.state.username.length <= 0
                    ? "Please enter a username."
                    : this.state.usernameTaken
                    ? "This username is taken. Please try another."
                    : null
                }
              />
            </InputBlock>
            <ButtonBlock
              text='Save Changes'
              disabled={this.state.usernameTaken}
              disabledStyles={{ opacity: 0.3, backgroundColor: colors.orange }}
              onPress={this.onSubmit}
            ></ButtonBlock>
          </Form>
        </Block>
      </>
    );
  }
}

const styles = StyleSheet.create({
  createButton: {
    padding: 4,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonBlock: {
    width: "100%",
    marginTop: 8,
  },
  button: {
    borderWidth: 1,
    marginBottom:8
  },
});

async function uploadImageAsync(uri, id) {
  if (uri != null) {
    const blob = await new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.onload = function() {
        resolve(xhr.response);
      };
      xhr.onerror = function(e) {
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
      .child("profilePictures/" + id);
    const snapshot = await ref.put(blob);
    blob.close();
    return;
  }
}

export default withTheme(EditProfile);
