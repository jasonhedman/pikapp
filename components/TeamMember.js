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
import { withTheme, Text } from 'react-native-paper';

const { width, height } = Dimensions.get("screen");


class TeamMember extends React.Component{
  constructor(props){
    super(props);
    this._isMounted = false;
    this.state = {
      user:{}
    }
  }

  componentDidMount(){
    this._isMounted = true;
    if(this.props.user != null){
      this.setState({user:this.props.user})
    } else {
      if(this._isMounted){
        this.setState({user:{name:"", username:""}});
      }
    }
  }

  // componentWillUnmount(){
  //   this._isMounted = false;
  // }

  render(){
    const colors = this.props.theme.colors;
    if(this.props.user != null){
      if(this.state.user.name == undefined){
        return (
          <Block center middle style={[styles.container, {borderColor:colors.grey}]}>
          </Block>
        );
      }
      return (
        <TouchableOpacity onPress={() => {this.props.closeModal();this.props.navToUserProfile(this.props.user.id)}}>
          <Block row center middle style={[styles.container,{borderColor:colors.orange}]}>
            <Block flex column>
              <Text style={{color:colors.white}}>{this.state.user.name}</Text>
              <Text style={{color:colors.white}}>@{this.state.user.username}</Text>
            </Block>
            <Text style={{color:colors.white}}>{this.state.user.record}</Text>
          </Block>
        </TouchableOpacity>
      );
    } else {
      return (
        <Block center middle style={[styles.container, {borderColor:colors.grey}]}>
          <Text style={{color:colors.grey}}>Available Spot</Text>
        </Block>
      );
    }
  }
}

const styles = StyleSheet.create({
  container: {
    borderRadius:8,
    borderWidth:1,
    marginBottom:8,
    width:'100%',
    padding:8
  }
})

export default withTheme(TeamMember)