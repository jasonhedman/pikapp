import React from "react";
import {
  StyleSheet,
  Dimensions,
} from "react-native";
import { Block} from "galio-framework";

import { withTheme, Button } from 'react-native-paper';


class ButtonBlock extends React.Component {
  constructor(props){
    super(props);
  }

  render() {
    let colors = this.props.theme.colors;
    return (
        <Block middle center style={styles.buttonBlock}>
            <Button disabled={this.props.disabled} mode="contained" dark={true} style={[styles.createButton, this.props.disabled ? this.props.disabledStyles : null]} onPress={this.props.onPress} theme={{colors:{primary:colors.orange},fonts:{medium:this.props.theme.fonts.regular}}}>
                {this.props.text}
            </Button>
            {this.props.children}
        </Block>
    );
  }
}

const styles = StyleSheet.create({
    createButton: {
        marginBottom:8
    },
    buttonBlock:{
        marginTop:8,
        width:"100%",
    },
});

export default withTheme(ButtonBlock);
