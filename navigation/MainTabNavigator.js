import React from 'react';
import { Platform } from 'react-native';
import { createStackNavigator, createBottomTabNavigator } from 'react-navigation';
import { createMaterialBottomTabNavigator } from "react-navigation-material-bottom-tabs";

import TabBarIcon from '../components/TabBarIcon';
import GameLobby from '../screens/GameLobby';
import MapScreen from '../screens/MapScreen';
import SearchPlayers from '../screens/SearchPlayers';
import Profile from '../screens/Profile';
import ChangePassword from '../screens/ChangePassword';
import ChangeEmail from '../screens/ChangeEmail';
import UserProfile from '../screens/UserProfile';
import UserList from '../screens/UserList';




import {withTheme} from 'react-native-paper';

const config = {
  header:null
};

const GameStack = createStackNavigator(
  {
    Lobby: {
      screen: GameLobby,
      navigationOptions: {
        header:null
      }
    },
    UserProfile: {
      screen: UserProfile,
      navigationOptions: {
        header:null
      }
    },
    UserList: {
      screen: UserList,
      navigationOptions: {
        header:null
      }
    },
  },
  config
);

GameStack.navigationOptions = {
  tabBarLabel: 'Game',
  tabBarIcon: ({ focused }) => (
    <TabBarIcon
      focused={focused}
      name={
        Platform.OS === 'ios'
          ? `ios-basketball`
          : 'md-basketball'
      }
    />
  ),
};

GameStack.path = '';

const MapStack = createStackNavigator(
  {
    MapScreen: {
      screen: MapScreen,
      navigationOptions: {
        header:null
      }
    },
    UserProfile: {
      screen: UserProfile,
      navigationOptions: {
        header:null
      }
    },
    UserList: {
      screen: UserList,
      navigationOptions: {
        header:null
      }
    },
  },
  config
);

MapStack.navigationOptions = {
  tabBarLabel: 'Map',
  tabBarIcon: ({ focused }) => (
    <TabBarIcon focused={focused} name={'Platform.OS' === 'ios' ? 'ios-map' : 'md-map'} />
  ),
};


MapStack.path = '';

const SocialStack = createStackNavigator(
  {
    SocialScreen: {
      screen: SearchPlayers,
      navigationOptions: {
        header:null
      }
    },
    UserProfile: {
      screen: UserProfile,
      navigationOptions: {
        header:null
      }
    },
    UserList: {
      screen: UserList,
      navigationOptions: {
        header:null
      }
    },
    
  },
  config
);

SocialStack.navigationOptions = {
  tabBarLabel: 'Social',
  tabBarIcon: ({ focused }) => (
    <TabBarIcon focused={focused} name={'Platform.OS' === 'ios' ? 'ios-git-network' : 'md-git-network'} />
  ),
};


SocialStack.path = '';


const ProfileStack = createStackNavigator(
  {
    Profile: {
      screen: Profile,
      navigationOptions: {
        header:null
      }
    },
    ChangePassword: {
      screen: ChangePassword,
      navigationOptions: {
        header:null
      }
    },
    ChangeEmail: {
      screen: ChangeEmail,
      navigationOptions: {
        header:null
      }
    },
    UserProfile: {
      screen: UserProfile,
      navigationOptions: {
        header:null
      }
    },
    UserList: {
      screen: UserList,
      navigationOptions: {
        header:null
      }
    },
  },
  {
    initialRouteName:"Profile"
  }
);

ProfileStack.navigationOptions = {
  tabBarLabel: 'Profile',
  tabBarIcon: ({ focused }) => (
    <TabBarIcon focused={focused} name={Platform.OS === 'ios' ? 'ios-person' : 'md-person'} />
  ),
};

ProfileStack.path = '';

const tabNavigator = createMaterialBottomTabNavigator({
  GameStack,
  MapStack,
  SocialStack,
  ProfileStack,
},{
  shifting:true,
  initialRouteName: 'MapStack',
  activeColor: '#E68A54',
  inactiveColor: '#3e2465',
  barStyle: { backgroundColor: '#121D28' },
});

tabNavigator.path = '';

export default tabNavigator;
