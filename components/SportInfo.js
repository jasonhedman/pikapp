import * as React from 'react';
import { StyleSheet} from 'react-native';
import { withTheme,Headline,Subheading } from 'react-native-paper';

import {Block} from 'galio-framework';

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
        <Block>
            <Headline style={{color:"#fff",textAlign:'center',marginTop:12,marginBottom:12,fontSize:20}}>{this.props.sport}</Headline>
            <Block row style={styles.container}>
                <Block flex column middle center style={styles.statContainer}>
                    <Subheading style={styles.subheading}>Record</Subheading>
                    <Headline style={styles.stat}>{`${this.props.user.wins}-${this.props.user.losses}`}</Headline>
                </Block>
                <Block flex column middle center style={styles.statContainer}>
                    <Subheading style={styles.subheading}>Point Spread</Subheading>
                    <Headline style={styles.stat}>{`${this.props.user.ptsFor}-${this.props.user.ptsAgainst}`}</Headline>
                </Block>
                <Block flex column middle center style={styles.statContainer}>
                    <Subheading style={styles.subheading}>Percentage</Subheading>
                    <Headline style={styles.stat}>{`${(this.props.user.losses + this.props.user.wins) > 0 ? Math.floor(this.props.user.wins/(this.props.user.losses + this.props.user.wins)*100) : 0}%`}</Headline>
                </Block>
            </Block>
        </Block>
        
    );
  }
}

const styles = StyleSheet.create({
    container:{
        justifyContent: "space-between",
    },
    subheading:{
        color:"#83838A",
        fontSize:14,
    },
    stat:{
        color:"white",
    },
    sport:{
        color:"white"
    },
    statContainer:{
        borderWidth:1,
        borderRadius:8,
        borderColor: '#E68A54',
        padding:8,
        marginLeft:8,
        marginRight:8
    }
});

export default withTheme(SportInfo);