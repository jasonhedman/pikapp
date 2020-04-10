import * as React from 'react';
import { StyleSheet, Dimensions } from 'react-native';
import { withTheme,Headline,Subheading } from 'react-native-paper';

import {Block} from 'galio-framework';
const { width, height } = Dimensions.get("screen");


class SportsBreakdown extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            sports: new Array()
        }
    }

    componentDidMount(){
        let sportsSorted = Object.keys(this.props.user.sports).sort((a,b) => {return this.props.user.sports[a] - this.props.user.sports[b]})
        this.setState({sports:sportsSorted,loaded:true});
    }

  render() {
    return (
        <>
            {
                this.state.loaded
                ?
                <Block style={{marginBottom:12}}>
                    <Block style={styles.favoriteSport}>
                        <Subheading style={{color:"#83838A",textAlign:'center',margin:0}}>Favorite Sport</Subheading>
                        <Headline style={styles.stat}>{this.state.sports[0][0].toUpperCase() + this.state.sports[0].substring(1)}</Headline>
                    </Block>
                    <Block row style={{flexWrap:'wrap',alignItem:'flex-start'}}>
                    {
                        this.state.sports.map((item, key) => {
                            return (
                                <Block style={styles.sport} key={key}>
                                    <Subheading style={styles.sportName}>{item[0].toUpperCase() + item.substring(1)}</Subheading>
                                    <Block flex column middle center style={styles.sportContainer}>
                                        <Subheading style={styles.subheading}>Games Played</Subheading>
                                        <Headline style={styles.stat}>{this.props.user.sports[item].gamesPlayed}</Headline>
                                    </Block>
                                </Block>
                                
                            );
                        })
                    }
                    </Block>
                </Block>
                :null
            }
        </>
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
    sportName:{
        color:"#fff",
        fontSize:14,
        textAlign:'center'
    },
    stat:{
        color:"white",
        textAlign:'center',
        margin:0,
    },
    favoriteSport:{
        borderWidth:1,
        borderRadius:8,
        borderColor: '#E68A54',
        padding:8,
        width:'100%',
    },
    sportContainer:{
        borderWidth:1,
        borderRadius:8,
        borderColor: '#E68A54',
        padding:8,
        width:'100%'
    },
    sport:{
        flexBasis:"50%",
        padding:8,
        paddingBottom:0,
        color:"white"
    },
    

});

export default withTheme(SportsBreakdown);