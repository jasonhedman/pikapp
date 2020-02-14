import React from 'react';
import {
  StyleSheet,
  Dimensions,
  TouchableOpacity
} from 'react-native';
import {
  Block,
} from 'galio-framework';
import * as firebase from 'firebase';
import firestore from 'firebase/firestore'

const moment = require('moment');

import {withTheme,Text,Avatar} from 'react-native-paper';

const { width, height } = Dimensions.get("screen");

const defaultUser = require("../assets/images/defaultUser.jpg")
import ProfilePic from './ProfilePic';


class LobbyMember extends React.Component{
  constructor(props){
    super(props);
    this.state = {
      user:{},
      proPicUrl:null,
      complete:false
    }
  }

  componentDidMount(){
    this.setState({user:this.props.user});
    if(this.props.user != null){
      firebase.storage().ref("profilePictures/" + this.props.user.id).getDownloadURL()
        .then((url) => {
          this.setState({proPicUrl: url, complete:true});
        })
        .catch((err) => {
          this.setState({proPicUrl:null, complete:true})
        })
    }
  }

  render(){
    if(this.state.complete != false){
      return (
        <TouchableOpacity
          onPress={() => {
            if(this.props.user.id == firebase.auth().currentUser.uid){
              this.props.navToProfile();
            } else {
              this.props.navToUserProfile(this.props.user.id)
            }
          }}
        >
            <Block row middle center style={styles.container}>
              <ProfilePic size={40} addEnabled={false} proPicUrl={this.state.proPicUrl} />
              <Block flex column style={{marginLeft:12}}>
                <Text style={{color:"#FFF"}}>{this.state.user.name}</Text>
                <Text style={{color:"#FFF"}}>@{this.state.user.username}</Text>
                <Text style={{color:"#FFF"}}>{`Age: ${moment().diff(moment.unix(parseInt(this.props.user.dob.seconds)),'years',false)}`}</Text>
              </Block>
              <Text style={{color:"#FFF"}}>{this.state.user.record}</Text>
            </Block>
        </TouchableOpacity>
      );
    } else {
      return (
        <Block center middle style={styles.containerAvailable}>
          <Text style={{color:this.props.theme.colors.grey}}>Available Spot</Text>
        </Block>
      );
    }
  }
}

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderRadius: 8,
    borderColor: '#E68A54',
    padding:8,
    marginBottom: 8,
    width:'100%',
  },
  containerAvailable: {
    borderWidth: 1,
    borderRadius: 8,
    borderColor: '#FFF',
    padding:16,
    marginBottom: 8,
    width:'100%',
  }
})
export default withTheme(LobbyMember);