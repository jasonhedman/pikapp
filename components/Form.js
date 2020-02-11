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


class NameAndUsername extends React.Component {
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
  },
  createButton: {
    marginBottom:height*.025,
    width: width * 0.5,
    alignItems: "center",
    justifyContent: "center"
  },
  input: {
    justifyContent:"center"
  },
  inputBlock:{
    width:"100%",
    marginBottom:12,
  },
  buttonBlock:{
    width:"100%",
    marginTop:16
  },
  headerBlock:{
    marginTop:16,
    marginBottom:16
  }
});

export default withTheme(NameAndUsername);
