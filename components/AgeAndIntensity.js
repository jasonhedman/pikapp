import React from "react";
import {
  StyleSheet,
  Dimensions,
  KeyboardAvoidingView,
  View,
} from "react-native";
import { Block } from "galio-framework";
import {Button,withTheme} from 'react-native-paper';
import Modal from 'react-native-modal';
import DateTimePicker from '@react-native-community/datetimepicker';

import HeaderBlock from './HeaderBlock';
import HelperText from './HelperText';


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

  setDate = (event,dob) => {
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
                  <DateTimePicker
                      mode="date"
                      value={this.state.dob}
                      onChange={this.setDate}
                      textColor={colors.white}
                      style={{backgroundColor:colors.iosBackground,textColor:colors.white}}
                  />
                </Block>
              </Modal>
            <KeyboardAvoidingView
              style={{ flex: 1 }}
              behavior="padding"
              enabled
            >
              <Block flex middle>
                <Block style={[styles.registerContainer, {backgroundColor:colors.dBlue,borderColor:colors.orange}]}>
                  <Block>
                    <HeaderBlock text='Sign Up' backButton={false} />
                    <Block center>
                        <Block width={width*.8}  style={{ marginBottom: 12 }}>
                            <Button style={{display:"flex",justifyContent:"center",alignItems:"center",borderColor:"#FFF"}} icon="menu-down" dark={true} mode="text" onPress={() => {this.setState({dobModalVisible:true})}} theme={{colors:{primary:colors.white},fonts:{medium:this.props.theme.fonts.regular}}}>
                                {this.state.dob.toDateString() != new Date().toDateString() ? this.state.dob.toDateString() : "Select Your Date of Birth"}
                            </Button>
                            {
                              moment().diff(moment(this.state.dob.getTime()),'years',false) < 13 && this.state.dobChosen
                              ? (
                                <HelperText
                                  visible={moment().diff(moment(this.state.dob.getTime()),'years',false) < 13}
                                  styles={{textAlign:'center'}}
                                >
                                  You must be 13 to use PikApp
                                </HelperText>
                              )
                              : null
                            }
                        </Block>
                        <Block row style={styles.buttonBlock}>
                          <Button style={{marginBottom:0}} onPress={() => {this.props.prevFn();this.props.saveState(2,this.state);this.props.setState(this.state.dob,this.state.intensity)}} theme={{colors:{primary:colors.orange},fonts:{medium:this.props.theme.fonts.regular}}}>
                              Back
                          </Button>
                          <Button
                              disabled={this.state.dob.toDateString() == new Date().toDateString() || moment().diff(moment(this.state.dob.getTime()),'years',false) < 13}
                              onPress={() =>{
                                this.props.setState(this.state.dob, () => {this.props.nextFn();});
                              }} 
                              mode={"contained"} 
                              theme={{colors:{primary:colors.orange},fonts:{medium:this.props.theme.fonts.regular}}} dark={true} 
                              style={[{marginLeft:'auto',marginBottom:0}, this.state.dob.toDateString() == new Date().toDateString() || moment().diff(moment(this.state.dob.getTime()),'years',false) < 13 ? {opacity: .3, backgroundColor:colors.orange} : null]} 
                              >
                              Sign Up
                          </Button>
                        </Block>
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
    padding:16
  },
  passwordCheck: {
    paddingLeft: 15,
    paddingTop: 13,
    paddingBottom: 30
  },
  buttonBlock:{
    width:"100%",
    marginTop:16
  },
  headerBlock:{
    marginTop:16,
    marginBottom:16
  },
  ageButton:{
    display:"flex",
    justifyContent:"center",
    alignItems:"center",
    borderColor:"#FFF"
  }
});

export default withTheme(AgeAndIntensity);
