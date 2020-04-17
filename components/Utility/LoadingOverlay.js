import React from "react";
import { ActivityIndicator, withTheme } from "react-native-paper";
import { Block } from "galio-framework";
import { Dimensions } from "react-native";

const { height, width } = Dimensions.get("window");

class LoadingOverlay extends React.Component {
  render() {
    return (
      <Block
        center
        middle
        style={{
          height,
          width,
          position: "absolute",
          top: 0,
          bottom: 0,
          left: 0,
          right: 0,
          opacity: 0.7,
          zIndex: 10000,
          backgroundColor: this.props.theme.colors.dBlue,
        }}
      >
        <ActivityIndicator
          style={{ opacity: 1 }}
          animating={true}
          color={this.props.theme.colors.orange}
          size={"medium"}
        />
      </Block>
    );
  }
}

export default withTheme(LoadingOverlay);
