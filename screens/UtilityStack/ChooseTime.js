import React from "react";
import { Dimensions, StyleSheet } from "react-native";
import { Block } from "galio-framework";
import { withTheme, Button, Caption } from "react-native-paper";
import DateTimePicker from "@react-native-community/datetimepicker";

import "firebase/firestore";

const moment = require("moment");

const { height, width } = Dimensions.get("window");

class ChooseTime extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      dateTime: new Date(),
      now: new Date(),
    };
  }

  componentDidMount() {
    let now = new Date();
    now.setHours(now.getHours() + Math.round(now.getMinutes() / 60));
    now.setMinutes(Math.round(now.getMinutes() / 60) == 0 ? 30 : 0);
    this.setState({ dateTime: now, now });
  }

  onChange = (event, dateTime) => {
    this.setState({ dateTime });
  };

  render() {
    const colors = this.props.theme.colors;
    return (
      <Block
        flex
        middle
        style={{
          backgroundColor: colors.dBlue,
          padding: 16,
        }}
      >
        <Block
          column
          center
          style={{
            backgroundColor: colors.dBlue,
            padding: 16,
            borderWidth: 2,
            borderColor: colors.orange,
            borderRadius: 8,
            width: "100%",
          }}
        >
          <Button
            mode='contained'
            dark={false}
            style={styles.createButton}
            onPress={() => {
                let now = new Date()
                this.props.navigation.navigate('GameForm', {time: {
                        time:now.toJSON(),
                        timeString: "Now"
                    }});
            }}
            theme={{
              colors: { primary: colors.white },
              fonts: { medium: this.props.theme.fonts.regular },
            }}
            uppercase={false}
          >
            Now
          </Button>
          <Caption style={{ color: colors.grey }}>or</Caption>
          <DateTimePicker
            mode='datetime'
            onChange={this.onChange}
            value={this.state.dateTime}
            minimumDate={this.state.now}
            minuteInterval={30}
            style={{ width: "100%" }}
          />
          <Button
            mode='contained'
            dark={true}
            style={styles.createButton}
            onPress={() =>
                this.props.navigation.navigate('GameForm', {time: {
                    time:this.state.dateTime.toJSON(),
                    timeString: moment(this.state.dateTime).format("ddd, MMM D, h:mm A")
                }})
            }
            theme={{
              colors: { primary: colors.orange },
              fonts: { medium: this.props.theme.fonts.regular },
            }}
            uppercase={false}
          >
            Select
          </Button>
        </Block>
      </Block>
    );
  }
}

const styles = StyleSheet.create({
});

export default withTheme(ChooseTime);
