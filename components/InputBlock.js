import React from "react";
import {
  StyleSheet,
} from "react-native";
import { Block } from "galio-framework";
import { withTheme, TextInput } from 'react-native-paper';

class InputBlock extends React.Component {
  constructor(props){
    super(props);
  }

  render() {
    let colors = this.props.theme.colors;
    return (
        <Block style={styles.inputBlock}>
            <TextInput
                value={this.props.value}
                theme={{colors: {text:colors.white,placeholder:colors.white,underlineColor:colors.orange,selectionColor:colors.orange,primary:colors.orange}}}
                style={styles.input}
                mode={'outlined'}
                placeholder={this.props.placeholder}
                onChangeText={this.props.onChange}
                onBlur={this.props.onBlur}
                secureTextEntry={this.props.secureTextEntry}
            />
            {this.props.children}
        </Block>
    );
  }
}

const styles = StyleSheet.create({
    inputBlock:{
        width:"100%",
        marginBottom:12,
    },
});

export default withTheme(InputBlock);
