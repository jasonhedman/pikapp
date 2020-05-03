import React from "react";
import {
  StyleSheet,
  Dimensions,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
  Platform,
} from "react-native";
import { Block } from "galio-framework";

import { withTheme } from "react-native-paper";

const { width, height } = Dimensions.get("screen");

class Form extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    let colors = this.props.theme.colors;
    return (
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} style={{ flex: 1 }}>
          <Block
            flex
            middle
            style={{ padding: 16, backgroundColor: colors.dBlue }}
          >
            <Block
              style={[
                styles.registerContainer,
                {
                  backgroundColor: colors.dBlue,
                  borderColor: colors.orange,
                  justifyContent: "flex-end",
                },
              ]}
            >
              {this.props.children}
            </Block>
          </Block>
      </TouchableWithoutFeedback>
    );
  }
}

const styles = StyleSheet.create({
  registerContainer: {
    width: "100%",
    borderRadius: 8,
    borderWidth: 2,
    padding: 16,
  },
});

export default withTheme(Form);
