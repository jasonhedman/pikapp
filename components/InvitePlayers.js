import React from 'react';

import {TouchableWithoutFeedback,Keyboard,ScrollView,TouchableOpacity,Dimensions,StyleSheet,Share} from 'react-native';

import { Block} from "galio-framework";

import * as firebase from 'firebase';
import firestore from 'firebase/firestore';
require('firebase/functions')
import HeaderBlock from './HeaderBlock'
import moment from 'moment';


import {withTheme, Text, Headline, Subheading, Button, ActivityIndicator} from 'react-native-paper';
const { width, height } = Dimensions.get("screen");

class InvitePlayers extends React.Component{
  constructor(props){
    super(props);
    this.state = {
        users:new Array(),
        nearby:new Array(),
        followingComplete: false,
        nearbyComplete: false,
    }
  }

  componentDidMount(){
      let users = new Array();
      let gameUsers = this.props.game.teams.home.concat(this.props.game.teams.away);
      gameUsers.forEach((user,index) => {
          gameUsers[index] = user.id;
      })
      Promise.all(this.props.user.friendsList.map((user) => {
        return (
            firebase.firestore().collection('users').doc(user).get()
                .then((user) => {
                    let userData = user.data();
                    userData.id = user.id;
                    if(!gameUsers.includes(user.id)){
                        users.push(userData);
                    }
                })
        );
      }))
        .then(() => {
            this.setState({users,followingComplete:true});
            let nearby = new Object();
            Promise.all([
                firebase.firestore().collection('users')
                    .where('location.latitude', '<', this.props.user.location.latitude + (5*(1/69)))
                    .where('location.latitude', '>', this.props.user.location.latitude - (5*(1/69)))
                    .get()
                    .then((users) => {
                        users.forEach((user) => {
                            let userData = user.data();
                            userData.id = user.id;
                            nearby[user.id] = userData;
                        })
                    }),
                firebase.firestore().collection('users')
                    .where('location.longitude', '<', this.props.user.location.longitude + (5*(1/69)))
                    .where('location.longitude', '>', this.props.user.location.longitude - (5*(1/69)))
                    .get()
                    .then((users) => {
                        users.forEach((user) => {
                            let userData = user.data();
                            userData.id = user.id;
                            nearby[user.id] = userData;
                        })
                    }),
            ])
                .then(() => {
                    this.setState({nearby,nearbyComplete:true});
                })
        })
    //   this.props.user.friendsList.forEach((user) => {
    //       firebase.firestore().collection('users').doc(user).get()
    //   })
  }

  onPress = (id, user) => {
    // firebase.firestore().collection('users').doc(id).get().then((user) => {
    //     let userData = user.data();
    //     userData.id = user.id;
        firebase.firestore().collection('notifications').add({
            type: 'invite',
            game: {
                sport:this.props.game.sport,
                location:this.props.game.location
            },
            from:this.props.user,
            to: user,
            time: moment().toDate(),
            date: moment().toDate(),
            expire: moment().add(1, 'h').toDate()
        })
    // })
  }

  onFindUsersPress = () => {
    this.props.setModalVisible(false);
    this.props.toSocialScreen();
  }

  onShare = async () => {
    try {
      const result = await Share.share({
        message: 'Join me on PikApp Mobile, the newest way to organize and join pickup sports games.',
        url: "https://apps.apple.com/us/app/pikapp-mobile/id1475855291"
      });

      if (result.action === Share.sharedAction) {
        firebase.firestore().collection('users').doc(firebase.auth().currentUser.uid).update({
          points: firebase.firestore.FieldValue.increment(1)
        })
      } else if (result.action === Share.dismissedAction) {
        // dismissed
      }
    } catch (error) {
      alert(error.message);
    }
  };

