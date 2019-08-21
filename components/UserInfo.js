import React from "react";
import {
  StyleSheet,
  Dimensions,
  ScrollView,
  View
} from "react-native";
import { Block } from "galio-framework";

import GameResult from "../components/GameResult";
import SportsTabs from "../components/SportsTabs";


import LoadingOverlay from '../components/LoadingOverlay';

const { width, height } = Dimensions.get("window");

import * as firebase from 'firebase';
import 'firebase/firestore';

import {withTheme,Text,Avatar,Button,Headline, Subheading} from 'react-native-paper';

import {TabView,SceneMap} from 'react-native-tab-view';

const defaultUser = require("../assets/images/defaultUser.jpg")

class UserInfo extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      user: {},
      proPicUrl: null,
      lastThree: new Array(),
      complete:false,
      editModalVisible:false,
      loading:false
    }
  }

  componentDidMount(){
    this.setState({user:this.props.user,currentUser:this.props.currentUser}, () => {
        let lastThree = [];
        for(let i = this.state.user.gameHistory.length - 1; i >= (this.state.user.gameHistory.length >= 3?this.state.user.gameHistory.length-3:0);i--){
            firebase.firestore().collection("games").doc(this.state.user.gameHistory[i].id).get()
                .then((game) => {
                    lastThree.push(game.data());
                    this.setState({lastThree});
                });
        } 
        firebase.storage().ref("profilePictures/" + this.props.user.id).getDownloadURL()
          .then((url) => {
            this.setState({proPicUrl: url,complete:true});
          })
          .catch((err) => {
            this.setState({complete:true});
          })
    })
  }
  
  getLastTen(){
    if(this.state.user.gameHistory != undefined){
      let wins = 0;
      let i;
      for(i = this.state.user.gameHistory.length - 1; i > this.state.user.gameHistory.length - 10; i--){
        if(i < 0){
          return `${wins}-${this.state.user.gameHistory.length - wins}`;
        }
        if(this.state.user.gameHistory[i].win){
          wins++;
        }
      }
      return `${wins}-${10-wins}`
    } else {
      return null;
    }
  }

  addFriend = () => {
    let currentUser = this.state.currentUser;
    currentUser.friendsList.push(this.props.user.id);
    this.setState({currentUser}, () => {
      firebase.firestore().collection('users').doc(firebase.auth().currentUser.uid).update({
        friendsList:firebase.firestore.FieldValue.arrayUnion(this.props.user.id)
      })
    })
  }

  removeFriend = () => {
    let currentUser = this.state.currentUser;
    currentUser.friendsList = currentUser.friendsList.filter(friend => friend != this.props.user.id);
    this.setState({currentUser}, () => {
      firebase.firestore().collection('users').doc(firebase.auth().currentUser.uid).update({
        friendsList:firebase.firestore.FieldValue.arrayRemove(this.props.user.id)
      })    
    });
  }

  render() {
    const fonts = this.props.theme.fontss;
    const colors = this.props.theme.colors;
    if(this.state.complete){
      return (
        <>
          <View style={{backgroundColor:colors.dBlue,flex:1}}>
            {
              this.state.loading
              ? <LoadingOverlay />
              : null
            }
            <ScrollView style={{flex:1,backgroundColor:colors.dBlue,}} snapToStart={false}>
                <Block middle style={{height: height*.1}}>
                    <Button icon='navigate-before' onPress={() => this.props.close()} mode={'text'} theme={{colors:{primary:colors.orange},fonts:{medium:this.props.theme.fonts.regular}}} style={{marginRight:'auto'}}>
                        Back
                    </Button>
                </Block>
                <Block style={{marginRight:"auto",marginLeft:"auto"}} width={width*.9}>
                    <Block center middle style={{marginBottom:height*.025}}>
                    <Headline style={styles.header}>{this.state.user.name}</Headline>
                    <Subheading style={styles.header}>{`@${this.state.user.username}`}</Subheading>
                    <Block center middle style={{width:height*.1,height:height*.1,borderRadius:height*.05,borderWidth:2,borderColor:this.props.theme.colors.orange,marginBottom:height*.015}}>
                        {
                        this.state.proPicUrl != null
                        ? <Avatar.Image
                            theme={{colors:{primary:colors.dBlue}}}
                            source={{uri:this.state.proPicUrl}}
                            size={height*.1-4}
                            />
                        : <Avatar.Image
                            theme={{colors:{primary:colors.dBlue}}}
                            source={defaultUser}
                            size={height*.1-4}
                            />
                        }
                    </Block>
                    {
                      this.state.currentUser.friendsList.includes(this.props.user.id)
                      ? <Button mode="contained" onPress={this.removeFriend} dark={true} style={{marginBottom: height*.025,justifyContent:"center",alignItems:"center",borderWidth:1,borderColor:colors.white}} theme={{colors:{primary:colors.dBlue},fonts:{medium:this.props.theme.fonts.regular}}}>
                            Remove Friend
                        </Button>
                      : <Button mode="contained" onPress={this.addFriend} dark={true} style={{marginBottom: height*.025,justifyContent:"center",alignItems:"center"}} theme={{colors:{primary:colors.orange},fonts:{medium:this.props.theme.fonts.regular}}}>
                            Add Friend
                        </Button>
                    }
                    <Block row style={{width,justifyContent:"space-around",}}>
                        <Block style={styles.statContainer} column center middle>
                        <Subheading style={styles.subheading}>Overall</Subheading>
                        <Headline style={styles.info}>{`${this.state.user.wins}-${this.state.user.losses}`}</Headline>
                        </Block>
                        <Block style={styles.statContainer} column center middle>
                        <Subheading style={styles.subheading}>Last 10 Games</Subheading>
                        <Headline style={styles.info}>{this.getLastTen()}</Headline>
                        </Block>
                    </Block>
                    </Block>
                    <Headline style={[styles.header,{marginBottom:height*.015,textAlign:"center"}]}>Stats Breakdown</Headline>
                    <SportsTabs style={{height:100}} user={this.state.user} />
                    <Headline style={[styles.header,{marginBottom:height*.015,textAlign:"center"}]}>Last Three Games</Headline>
                    {
                    this.state.lastThree.length > 0
                    ? (
                        <Block column>
                        {
                            this.state.lastThree.map((game,index) => {
                            return <GameResult game={game} key={index} user={this.state.user.id} />
                            })
                        }
                        </Block>
                    )
                    : (
                        <Block flex center middle style={{backgroundColor:colors.dBlue, width:width}}>
                            <Block center style={{borderWidth:1,borderColor:colors.orange,borderRadius:8,width:width*.9, padding:10}}>
                                <Headline style={{color:colors.white,fontSize:20,marginTop:height*.025,marginBottom:height*.025,textAlign:'center'}}>{this.state.user.name} has not completed any games.</Headline>
                            </Block>
                        </Block>
                    )
                    }
                </Block>
            </ScrollView>
          </View>
        </>
      );
    } else {
      return (
        <Block flex style={{backdropColor:colors.dBlue}}>

        </Block>
      )
    }
  }
}
const styles = StyleSheet.create({
  header: {
    color: "white"
  },
  button: {
    marginBottom: height*.025,
    justifyContent:"center",
    alignItems:"center"
  },
  statContainer:{
    borderWidth:1,
    borderRadius:8,
    borderColor: '#E68A54',
    width:width*.29,
    paddingTop:height*.01
  },
  subheading:{
    color:"#83838A",
    fontSize:14,
  },
  info:{
    color:"white",
    fontSize:35,
    marginBottom: 15
  }
})

export default withTheme(UserInfo);
