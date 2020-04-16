import React from 'react';

import {TouchableWithoutFeedback,Keyboard,ScrollView,TouchableOpacity,Dimensions,StyleSheet,Share} from 'react-native';

import { Block} from "galio-framework";

import * as firebase from 'firebase';
import firestore from 'firebase/firestore';
require('firebase/functions')
import HeaderBlock from '../Utility/HeaderBlock'
import moment from 'moment';
import {getDistance} from 'geolib';
import onShare from "../../services/onShare";


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
        nearbySortedKeys: new Array(),
        friendsSortedKeys: new Array(),
    }
  }

  componentDidMount(){
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
            let nearbySortedKeys = Object.keys(nearby).sort((a,b) => {return getDistance(nearby[a].location, this.props.user.location) - getDistance(nearby[b].location, this.props.user.location)})
            this.setState({nearby,nearbyComplete:true,nearbySortedKeys});
        })
  }

  onPress = (id, user) => {
    firebase.firestore().collection('notifications').add({
        type: 'invite',
        game: {
            sport:this.props.game.sport,
            location:this.props.game.location
        },
        from:this.props.user,
        to: user,
        time: moment().toDate(),
        expire: moment.unix(parseInt(this.props.game.startTime.time.seconds)).add(1, 'h').toDate()
    })
  }

  onFindUsersPress = () => {
    this.props.setModalVisible(false);
    this.props.toSocialScreen();
  }

  render(){
    const colors = this.props.theme.colors;
    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} style={{width:'100%'}}>
            <Block column center style={{backgroundColor:colors.dBlue, width:'100%'}}>
                <HeaderBlock text={'Nearby Players'} backButton={true} backPress={() => this.props.setModalVisible(false)} />
                    {/* <Subheading style={{color:colors.white, textAlign:'center',marginBottom:8,marginTop:8}} theme={{fonts:{medium:this.props.theme.fonts.regular}}}>Nearby Players</Subheading> */}
                    {
                        this.state.nearbyComplete
                        ?   Object.keys(this.state.nearby).length > 0
                            ? <ScrollView style={styles.scrollview}>
                                {
                                    this.state.nearbySortedKeys.map((userId,key) => {
                                        if(this.props.user.friendsList.includes(userId) || userId == firebase.auth().currentUser.uid){
                                            return null;
                                        } else {
                                            let user = this.state.nearby[userId];
                                            let distance;
                                            if(user.location != undefined){
                                                distance = Math.round(getDistance(user.location, this.props.user.location) * 0.000621371);
                                            } else {
                                                distance = null
                                            }
                                            return (
                                                <TouchableOpacity onPress={() => this.onPress(user.id,user)} key={key} style={{width:'100%'}}>
                                                    <Block row center middle style={{justifyContent:'space-between',borderColor:colors.orange,borderWidth:1,borderRadius:8, padding: 10, width:'100%', marginBottom:10}}>
                                                        <Block column>
                                                            <Text style={{color:"#fff"}}>{user.name}</Text>
                                                            <Text style={{color:"#fff"}}>@{user.username}</Text>
                                                        </Block>
                                                        <Text style={{color:"#fff"}}>{`${distance != null ? (distance < 1 ? "<1" : distance) : user.points} ${distance != null ? (distance < 2 ? "Mile Away" : "Miles Away") : (user.points == 1 ? "Point" : "Points")}`}</Text>
                                                    </Block>
                                                </TouchableOpacity>
                                            )
                                        }
                                    })
                                }
                                <TouchableOpacity onPress={onShare} style={{width:'100%',marginBottom:10}}>
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
                                    onPress={onShare}
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
        maxHeight:height*.5,
        borderRadius:8,
        padding:4,
    }
})

export default withTheme(InvitePlayers)