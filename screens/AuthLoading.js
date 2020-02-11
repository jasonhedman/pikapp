import React from 'react';
import * as firebase from 'firebase';
import 'firebase/firestore';
import { Notifications } from 'expo';
import * as Permissions from 'expo-permissions';
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
    this.state = {
      isLoadingComplete: false
    }
    this.findUserStatus();
  }

  findUserStatus(){
      firebase.auth().onAuthStateChanged((user) => {
        if (user != null) {
          this.registerForPushNotificationsAsync(user.uid);
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

  registerForPushNotificationsAsync = async (uid) => {
    const { status: existingStatus } = await Permissions.getAsync(
      Permissions.NOTIFICATIONS
    );
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Permissions.askAsync(Permissions.NOTIFICATIONS);
      finalStatus = status;
    }
    if (finalStatus !== 'granted') {
      return;
    }
    let token = await Notifications.getExpoPushTokenAsync();
    firebase.firestore().collection('users').where('pushToken', '==', token).get()
      .then((users) => {
        users.forEach((user) => {
          if(user.id != uid){
            firebase.firestore().collection('users').doc(user.id).update({
              pushToken: firebase.firestore.FieldValue.delete()
            })
          }
        })
      })
      .then(() => {
        firebase.firestore().collection('users').doc(uid).update({
          pushToken: token
        })
      })

  }
}
