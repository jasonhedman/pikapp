import React from 'react';
import * as firebase from 'firebase';
import firestore from 'firebase/firestore'
import {withTheme, Button} from 'react-native-paper';
import { Block } from 'galio-framework';

class FollowButton extends React.Component{
  constructor(props){
    super(props);
  }

    follow = () => {
        firebase.firestore().collection('users').doc(firebase.auth().currentUser.uid).update({
            friendsList: firebase.firestore.FieldValue.arrayUnion(this.props.userId)
        })
        firebase.firestore().collection('users').doc(this.props.userId).update({
            followers: firebase.firestore.FieldValue.arrayUnion(firebase.auth().currentUser.uid)
        })
    }

    unfollow = () => {
        firebase.firestore().collection('users').doc(firebase.auth().currentUser.uid).update({
            friendsList: firebase.firestore.FieldValue.arrayRemove(this.props.userId)
        })
        firebase.firestore().collection('users').doc(this.props.userId).update({
            followers: firebase.firestore.FieldValue.arrayRemove(firebase.auth().currentUser.uid)
        })
    }   


  render(){
    let colors = this.props.theme.colors;
    if(this.props.followers.includes(firebase.auth().currentUser.uid)){
        return (
            <Block style={{borderWidth:.5, borderRadius:8, borderColor:colors.white}}>
                <Button
                    mode='text'
                    dark={true}
                    compact={true}
                    color={colors.white}
                    labelStyle={{fontSize:12}}
                    onPress={this.unfollow}
                    uppercase={false}
                >
                    Following
                </Button>
            </Block>
        );
      } else {
        return (
            <Button
                mode='contained'
                dark={true}
                compact={true}
                color={colors.orange}
                labelStyle={{fontSize:12}}
                onPress={this.follow}
                uppercase={false}
            >
                Follow
            </Button>
        );
      }
    }
}


export default withTheme(FollowButton);