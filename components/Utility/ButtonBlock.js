import React from "react";
import { StyleSheet } from "react-native";
import { Block } from "galio-framework";

import { withTheme, Button } from "react-native-paper";

class ButtonBlock extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    let colors = this.props.theme.colors;
    return (
      <Block middle center style={styles.buttonBlock}>
        <Button
          disabled={this.props.disabled}
          mode="contained"
          dark={true}
          style={
            this.props.disabled ? this.props.disabledStyles : null
          }
          onPress={this.props.onPress}
          theme={{
            colors: { primary: colors.orange },
            fonts: { medium: this.props.theme.fonts.regular },
          }}
          uppercase={this.props.uppercase}
        >
          {this.props.text}
        </Button>
        {this.props.children}
      </Block>
    );
  }
}

const styles = StyleSheet.create({
  buttonBlock: {
    marginTop: 8,
    width: "100%",
  },
});

export default withTheme(ButtonBlock);
