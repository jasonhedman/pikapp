import React from "react";
import {
  StyleSheet,
  Dimensions,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard
} from "react-native";
import { Block} from "galio-framework";

import { withTheme } from 'react-native-paper';

const { width, height } = Dimensions.get("screen");


class Form extends React.Component {
  constructor(props){
    super(props);
  }

  render() {
    let colors = this.props.theme.colors;
    return (
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} style={{height,width,}}>
        <Block center middle style={{height,width,backgroundColor:colors.dBlue}}>
          <KeyboardAvoidingView enabled behavior="position">
            <Block center middle style={[styles.registerContainer, {backgroundColor:colors.dBlue,borderColor:colors.orange}]}>
              {this.props.children}
            </Block>
          </KeyboardAvoidingView>
        </Block>
      </TouchableWithoutFeedback>
    );
  }
}

const styles = StyleSheet.create({
  registerContainer: {
    width: width * 0.9,
    borderRadius: 8,
    borderWidth: 2,
    padding:16,
  }
});

export default withTheme(Form);
