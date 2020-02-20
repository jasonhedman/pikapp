import React from 'react';
import {
  StyleSheet,
  Dimensions,
  ScrollView
} from 'react-native'
import { Block } from "galio-framework";
import TeamMember from './TeamMember';

import {getDistance} from 'geolib';

import {Headline, withTheme,Subheading,Button, Text} from 'react-native-paper';

import moment from 'moment';
import HeaderBlock from './HeaderBlock';

const { width, height } = Dimensions.get("screen");

class LobbyModal extends React.Component {
  constructor(props){
    super(props);
  }

  render(){
    const colors = this.props.theme.colors;
    let marker = this.props.marker;
    var homeTeam = [];
    homeTeam.push(
      <Text key={'home#'} style={{color:colors.white,textAlign:'center',marginBottom:4}}>
        # of Players: {marker.teams.home.length}
      </Text>
    )
    for(let i = 0; i < marker.teamSize; i++){
      if(marker.teams.home.length > i){
        homeTeam.push(<TeamMember key={'home'+i} user={marker.teams.home[i]} navToUserProfile={this.props.navToUserProfile} closeModal={this.props.closeModal}/>);
      } else {
        homeTeam.push(<TeamMember key={'home'+i} user={null} />);
      }
    }
    var awayTeam = [];
    awayTeam.push(
      <Text key={'away#'} style={{color:colors.white,textAlign:'center',marginBottom:4}}>
        # of Players: {marker.teams.away.length}
      </Text>
    )
    for(let i = 0; i < marker.teamSize; i++){
      if(marker.teams.away.length > i){
        awayTeam.push(<TeamMember key={'away'+i} user={marker.teams.away[i]} navToUserProfile={this.props.navToUserProfile} closeModal={this.props.closeModal}/>);
      } else {
        awayTeam.push(<TeamMember key={'away'+i} user={null} />);
      }
    }
    return (
      <Block column style={[styles.modalContainer,{backgroundColor:colors.dBlue,borderTopWidth:2,borderTopColor:colors.orange}]}>
        <HeaderBlock text={`${marker.intensity[0].toUpperCase() + marker.intensity.substring(1)} ${marker.sport[0].toUpperCase() + marker.sport.substring(1)}`} />
        <Subheading style={{color:colors.grey,textAlign:"center"}}>{`Owner: @${marker.owner.username}`}</Subheading>
        <Subheading style={{color:colors.grey,textAlign:"center"}}>{`Created ${moment.unix(parseInt(marker.time.seconds)).fromNow()}`}</Subheading>
        <Subheading style={{color:colors.grey,textAlign:"center",marginBottom:16}}>{`Team Size: ${marker.teamSize}`}</Subheading>
        <Block row style={{zIndex:1000, maxHeight:height*.4}}>
          <Block flex column style={{padding:8}}>
            <ScrollView style={{}}>
              {homeTeam}
            </ScrollView>
            <Button 
              mode="contained" 
              dark={true}
              disabled={!(marker.teams.home.length < marker.teamSize && marker.gameState == 'created' && this.props.user.currentGame == null && (getDistance(this.props.userLoc, this.props.marker.location)* 0.000621371) < 2)} 
              onPress={() => {this.props.addToTeam(marker.id, 'home')}}
              style={[styles.joinButton, !(marker.teams.home.length < marker.teamSize && marker.gameState == 'created' && this.props.user.currentGame == null && (getDistance(this.props.userLoc, this.props.marker.location)* 0.000621371) < 2) ? styles.disabled : null]}
              theme={{colors:{primary:colors.orange},fonts:{medium:this.props.theme.fonts.regular}}}
            >
              Join Team
            </Button> 
          </Block>
          <Block flex column style={{padding:8,maxHeight:height*.4}}>
            <ScrollView style={{flex:1}}>
              {awayTeam} 
            </ScrollView>
            <Button 
              mode="contained" 
              dark={true}
              disabled={!(marker.teams.away.length < marker.teamSize && marker.gameState == 'created' && this.props.user.currentGame == null && (getDistance(this.props.userLoc, this.props.marker.location)* 0.000621371) < 2)} 
              onPress={() => {this.props.addToTeam(marker.id, 'away')}}
              style={[styles.joinButton, !(marker.teams.away.length < marker.teamSize && marker.gameState == 'created' && this.props.user.currentGame == null && (getDistance(this.props.userLoc, this.props.marker.location)* 0.000621371) < 2) ? styles.disabled : null]}
              theme={{colors:{primary:colors.orange},fonts:{medium:this.props.theme.fonts.regular}}}
            >
              Join Team
            </Button>
          </Block>
        </Block>
      </Block>
    );
  }
}

const styles = StyleSheet.create({
  modalContainer: {
    width:width,
    zIndex:100
  },
  disabled: {
    opacity: .3, 
    backgroundColor:'#E68A54'
  },
  joinButton:{
    marginTop:12,
  }
})

export default withTheme(LobbyModal);