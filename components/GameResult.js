import React from 'react';

import {
  Block,
} from 'galio-framework';

import {
  StyleSheet,
  TouchableOpacity
} from 'react-native';

import * as firebase from 'firebase';
import firestore from 'firebase/firestore';

import {withTheme,Text,Headline, Subheading} from 'react-native-paper';

class GameResult extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      home: new Array(),
      away: new Array(),
      userId:null
    }
  }

  componentDidMount(){
    this.setState({players:this.props.game.players, userId:this.props.user})
  }

  render(){
    return (
      <Block column style={{}}>
        <Subheading style={{textAlign:'center',color:"white"}}>{`${this.props.game.intensity[0].toUpperCase()+this.props.game.intensity.substring(1)} ${this.props.game.sport[0].toUpperCase()}${this.props.game.sport.substring(1)}`}</Subheading>
        <Block row style={{flexWrap:'wrap',alignItem:'flex-start'}}>
          {
            this.state.players.map((player, index) => {
              <Block style={styles.userContainer}>
                <TouchableOpacity onPress={() => this.props.navToUserProfile(player.id)}>
                  <Block column style={player.id==this.state.userId ? this.styles.currentUser : this.styles.otherUser} key={index}>
                    <Text style={{color:"white"}}>{player.name}</Text>
                    <Text style={{color:"white"}}>@{player.username}</Text>
                  </Block>
                </TouchableOpacity>
              </Block>
            })
          }
          {/* <Block flex column style={{padding:10}}>
            <Text style={{color:this.props.game.teams.home.map((user) => {return user.id}).includes(firebase.auth().currentUser.uid) ? '#E68A54' : 'white',textAlign:"center", marginBottom:10}}>Home</Text>
            <Block column>
              {
                this.state.home.map((player, index) => {
                  return (
                    <TouchableOpacity onPress={() => this.props.navToUserProfile(player.id)}>
                      <Block column style={player.id==this.state.userId ? this.styles.currentUser : this.styles.otherUser} key={index}>
                        <Text style={{color:"white"}}>{player.name}</Text>
                        <Text style={{color:"white"}}>@{player.username}</Text>
                      </Block>
                    </TouchableOpacity>
                  )
                })
              }
            </Block>
          </Block>
          <Block flex column style={{padding:10}}>
            <Text style={{color:this.props.game.teams.away.map((user) => {return user.id}).includes(firebase.auth().currentUser.uid) ? '#E68A54' : 'white',textAlign:"center",marginBottom:10}}>Away</Text>
            <Block column>
              {
                this.state.away.map((player, index) => {
                  return (
                    
                  )
                })
              }
            </Block>
          </Block> */}
        </Block>
      </Block>
    );
  }

  styles = StyleSheet.create({
    currentUser: {
      borderWidth:.5,
      borderRadius: 8,
      borderColor: '#E68A54',
      padding:5,
      marginBottom:10
    },
    otherUser: {
      borderWidth:.5,
      borderRadius: 8,
      borderColor: "#83838A",
      padding:5,
      marginBottom:10
    },
    userContainer: {
      flexBasis:"50%",
      padding:8,
      color:"white"
    }
  })
}

export default withTheme(GameResult);
