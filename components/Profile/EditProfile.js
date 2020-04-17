import React from "react";
import {
  StyleSheet,
  Dimensions,
  Keyboard,
  TouchableWithoutFeedback,
  TouchableOpacity,
} from "react-native";
import { Block } from "galio-framework";
import { Button, withTheme } from "react-native-paper";
import * as firebase from "firebase";
import "firebase/firestore";
import SlideModal from "react-native-modal";
const { width, height } = Dimensions.get("screen");
import * as Permissions from "expo-permissions";
import * as ImagePicker from "expo-image-picker";
import ProfilePic from "../Utility/ProfilePic";
import ButtonBlock from "../Utility/ButtonBlock";
import HeaderBlock from "../Utility/HeaderBlock";
import InputBlock from "../Utility/InputBlock";
import HelperText from "../Utility/HelperText";

class EditProfile extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      name: "",
      username: "",
      image: null,
      nameBlur: false,
      usernameBlur: false,
      usernameTaken: false,
      intensity: null,
      visible: false,
      loading: false,
      showErr: false,
    };
  }

  onNameChange = (name) => {
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
    Permissions.getAsync(Permissions.CAMERA_ROLL).then((permission) => {
      this.setState({
        image: this.props.proPicUrl,
        name: this.props.user.name,
        username: this.props.user.username,
        crPermission: permission.status == "granted" ? true : false,
      });
    });
  }

  checkUsername = () => {
    firebase
      .firestore()
      .collection("users")
      .where("username", "==", this.state.username)
      .get()
      .then((users) => {
        let i = 0;
        users.forEach((user) => {
          i++;
        });
        if (i > 0) {
          this.setState({ usernameTaken: true });
        } else {
          this.setState({ usernameTaken: false });
        }
      })
      .catch((error) => {
        console.log(error);
      });
  };

  onSubmit = () => {
    firebase
      .firestore()
      .collection("users")
      .doc(firebase.auth().currentUser.uid)
      .update({
        name: this.state.name,
        username: this.state.username,
      })
      .then(() => {
        this.props.closeModal(() => {
          if (this.state.image != this.props.proPicUrl) {
            if (this.state.image != null) {
              uploadImageAsync(
                this.state.image,
                firebase.auth().currentUser.uid
              ).then(() => {
                this.props.setImage(this.state.image, () =>
                  this.props.finishUpload()
                );
              });
            } else {
              firebase
                .storage()
                .ref()
                .child("profilePictures/" + firebase.auth().currentUser.uid)
                .delete()
                .then(() => {
                  this.props.setImage(this.state.image, () =>
                    this.props.finishUpload()
                  );
                })
                .catch((err) => console.log(err));
            }
          } else {
            this.props.finishUpload();
          }
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
          animationType="slide"
          transparent={true}
          isVisible={this.state.visible}
          onBackdropPress={() => this.setState({ visible: false })}
          style={{}}
          backdropColor={colors.dBlue}
          coverScreen={true}
        >
          <Block
            center
            middle
            style={{
              width,
              backgroundColor: colors.dBlue,
              borderTopWidth: 2,
              borderTopColor: colors.orange,
              marginTop: "auto",
              paddingBottom: 32,
              paddingTop: 16,
            }}
          >
            <ButtonBlock
              text="Choose New Image"
              onPress={this.pickImage}
              uppercase={false}
            >
              <HelperText
                type="error"
                visible={this.state.showErr}
                theme={{ colors: { error: colors.orange } }}
                style={this.state.showErr ? {} : { display: "none" }}
              >
                You must grant access to your camera roll first.
              </HelperText>
            </ButtonBlock>
            <Block middle center style={styles.buttonBlock}>
              <Button
                mode="text"
                dark={true}
                style={styles.createButton}
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
          </Block>
        </SlideModal>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <Block
            middle
            dstyle={{
              backgroundColor: colors.dBlue,
              borderColor: colors.orange,
              borderWidth: 2,
              borderRadius: 8,
              padding: 16,
            }}
          >
            <HeaderBlock
              text="Edit Profile"
              backButton={true}
              backPress={() => this.props.close()}
            />
            <TouchableOpacity
              onPress={() => this.setState({ visible: true })}
              style={{ marginBottom: 12 }}
            >
              <>
                <ProfilePic
                  size={80}
                  proPicUrl={this.state.image}
                  addEnabled={true}
                />
              </>
            </TouchableOpacity>
            <InputBlock
              value={this.state.name}
              placeholder="Name"
              onChange={this.onNameChange}
              onBlur={() => this.setState({ nameBlur: true })}
            >
              <HelperText
                visible={!this.state.name.length > 0 && this.state.nameBlur}
                text="Please enter your name."
              />
            </InputBlock>
            <InputBlock
              value={this.state.username}
              placeholder="Username"
              onChange={(val) => {
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
              text="Save Changes"
              disabled={this.state.usernameTaken}
              disabledStyles={{ opacity: 0.3, backgroundColor: colors.orange }}
              onPress={this.onSubmit}
            ></ButtonBlock>
          </Block>
        </TouchableWithoutFeedback>
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
});

async function uploadImageAsync(uri, id) {
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
      .child("profilePictures/" + id);
    const snapshot = await ref.put(blob);

    // We're done with the blob, close and release it
    blob.close();
  }
}

export default withTheme(EditProfile);
