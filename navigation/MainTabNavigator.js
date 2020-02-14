import React from 'react';
import { Platform } from 'react-native';
import { createBottomTabNavigator } from 'react-navigation';
import { createStackNavigator } from 'react-navigation-stack' 
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
  headerShown:false
};

const GameStack = createStackNavigator(
  {
    Lobby: {
      screen: GameLobby,
      navigationOptions: {
        headerShown:false
      }
    },
    UserProfile: {
      screen: UserProfile,
      navigationOptions: {
        headerShown:false
      }
    },
    UserList: {
      screen: UserList,
      navigationOptions: {
        headerShown:false
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
        headerShown:false
      }
    },
    UserProfile: {
      screen: UserProfile,
      navigationOptions: {
        headerShown:false
      }
    },
    UserList: {
      screen: UserList,
      navigationOptions: {
        headerShown:false
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

// const SocialStack = createStackNavigator(
//   {
//     SocialScreen: {
//       screen: SearchPlayers,
//       navigationOptions: {
//         headerShown:false
//       }
//     },
//     UserProfile: {
//       screen: UserProfile,
//       navigationOptions: {
//         headerShown:false
//       }
//     },
//     UserList: {
//       screen: UserList,
//       navigationOptions: {
//         headerShown:false
//       }
//     },
    
//   },
//   config
// );

// SocialStack.navigationOptions = {
//   tabBarLabel: 'Social',
//   tabBarIcon: ({ focused }) => (
//     <TabBarIcon focused={focused} name={'Platform.OS' === 'ios' ? 'ios-git-network' : 'md-git-network'} />
//   ),
// };


// SocialStack.path = '';


const ProfileStack = createStackNavigator(
  {
    Profile: {
      screen: Profile,
      navigationOptions: {
        headerShown:false
      }
    },
    ChangePassword: {
      screen: ChangePassword,
      navigationOptions: {
        headerShown:false
      }
    },
    ChangeEmail: {
      screen: ChangeEmail,
      navigationOptions: {
        headerShown:false
      }
    },
    UserProfile: {
      screen: UserProfile,
      navigationOptions: {
        headerShown:false
      }
    },
    UserList: {
      screen: UserList,
      navigationOptions: {
        headerShown:false
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
  // SocialStack,
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
