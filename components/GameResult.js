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
    this.setState({home:this.props.game.teams.home,away:this.props.game.teams.away, userId:this.props.user})
  }

  render(){
    return (
      <Block column style={{}}>
        <Subheading style={{textAlign:'center',color:"white"}}>{`${this.props.game.intensity[0].toUpperCase()+this.props.game.substring(1)} ${this.props.game.sport[0].toUpperCase() + this.props.game.sport.substring(1)}`}</Subheading>
        <Block row>
          <Block flex column style={{padding:10}}>
            <Text style={{color:this.props.game.winningTeam == "home" ? '#E68A54' : 'white',textAlign:"center"}}>Home</Text>
            <Subheading style={{color:this.props.game.winningTeam == "home" ? '#E68A54' : 'white',textAlign:"center",fontSize:20,marginBottom:10}}>{this.props.game.result.home}</Subheading>
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
            <Text style={{color:this.props.game.winningTeam == "away" ? '#E68A54' : 'white',textAlign:"center"}}>Away</Text>
            <Subheading style={{color:this.props.game.winningTeam == "away" ? '#E68A54' : 'white',textAlign:"center",fontSize:20,marginBottom:10}}>{this.props.game.result.away}</Subheading>
            <Block column>
              {
                this.state.away.map((player, index) => {
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
  })
}

export default withTheme(GameResult);