  render(){
    const colors = this.props.theme.colors;
    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} style={{width:'100%'}}>
            <Block column center style={{backgroundColor:colors.dBlue, width:'100%'}}>
                <HeaderBlock text={'Invite Players'} backButton={true} backPress={() => this.props.setModalVisible(false)} />
                    <Subheading style={{color:colors.white, textAlign:'center',marginBottom:8}}>Friends</Subheading>
                    {
                        this.state.followingComplete
                        ?  this.state.users.length > 0
                            ?   <ScrollView style={styles.scrollview}>
                                    {
                                        this.state.users.map((user,key) => {
                                            return (
                                                <TouchableOpacity onPress={() => this.onPress(user.id, user)} key={key} style={{width:'100%'}}>
                                                    <Block row center middle style={{justifyContent:'space-between',borderColor:colors.orange,borderWidth:1,borderRadius:8, padding: 10, width:'100%', marginBottom:10}}>
                                                        <Block column>
                                                            <Text style={{color:"#fff"}}>{user.name}</Text>
                                                            <Text style={{color:"#fff"}}>@{user.username}</Text>
                                                        </Block>
                                                        <Text style={{color:"#fff"}}>{`${user.wins}-${user.losses}`}</Text>
                                                    </Block>
                                                </TouchableOpacity>
                                            )
                                        })
                                    }
                                    <TouchableOpacity onPress={this.onShare} style={{width:'100%',marginBottom:10}}>
                                        <Block center middle style={{borderColor:colors.orange,borderWidth:1,borderRadius:8, padding: 10, width:'100%'}}>
                                            <Text style={{color:"#fff"}}>Invite More Friends</Text>
                                        </Block>
                                    </TouchableOpacity>
                                </ScrollView>
                            :   <Block center style={{ borderColor:colors.white, borderWidth:1, borderRadius:8, width:'100%', padding:16}}>
                                    <Headline style={{color:colors.grey,fontSize:20,textAlign:'center',marginBottom:8}}>You do not follow any users.</Headline>
                                    <Button
                                        mode="contained" 
                                        dark={true}
                                        onPress={this.onFindUsersPress}
                                        theme={{colors:{primary:colors.orange},fonts:{medium:this.props.theme.fonts.regular}}}
                                    > 
                                        Find Users
                                    </Button>
                                </Block>
                        : <ActivityIndicator style={{opacity:1}} animating={true} color={this.props.theme.colors.orange} size={'small'} />
                    }
                    <Subheading style={{color:colors.white, textAlign:'center',marginBottom:8,marginTop:8}}>Nearby Players</Subheading>
                    {
                        this.state.nearbyComplete
                        ?   Object.keys(this.state.nearby).length > 0
                            ? <ScrollView style={styles.scrollview}>
                                {
                                    Object.keys(this.state.nearby).map((userId,key) => {
                                        if(this.props.user.friendsList.includes(userId) || userId == firebase.auth().currentUser.uid){
                                            return null;
                                        } else {
                                            let user = this.state.nearby[userId];
                                            return (
                                                <TouchableOpacity onPress={() => this.onPress(user.id,user)} key={key} style={{width:'100%'}}>
                                                    <Block row center middle style={{justifyContent:'space-between',borderColor:colors.orange,borderWidth:1,borderRadius:8, padding: 10, width:'100%', marginBottom:10}}>
                                                        <Block column>
                                                            <Text style={{color:"#fff"}}>{user.name}</Text>
                                                            <Text style={{color:"#fff"}}>@{user.username}</Text>
                                                        </Block>
                                                        <Text style={{color:"#fff"}}>{`${user.wins}-${user.losses}`}</Text>
                                                    </Block>
                                                </TouchableOpacity>
                                            )
                                        }
                                    })
                                }
                                <TouchableOpacity onPress={this.onShare} style={{width:'100%',marginBottom:10}}>
                                    <Block center middle style={{borderColor:colors.orange,borderWidth:1,borderRadius:8, padding: 10, width:'100%'}}>
                                        <Text style={{color:"#fff"}}>Invite More Friends</Text>
                                    </Block>
                                </TouchableOpacity>
                            </ScrollView>
                            :<Block center style={{ borderColor:colors.white, borderWidth:1, borderRadius:8, width:'100%', padding:16}}>
                                <Headline style={{color:colors.grey,fontSize:20,textAlign:'center',marginBottom:8}}>No nearby players.</Headline>
                                <Button
                                    mode="contained" 
                                    dark={true}
                                    onPress={this.onShare}
                                    theme={{colors:{primary:colors.orange},fonts:{medium:this.props.theme.fonts.regular}}}
                                > 
                                    Invite Friends
                                </Button>
                            </Block>
                        : <ActivityIndicator style={{opacity:1}} animating={true} color={this.props.theme.colors.orange} size={'small'} />
                        
                    }
            </Block>
        </TouchableWithoutFeedback>
    );
  }
}

const styles = StyleSheet.create({
    scrollview:{
        width:'100%',
        maxHeight:height*.25,
        borderRadius:8,
        borderColor:'white',
        borderWidth:1,
        padding:4,
    }
})

export default withTheme(InvitePlayers)