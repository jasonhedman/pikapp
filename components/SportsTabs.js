import * as React from 'react';
import { View, StyleSheet, Dimensions, StatusBar } from 'react-native';
import SportInfo from './SportInfo'
import { TabView, TabBar } from 'react-native-tab-view';
import Colors from '../constants/Colors';
import { withTheme } from 'react-native-paper';

const {width,height} = Dimensions.get('screen');

class SportsTabs extends React.Component {
  state = {
    index: 0,
    routes: [
      { key: 'Basketball', title: 'Basketball' },
      { key: 'Spikeball', title: 'Spikeball' },
      { key: 'Football', title: 'Football' },
    ],
  };

  render() {
    const colors = this.props.theme.colors;
    return (
      <TabView
        navigationState={this.state}
        renderScene={({ route, jumpTo }) => {
            switch (route.key) {
                case 'Basketball':
                    return <SportInfo user={this.props.user.sports.basketball} sport={route.key} />;
                case 'Spikeball':
                    return <SportInfo user={this.props.user.sports.spikeball} sport={route.key} />;
                case 'Football':
                    return <SportInfo user={this.props.user.sports.football} sport={route.key} />;
                default:
                    return null;
            }
          }}
        onIndexChange={index => this.setState({ index })}
        style={styles.container}
        sceneContainerStyle={{height:200}}
        renderTabBar={props =>
          <TabBar
            {...props}
            indicatorStyle={{ backgroundColor: colors.orange }}
            style={{ backgroundColor: colors.dBlue }}
            activeColor={colors.orange}
            inactiveColor={colors.white}
            tabStyle={{padding:0}}
            labelStyle={{fontFamily:this.props.theme.fonts.regular,fontSize:14}}
          />
        }
      />
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex:0,
    height:height*.25
  },
});

export default withTheme(SportsTabs);