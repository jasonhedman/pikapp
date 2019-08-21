import React from 'react';
import * as firebase from 'firebase';
import {
  ActivityIndicator,
  AsyncStorage,
  StatusBar,
  StyleSheet,
  View,
} from 'react-native';


export default class AuthLoading extends React.Component{
  constructor(props){
    super(props);
    this.findUserStatus();
  }

  findUserStatus(){
      firebase.auth().onAuthStateChanged((user) => {
        if (user != null) {
          this.props.navigation.navigate("Main");
        } else {
          this.props.navigation.navigate("SignIn");
        }
      });

  }

  render(){
    return (
      <View>
        <ActivityIndicator />
        <StatusBar barStyle="default" />
      </View>
    );
  }
}
