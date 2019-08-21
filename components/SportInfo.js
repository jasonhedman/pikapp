import * as React from 'react';
import { StyleSheet, Dimensions, StatusBar } from 'react-native';
import { withTheme,Text,Headline,Subheading } from 'react-native-paper';

import {Block} from 'galio-framework';

const {height,width} = Dimensions.get("screen");

class SportInfo extends React.Component {
  state = {
    index: 0,
    routes: [
      { key: 'first', title: 'First' },
      { key: 'second', title: 'Second' },
    ],
  };

  render() {
    return (
            <Block row style={styles.container}>
                <Block column middle center style={styles.statContainer}>
                    <Subheading style={styles.subheading}>Record</Subheading>
                    <Headline style={styles.stat}>{`${this.props.user.wins}-${this.props.user.losses}`}</Headline>
                </Block>
                <Block column middle center style={styles.statContainer}>
                    <Subheading style={styles.subheading}>Point Spread</Subheading>
                    <Headline style={styles.stat}>{`${this.props.user.ptsFor}-${this.props.user.ptsAgainst}`}</Headline>
                </Block>
                <Block column middle center style={styles.statContainer}>
                    <Subheading style={styles.subheading}>Win Percentage</Subheading>
                    <Headline style={styles.stat}>{`${(this.props.user.losses + this.props.user.wins) > 0 ? Math.floor(this.props.user.wins/(this.props.user.losses + this.props.user.wins)*100) : 0}%`}</Headline>
                </Block>
            </Block>
    );
  }
}

const styles = StyleSheet.create({
    container:{
        justifyContent: "space-between",
        marginBottom:height*.025,
        marginTop:height*.025,
    },
    subheading:{
        color:"#83838A",
        fontSize:14,
    },
    stat:{
        color:"white",
        marginBottom:10
    },
    sport:{
        color:"white"
    },
    statContainer:{
        borderWidth:1,
        borderRadius:8,
        borderColor: '#E68A54',
        width:width*.29,
        paddingTop:height*.01
    }
});

export default withTheme(SportInfo);