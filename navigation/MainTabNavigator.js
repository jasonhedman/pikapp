import React from 'react';
import { Platform } from 'react-native';
import { createMaterialBottomTabNavigator } from '@react-navigation/material-bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import TabBarIcon from '../components/TabBarIcon';
import GameLobby from '../screens/GameLobby';
import MapScreen from '../screens/MapScreen';
import SearchPlayers from '../screens/SearchPlayers';
import Profile from '../screens/Profile';
import ChangePassword from '../screens/ChangePassword';
import ChangeEmail from '../screens/ChangeEmail';
import UserProfile from '../screens/UserProfile';
import UserList from '../screens/UserList';
import {UserContext} from '../UserContext';

import firebase from 'firebase';
import 'firebase/firestore';
import ChooseLocation from '../screens/ChooseLocation';

const Tab = createMaterialBottomTabNavigator();
const MapStackNav = createStackNavigator();
const ProfileStackNav = createStackNavigator();
const SocialStackNav = createStackNavigator();
const GameStackNav = createStackNavigator();

function MapStack(){
  return (
    <MapStackNav.Navigator
      initialRouteName="MapScreen"
      headerMode='none'
    >
      <MapStackNav.Screen name="MapScreen" component={MapScreen} />
      <MapStackNav.Screen name="UserProfile" component={UserProfile} />
      <MapStackNav.Screen name="UserList" component={UserList} />
      <MapStackNav.Screen name="LocationSelect" component={ChooseLocation} />
    </MapStackNav.Navigator>
  );
}

function ProfileStack(){
  return (
    <ProfileStackNav.Navigator
      initialRouteName="Profile"
      headerMode='none'
    >
      <ProfileStackNav.Screen name="UserProfile" component={UserProfile} />
      <ProfileStackNav.Screen name="Profile" component={Profile} />
      <ProfileStackNav.Screen name="UserList" component={UserList} />
      <ProfileStackNav.Screen name="ChangeEmail" component={ChangeEmail} />
      <ProfileStackNav.Screen name="ChangePassword" component={ChangePassword} />
    </ProfileStackNav.Navigator>
  );
}

function SocialStack(){
  return (
    <SocialStackNav.Navigator
      initialRouteName="Social Screen"
      headerMode='none'
    >
      <SocialStackNav.Screen name="SocialScreen" component={SearchPlayers} />
      <SocialStackNav.Screen name="UserProfile" component={UserProfile} />
      <SocialStackNav.Screen name="UserList" component={UserList} />
    </SocialStackNav.Navigator>
  );
}

function GameStack(){
  return (
    <GameStackNav.Navigator
      initialRouteName="Lobby"
      headerMode='none'
    >
      <GameStackNav.Screen name="Lobby" component={GameLobby} />
      <GameStackNav.Screen name="UserProfile" component={UserProfile} />
      <GameStackNav.Screen name="UserList" component={UserList} />
    </GameStackNav.Navigator>
  );
}

export class MainNavigation extends React.Component {
  constructor(){
    super();
    this.state = {
      user:{}
    }
  }

  componentDidMount(){
    firebase.firestore().collection('users').doc(firebase.auth().currentUser.uid).get()
    .then((user) => {
      let userData = user.data();
      userData.id = user.id;
      this.setState({user:userData});
    })
  }

  render(){
    return (
      <UserContext.Provider value={this.state}>
          <Tab.Navigator
            initialRouteName='MapStack'
            activeColor='#E68A54'
            inactiveColor='#fff'
            barStyle={{backgroundColor:'#121D28'}}
          >
            <Tab.Screen 
              name="Lobby" 
              component={GameStack} 
              options={{
                tabBarLabel: "Lobby",
                tabBarIcon: ({ focused }) => (
                  <TabBarIcon focused={focused} name={'Platform.OS' === 'ios' ? 'ios-basketball' : 'md-basketball'} />
                )
              }}
            />
            <Tab.Screen 
              name="MapStack" 
              component={MapStack} 
              options={{
                tabBarLabel: "Map",
                tabBarIcon: ({ focused }) => (
                  <TabBarIcon focused={focused} name={'Platform.OS' === 'ios' ? 'ios-map' : 'md-map'} />
                )
              }}
            />
            <Tab.Screen 
              name="SocialStack" 
              component={SocialStack} 
              options={{
                tabBarLabel: "Social",
                tabBarIcon: ({ focused }) => (
                  <TabBarIcon focused={focused} name={'Platform.OS' === 'ios' ? 'ios-search' : 'md-search'} />
                )
              }}
            />
            <Tab.Screen 
              name="ProfileStack" 
              component={ProfileStack} 
              options={{
                tabBarLabel: "Profile",
                tabBarIcon: ({ focused }) => (
                  <TabBarIcon focused={focused} name={'Platform.OS' === 'ios' ? 'ios-person' : 'md-person'} />
                )
              }}
            />
          </Tab.Navigator>
      </UserContext.Provider>
    )
  }
}