import React from 'react';
import { NavigationContainer } from '@react-navigation/native';

import {MainNavigation} from './MainTabNavigator';
import AuthLoading from '../screens/AuthLoading';
import Register from '../screens/Register';
import SignIn from '../screens/SignIn';
import ForgotPassword from '../screens/ForgotPassword';
import * as firebase from 'firebase';
import 'firebase/firestore';
import * as Permissions from 'expo-permissions';
import { Notifications } from 'expo';



export default class AppNavigator extends React.Component{
  constructor(props){
    super(props);
    this.state = {
      activeUser: firebase.auth().currentUser != null
    }
  }

  componentDidMount(){
    firebase.auth().onAuthStateChanged((user) => {
      if (user != null) {
        this.registerForPushNotificationsAsync(user.uid);
        this.setState({activeUser:true});
      } else {
        this.setState({activeUser:false});
      }
    });
  }



  render(){
    return (
      <NavigationContainer>
        {
          this.state.activeUser
          ? <MainNavigation />
          : null
        }
      </NavigationContainer>
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
// createAppContainer(
//   createSwitchNavigator({
//     // You could add another route here for authentication.
//     // Read more at https://reactnavigation.org/docs/en/auth-flow.html
//     AuthLoading: AuthLoading,
//     Main: MainTabNavigator,
//     SignIn: SignIn,
//     SignUp: Register,
//     ForgotPassword: ForgotPassword
//   },
//   {
//     initialRouteName: 'AuthLoading'
//   }
// ))
