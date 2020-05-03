import React from "react";
import { StyleSheet } from "react-native";
import { Block } from "galio-framework";
import { Button, withTheme, TouchableRipple } from "react-native-paper";
import * as firebase from "firebase";
import "firebase/firestore";
import Form from "../Utility/Form";
import ProfilePic from "../Utility/ProfilePic";
import * as ImagePicker from "expo-image-picker";
import * as Permissions from "expo-permissions";
import InputBlock from "../Utility/InputBlock";
import HelperText from "../Utility/HelperText";

class NameAndUsername extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            name: "",
            username: "",
            image: null,
            nameBlur: false,
            usernameBlur: false,
            usernameTaken: false,
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
                this.setState({ image: result.uri });
            }
        } else {
            alert(
                "You cannot upload a profile picture without first allowing access to your camera roll."
            );
        }
    };

    componentDidMount() {
        let prev = this.props.getState()[1];
        if (prev != undefined) {
            this.setState({
                name: prev.name,
                username: prev.username,
                image: prev.image,
            });
        }
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

    render() {
        let colors = this.props.theme.colors;
        return (
            <Form>
                <Block>
                    <TouchableRipple
                        onPress={this.pickImage}
                        style={{ marginBottom: 12 }}
                    >
                        <ProfilePic
                            proPicUrl={this.state.image}
                            size={80}
                            addEnabled={true}
                        />
                    </TouchableRipple>
                    <InputBlock
                        value={this.state.name}
                        placeholder="Name"
                        onChange={this.onNameChange}
                        onBlur={() => {
                            this.setState({ nameBlur: true });
                        }}
                    >
                        <HelperText
                            visible={
                                !this.state.name.length > 0 &&
                                this.state.nameBlur
                            }
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
                </Block>
                <Block row style={styles.buttonBlock}>
                    <Button
                        onPress={() => {
                            this.props.saveState(1, this.state);
                            this.props.setState(
                                this.state.name,
                                this.state.username,
                                this.state.image
                            );
                            this.props.prevFn();
                        }}
                        uppercase={false}
                        theme={{
                            colors: { primary: colors.orange },
                            fonts: { medium: this.props.theme.fonts.regular },
                        }}
                        compact={true}
                    >
                        Back
                    </Button>
                    <Button
                        disabled={
                            this.state.name.length == 0 ||
                            this.state.username.length == 0 ||
                            this.state.usernameTaken
                        }
                        mode="contained"
                        onPress={() => {
                            this.props.saveState(1, this.state);
                            this.props.setState(
                                this.state.name,
                                this.state.username,
                                this.state.image
                            );
                            this.props.nextFn();
                        }}
                        uppercase={false}
                        style={[
                            { marginLeft: "auto" },
                            this.state.name.length == 0 ||
                            this.state.username.length == 0 ||
                            this.state.usernameTaken
                                ? {
                                      opacity: 0.3,
                                      backgroundColor: colors.orange,
                                  }
                                : null,
                        ]}
                        theme={{
                            colors: {
                                primary: colors.orange,
                                disabled: colors.white,
                            },
                            fonts: { medium: this.props.theme.fonts.regular },
                        }}
                    >
                        Next
                    </Button>
                </Block>
            </Form>
        );
    }
}

const styles = StyleSheet.create({
    buttonBlock: {
        width: "100%",
        marginTop: 16,
    },
});

export default withTheme(NameAndUsername);
