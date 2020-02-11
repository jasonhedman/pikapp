import React from "react";
import {
  StyleSheet,
  Dimensions,
} from "react-native";
import { Block} from "galio-framework";

import { withTheme, Button, Headline } from 'react-native-paper';


class HeaderBlock extends React.Component {
  constructor(props){
    super(props);
  }

  render() {
    let colors = this.props.theme.colors;
    return (
        <Block center style={styles.headerBlock}>
            {
                this.props.backButton
                ? <Button onPress={this.props.backPress} mode={'text'} compact={true} icon={'keyboard-backspace'} theme={{colors:{primary:colors.orange}}} style={{position:'absolute', left:-8, padding:0}}></Button>
                : null
            }
            <Headline style={{color:this.props.theme.colors.white,textAlign:'center'}}>{this.props.text}</Headline>
        </Block>
    );
  }
}

const styles = StyleSheet.create({
    headerBlock:{
        width:"100%",
        marginTop:16,
        marginBottom:16
    }
});

export default withTheme(HeaderBlock);
