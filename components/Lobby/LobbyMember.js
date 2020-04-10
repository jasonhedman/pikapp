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
import { Ionicons } from '@expo/vector-icons';


const moment = require('moment');

import {withTheme,Text,Button, IconButton} from 'react-native-paper';

const { width, height } = Dimensions.get("screen");

import ProfilePic from '../Utility/ProfilePic';


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

  onPress = () => {
    if(this.props.bringingEquipment){
      firebase.firestore().collection('games').doc(this.props.gameId).update({
        equipment: firebase.firestore.FieldValue.arrayRemove(this.props.user.id)
      })
    } else {
      firebase.firestore().collection('games').doc(this.props.gameId).update({
        equipment: firebase.firestore.FieldValue.arrayUnion(this.props.user.id)
      })
    }
  }

  render(){
    let colors = this.props.theme.colors;
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
              {
                this.props.user.id == firebase.auth().currentUser.uid
                ? <IconButton
                    icon={this.props.bringingEquipment ? 'basketball' : 'cancel'}
                    color={this.props.bringingEquipment ? colors.orange : colors.white}
                    animated={true}
                    onPress={this.onPress}
                    style={{margin:0}}
                  />
                
                : <IconButton
                    icon={this.props.bringingEquipment ? 'basketball' : 'cancel'}
                    color={this.props.bringingEquipment ? colors.orange : colors.white}
                    animated={true}
                    onPress={() => {}}
                    style={{margin:0}}
                  />
                
              }
            </Block>
        </TouchableOpacity>
      );
    } else {
      return (
        <Block center middle style={styles.containerAvailable}>
          <Text style={{color:this.props.theme.colors.grey}}>Invite More Players</Text>
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