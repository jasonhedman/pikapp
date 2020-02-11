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
import {Button,TextInput,Headline,withTheme,IconButton,Avatar,TouchableRipple,HelperText,Menu} from 'react-native-paper';
import * as firebase from 'firebase';
import 'firebase/firestore';
import SlideModal from 'react-native-modal';
const { width, height } = Dimensions.get("screen");
import * as Permissions from 'expo-permissions';
import * as ImagePicker from 'expo-image-picker';
import ProfilePic from './ProfilePic';
import Form from './Form';

class EditProfile extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      name: "",
      username: '',
      image: null,
      nameBlur:false,
      usernameBlur:false,
      usernameTaken:false,
      intensity:null,
      visible:false,
      loading:false,
      showErr:false
    }
  }

  onNameChange = (name) => {
    this.setState({name});
  }

  onUsernameChange = (username, func) => {
    this.setState({username}, func);
  }

  pickImage = async () => {
    if(this.state.crPermission){
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        allowsEditing: true,
        aspect: [4, 3],
      });
      if (!result.cancelled) {
        this.setState({ image: result.uri,visible:false,showErr:false });
      }
    } else {
      this.setState({showErr:true});
    }
    
  };

  componentDidMount(){
    Permissions.getAsync(Permissions.CAMERA_ROLL)
      .then((permission) => {
        this.setState({image:this.props.proPicUrl,name:this.props.user.name,username:this.props.user.username,crPermission:permission.status=='granted'?true:false})
      })
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

  onSubmit = () => {
    firebase.firestore().collection('users').doc(firebase.auth().currentUser.uid).update({
      name: this.state.name,
      username: this.state.username,
    })
      .then(() => {
        this.props.closeModal(() => {
          if(this.state.image != this.props.proPicUrl){
            if(this.state.image != null){
              uploadImageAsync(this.state.image,firebase.auth().currentUser.uid)
              .then(() => {
                this.props.setImage(this.state.image, () => this.props.finishUpload());
              })
            } else {
              firebase.storage().ref().child("profilePictures/" + firebase.auth().currentUser.uid).delete()
              .then(() => {
                this.props.setImage(this.state.image, () => this.props.finishUpload())
              })
              .catch((err) => console.log(err));
            }
          } else {
            this.props.finishUpload();
          }
        });
      })
  }

  removeImage = () => {
    this.setState({image:null,visible:false});
  }

  render() {
    colors = this.props.theme.colors;
      return(
        <>
          {
            this.state.loading
            ? <LoadingOverlay />
            : null
          }
          <SlideModal
            animationType="slide"
            transparent={true}
            isVisible={this.state.visible}
            onBackdropPress={() => this.setState({visible:false})}
            style={{}}
            backdropColor={colors.dBlue}
            coverScreen={true}
          >
            <Block center middle style={{width,backgroundColor:colors.dBlue,borderTopWidth:2,borderTopColor:colors.orange,marginTop:'auto', paddingBottom:32, paddingTop:16}}>
              <Block middle center style={styles.buttonBlock}>
                <Button mode="contained" dark={true} style={[styles.createButton]} onPress={this.pickImage} theme={{colors:{primary:colors.orange},fonts:{medium:this.props.theme.fonts.regular}}}>
                    Choose New Image
                </Button>
                <HelperText
                  type="error"
                  visible={this.state.showErr}
                  theme={{colors:{error:colors.orange}}}
                  style={this.state.showErr ? {} :{display:"none"}}
                >
                  Grant access to your camera roll first.
                </HelperText>
              </Block>
              <Block middle center style={styles.buttonBlock}>
                <Button mode="text" dark={true} style={styles.createButton} onPress={this.removeImage} theme={{colors:{primary:colors.orange},fonts:{medium:this.props.theme.fonts.regular}}}>
                    Delete Image
                </Button>
              </Block>
            </Block>
          </SlideModal>
          <Form>
            <Block center style={styles.headerBlock}>
              <Button onPress={() => this.props.close()} mode={'text'} compact={true} icon={'keyboard-backspace'} theme={{colors:{primary:colors.orange}}} style={{position:'absolute', left:-8,top:0, padding:0}}>
              </Button>
              <Headline style={{color:this.props.theme.colors.white}}>
                  Edit Profile
              </Headline>
            </Block>
            <TouchableRipple 
              onPress={() => this.setState({visible:true})}
              style={{marginBottom:12}}
            >
              <ProfilePic size={75} proPicUrl={this.state.image} />
            </TouchableRipple>
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
                    style={!this.state.name.length > 0 ? {} :{display:"none"}}
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
                    style={!this.state.username.length > 0 || this.state.usernameTaken ? {} :{display:"none"}}
                  >
                    {this.state.username.length <= 0 ? "Please enter a username." : this.state.usernameTaken ? "This username is taken. Please try another." : null}
                  </HelperText>
                )
                : null
                }
            </Block>
            <Block middle center style={styles.buttonBlock}>
              <Button 
                disabled={this.state.usernameTaken} 
                mode="contained" 
                dark={true} 
                style={[styles.createButton, this.state.usernameTaken ? {opacity: .3, backgroundColor:colors.orange} : null]} 
                onPress={this.onSubmit} 
                theme={{colors:{primary:colors.orange},
                fonts:{medium:this.props.theme.fonts.regular}}}
              >
                  Save Changes
              </Button>
            </Block>
          </Form>
        </>
      );
    }
}

const styles = StyleSheet.create({
  disabled:{
    opacity: .3, 
    backgroundColor:'#E68A54'
  },
  registerContainer: {
    width: width * 0.9,
    borderRadius: 8,
    borderWidth: 2,
    padding:16,
  },
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
    marginTop:8
  },
  headerBlock:{
    width:"100%",
    marginTop:16,
    marginBottom:16
  },
});

async function uploadImageAsync(uri, id) {
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
  
    const ref = firebase.storage().ref().child("profilePictures/" + id);
    const snapshot = await ref.put(blob);
  
    // We're done with the blob, close and release it
    blob.close();
  }
}


export default withTheme(EditProfile);