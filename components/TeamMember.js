import React from 'react';
import {
  StyleSheet,
  Dimensions
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

  componentWillUnmount(){
    this._isMounted = false;
  }

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
        <Block row center middle style={[styles.container,{borderColor:colors.orange}]}>
          <Block flex column>
            <Text style={{color:colors.white}}>{this.state.user.name}</Text>
            <Text style={{color:colors.white}}>@{this.state.user.username}</Text>
          </Block>
          <Text style={{color:colors.white}}>{this.state.user.record}</Text>
        </Block>
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
    width:width*.45,
    marginBottom:height*.025,
    height:height*.05,
    padding:5
  }
})

export default withTheme(TeamMember)