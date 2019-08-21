import React from "react";
import {
  StyleSheet,
  Dimensions,
  KeyboardAvoidingView,
  View,
  DatePickerIOS,
} from "react-native";
import { Block } from "galio-framework";

import {Button,Headline,withTheme,HelperText} from 'react-native-paper';

import { argonTheme } from "../constants";

import Modal from 'react-native-modal';

const moment = require('moment');

const { width, height } = Dimensions.get("screen");

class AgeAndIntensity extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      visible: false,
      dob: new Date(),
      dobModalVisible: false,
      dobChosen: false
    }
  }

  onEmailChange = (email) => {
    this.setState({email});
  }

  onPasswordChange = (password) => {
    this.setState({password});
  }

  componentDidMount(){
    let prev = this.props.getState()[2];
    if(prev != undefined){
      this.setState({dob:prev.dob,intensity:prev.intensity});
    }
  }

  setDate = (dob) => {
    this.setState({dob});
  }

  render() {
    colors = this.props.theme.colors;
    return (
          <View
            style={{ width, height, zIndex: 1, backgroundColor:colors.dBlue }}
          >
            <Modal
                  animationType="slide"
                  transparent={true}
                  isVisible={this.state.dobModalVisible}
                  onBackdropPress={() => {this.setState({dobModalVisible:false,dobChosen:true})}}
                  backdropOpacity={0}
                  style={{position:'absolute',bottom:0,width:width, flex:1, margin:0}}
              >
                <Block style={{backgroundColor:"#FFF"}}>
                  <DatePickerIOS
                      mode="date"
                      date={this.state.dob}
                      onDateChange={this.setDate}
                  />
                </Block>
              </Modal>
            <KeyboardAvoidingView
              style={{ flex: 1 }}
              behavior="padding"
              enabled
            >
              <Block flex middle>
                <Block height={moment().diff(moment(this.state.dob.getTime()),'years',false) < 13 && this.state.dobChosen ? height * .27 : height * .25} style={[styles.registerContainer, {backgroundColor:colors.dBlue,borderColor:colors.orange}]}>
                  <Block flex>
                    <Block style={{marginTop:height*.025,height:height*.075}} middle>
                      <Headline style={{color:this.props.theme.colors.white}}>
                        Sign Up
                      </Headline>
                    </Block>
                    <Block flex center>
                      <KeyboardAvoidingView
                        style={{ flex: 1 }}
                        behavior="padding"
                        enabled
                      >
                        <Block width={width*.8} height={moment().diff(moment(this.state.dob.getTime()),'years',false) < 13 && this.state.dobChosen ? height * .07 : height*.05} style={[{ marginBottom: height*.025 }]}>
                            <Button style={{height:height*.05,display:"flex",justifyContent:"center",alignItems:"center",borderColor:"#FFF"}} icon="arrow-drop-down" dark={true} mode="text" onPress={() => {this.setState({dobModalVisible:true})}} theme={{colors:{primary:colors.white},fonts:{medium:this.props.theme.fonts.regular}}}>
                                {this.state.dob.toDateString() != new Date().toDateString() ? this.state.dob.toDateString() : "Select Your Date of Birth"}
                            </Button>
                            {
                              moment().diff(moment(this.state.dob.getTime()),'years',false) < 13 && this.state.dobChosen
                              ? (
                                <HelperText
                                  type="error"
                                  visible={moment().diff(moment(this.state.dob.getTime()),'years',false) < 13}
                                  theme={{colors:{error:colors.orange}}}
                                  style={{textAlign:'center'}}
                                >
                                  You must be 13 to use PikApp
                                </HelperText>
                              )
                              : null
                            }
                        </Block>
                        <Block row>
                          <Button onPress={() => {this.props.prevFn();this.props.saveState(2,this.state);this.props.setState(this.state.dob,this.state.intensity)}} theme={{colors:{primary:colors.orange},fonts:{medium:this.props.theme.fonts.regular}}}>
                              Back
                          </Button>
                          <Button
                              disabled={this.state.dob.toDateString() == new Date().toDateString() || moment().diff(moment(this.state.dob.getTime()),'years',false) < 13}
                              onPress={() =>{
                                this.props.setState(this.state.dob, () => {this.props.nextFn();});
                              }} 
                              mode={"contained"} 
                              theme={{colors:{primary:colors.orange},fonts:{medium:this.props.theme.fonts.regular}}} dark={true} 
                              style={[{marginLeft:'auto'}, this.state.dob.toDateString() == new Date().toDateString() || moment().diff(moment(this.state.dob.getTime()),'years',false) < 13 ? {opacity: .3, backgroundColor:colors.orange} : null]} 
                              >
                              Sign Up
                          </Button>
                        </Block>
                      </KeyboardAvoidingView>
                    </Block>
                  </Block>
                </Block>
              </Block>
            </KeyboardAvoidingView>
          </View>
    );
  }
}

const styles = StyleSheet.create({
  registerContainer: {
    width: width * 0.9,
    borderRadius: 8,
    borderWidth: 2,
    shadowColor: argonTheme.COLORS.BLACK,
    shadowOffset: {
      width: 0,
      height: 4
    },
    shadowRadius: 8,
    shadowOpacity: 0.1,
    elevation: 1,
    overflow: "hidden"
  },
  socialConnect: {
    backgroundColor: argonTheme.COLORS.WHITE,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: "#8898AA"
  },
  socialButtons: {
    width: 120,
    height: 40,
    backgroundColor: "#fff",
    shadowColor: argonTheme.COLORS.BLACK,
    shadowOffset: {
      width: 0,
      height: 4
    },
    shadowRadius: 8,
    shadowOpacity: 0.1,
    elevation: 1
  },
  socialTextButtons: {
    color: argonTheme.COLORS.PRIMARY,
    fontWeight: "800",
    fontSize: 14
  },
  inputIcons: {
    marginRight: 12
  },
  passwordCheck: {
    paddingLeft: 15,
    paddingTop: 13,
    paddingBottom: 30
  },
  createButton: {
    marginBottom:height*.025,
    height: height * .05,
    width: width * 0.5,
    alignItems: "center",
    justifyContent: "center"
  },
  input: {
    height: height*.075,
    justifyContent:"center"
  }
});

export default withTheme(AgeAndIntensity);
