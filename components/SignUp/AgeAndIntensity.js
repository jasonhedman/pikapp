import React from "react";
import { StyleSheet, Dimensions } from "react-native";
import { Block } from "galio-framework";
import { Button, withTheme } from "react-native-paper";
import Modal from "react-native-modal";
import DateTimePicker from "@react-native-community/datetimepicker";

import HelperText from "../Utility/HelperText";
import Form from "../Utility/Form";

const moment = require("moment");

const { width, height } = Dimensions.get("screen");

class AgeAndIntensity extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      visible: false,
      dob: new Date(),
      dobModalVisible: false,
      dobChosen: false,
    };
  }

  componentDidMount() {
    let prev = this.props.getState()[2];
    if (prev != undefined) {
      this.setState({ dob: prev.dob, intensity: prev.intensity });
    }
  }

  setDate = (event, dob) => {
    this.setState({ dob });
  };

  render() {
    colors = this.props.theme.colors;
    return (
      <Block flex style={{ backgroundColor: colors.dBlue }}>
        <Modal
          animationType="slide"
          transparent={true}
          isVisible={this.state.dobModalVisible}
          onBackdropPress={() => {
            this.setState({ dobModalVisible: false, dobChosen: true });
          }}
          backdropOpacity={0}
          style={{
            position: "absolute",
            bottom: 0,
            width: width,
            flex: 1,
            margin: 0,
          }}
        >
          <Block style={{ backgroundColor: "#FFF" }}>
            <DateTimePicker
              mode="date"
              value={this.state.dob}
              onChange={this.setDate}
              textColor={colors.white}
              style={{
                backgroundColor: colors.iosBackground,
                textColor: colors.white,
              }}
            />
          </Block>
        </Modal>
        <Form>
          <Block center>
            <Block center middle style={{ marginBottom: 12 }}>
              <Button
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  borderColor: "#FFF",
                  marginTop: 8,
                }}
                icon="menu-down"
                dark={true}
                mode="text"
                onPress={() => {
                  this.setState({ dobModalVisible: true });
                }}
                theme={{
                  colors: { primary: colors.white },
                  fonts: { medium: this.props.theme.fonts.regular },
                }}
              >
                {this.state.dob.toDateString() != new Date().toDateString()
                  ? this.state.dob.toDateString()
                  : "Select Your Date of Birth"}
              </Button>
              <HelperText
                visible={
                  moment().diff(
                    moment(this.state.dob.getTime()),
                    "years",
                    false
                  ) < 13 && this.state.dobChosen
                }
                text="You must be 13 to use PikApp"
              />
            </Block>
            <Block row style={styles.buttonBlock}>
              <Button
                style={{ marginBottom: 0 }}
                onPress={() => {
                  this.props.prevFn();
                  this.props.saveState(2, this.state);
                  this.props.setState(this.state.dob, this.state.intensity);
                }}
                theme={{
                  colors: { primary: colors.orange },
                  fonts: { medium: this.props.theme.fonts.regular },
                }}
                uppercase={false}
              >
                Back
              </Button>
              <Button
                disabled={
                  this.state.dob.toDateString() == new Date().toDateString() ||
                  moment().diff(
                    moment(this.state.dob.getTime()),
                    "years",
                    false
                  ) < 13
                }
                onPress={() => {
                  this.props.setState(this.state.dob, () => {
                    this.props.nextFn();
                  });
                }}
                mode={"contained"}
                theme={{
                  colors: { primary: colors.orange },
                  fonts: { medium: this.props.theme.fonts.regular },
                }}
                dark={true}
                style={[
                  { marginLeft: "auto", marginBottom: 0 },
                  this.state.dob.toDateString() == new Date().toDateString() ||
                  moment().diff(
                    moment(this.state.dob.getTime()),
                    "years",
                    false
                  ) < 13
                    ? { opacity: 0.3, backgroundColor: colors.orange }
                    : null,
                ]}
                uppercase={false}
              >
                Sign Up
              </Button>
            </Block>
          </Block>
        </Form>
      </Block>
    );
  }
}

const styles = StyleSheet.create({
  buttonBlock: {
    width: "100%",
    marginTop: 16,
  },
});

export default withTheme(AgeAndIntensity);
