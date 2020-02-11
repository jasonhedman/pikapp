import React from 'react';
import {
  StyleSheet,
  Dimensions
} from 'react-native'
import { Block } from "galio-framework";
import TeamMember from './TeamMember';

import {getDistance} from 'geolib';

import {Headline, withTheme,Subheading,Button, Text} from 'react-native-paper';

import moment from 'moment';

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
      <Text style={{color:colors.white,textAlign:'center',marginBottom:5}}>
        # of Players: {marker.teams.home.length}
      </Text>
    )
    for(let i = 0; i < (marker.teamSize > 4 ? 4 : marker.teamSize); i++){
      if(marker.teams.home.length > i){
        homeTeam.push(<TeamMember key={Math.ceil(Math.random()*1000)} user={marker.teams.home[i]} navToUserProfile={this.props.navToUserProfile} closeModal={this.props.closeModal}/>);
      } else {
        homeTeam.push(<TeamMember key={Math.ceil(Math.random()*1000)} user={null} />);
      }
    }
    if(marker.teamSize > 4){
      homeTeam.push(
        <Block center middle style={[styles.container]}>
          <Text style={{color:colors.grey}}>{marker.teamSize - 4 - (marker.teams.home.length - 4 > 0 ? marker.teams.home.length - 4 : 0)} More Spots...</Text>
        </Block>
      )
    }
    var awayTeam = [];
    awayTeam.push(
      <Text style={{color:colors.white,textAlign:'center',marginBottom:5}}>
        # of Players: {marker.teams.away.length}
      </Text>
    )
    for(let i = 0; i < (marker.teamSize > 4 ? 4 : marker.teamSize); i++){
      if(marker.teams.away.length > i){
        awayTeam.push(<TeamMember key={Math.ceil(Math.random()*1000)} user={marker.teams.away[i]} navToUserProfile={this.props.navToUserProfile} closeModal={this.props.closeModal}/>);
      } else {
        awayTeam.push(<TeamMember key={Math.ceil(Math.random()*1000)} user={null} />);
      }
    }
    if(marker.teamSize > 4){
      awayTeam.push(
        <Block center middle style={[styles.container]}>
          <Text style={{color:colors.grey}}>{marker.teamSize - 4 - (marker.teams.away.length - 4 > 0 ? marker.teams.away.length - 4 : 0)} More Spots...</Text>
        </Block>
      )
    }
    return (
      <Block column style={[styles.modalContainer,{backgroundColor:colors.dBlue,borderTopWidth:2,borderTopColor:colors.orange}]}>
        <Headline style={{color:colors.white,textAlign:"center",marginTop:height*.025}}>{`${marker.intensity} ${marker.sport[0].toUpperCase() + marker.sport.substring(1)}`}</Headline>
        <Subheading style={{color:colors.grey,textAlign:"center"}}>{`Owner: @${marker.ownerUsername}`}</Subheading>
        <Subheading style={{color:colors.grey,textAlign:"center"}}>{`Created ${moment.unix(parseInt(marker.time.seconds)).fromNow()}`}</Subheading>
        <Subheading style={{color:colors.grey,textAlign:"center",marginBottom:height*.03}}>{`Team Size: ${marker.teamSize}`}</Subheading>
        <Block row>
          <Block column>
            {homeTeam}
            <Button 
              mode="contained" 
              dark={true}
              disabled={!(marker.teams.home.length < marker.teamSize && marker.gameState == 'created' && this.props.user.currentGame == null && (getDistance(this.props.userLoc, this.props.marker.location)* 0.000621371) < 2)} 
              onPress={() => {this.props.addToTeam(marker.id, 'home')}}
              style={[{width:width*.45, marginLeft:width*.025}, !(marker.teams.home.length < marker.teamSize && marker.gameState == 'created' && this.props.user.currentGame == null && (getDistance(this.props.userLoc, this.props.marker.location)* 0.000621371) < 2) ? styles.disabled : null]}
              theme={{colors:{primary:colors.orange},fonts:{medium:this.props.theme.fonts.regular}}}
            >
              Join Team
            </Button>
          </Block>
          <Block column>
            {awayTeam}
            <Button 
              mode="contained" 
              dark={true}
              disabled={!(marker.teams.away.length < marker.teamSize && marker.gameState == 'created' && this.props.user.currentGame == null && (getDistance(this.props.userLoc, this.props.marker.location)* 0.000621371) < 2)} 
              onPress={() => {this.props.addToTeam(marker.id, 'away')}}
              style={[{width:width*.45, marginLeft:width*.025}, !(marker.teams.away.length < marker.teamSize && marker.gameState == 'created' && this.props.user.currentGame == null && (getDistance(this.props.userLoc, this.props.marker.location)* 0.000621371) < 2) ? styles.disabled : null]}
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
  container: {
    width:width*.45,
    marginBottom:height*.025,
    padding:5
  }
})

export default withTheme(LobbyModal);