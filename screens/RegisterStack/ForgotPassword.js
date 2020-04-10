import React from "react";
import {
  Dimensions,
} from "react-native";

import {withTheme} from 'react-native-paper';
import Form from '../../components/Utility/Form';
import HeaderBlock from '../../components/Utility/HeaderBlock';
import ButtonBlock from '../../components/Utility/ButtonBlock';
import InputBlock from '../../components/Utility/InputBlock';
import HelperText from '../../components/Utility/HelperText';



import * as firebase from 'firebase';

const { width, height } = Dimensions.get("screen");

class Register extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      modalEmail:"",
      submitted: false,
      error:false
    }
  }

  onModalEmailChange = (modalEmail) => {
    this.setState({modalEmail:modalEmail.toLowerCase()});
  }

  onSubmit = () => {
    firebase.auth().sendPasswordResetEmail(this.state.modalEmail)
      .then(() => {
        this.setState({submitted:true})
      })
      .catch((err) => {
        this.setState({error:true})
      })
  }


  render() {
    colors = this.props.theme.colors;
    return (
      <Form>
        {
          this.state.submitted
          ? (
            <>
              <HeaderBlock text='Check Your Email to Reset Your Password' backButton={false}/>
              <ButtonBlock onPress={() => this.props.navigation.navigate("SignIn")} text='Back'></ButtonBlock>
            </>
          )
          : (
            <>
              <InputBlock 
                value={this.state.modalEmail}
                placeholder="Email" 
                onChange={this.onModalEmailChange}
              />
              <ButtonBlock text='Reset Password' onPress={this.onSubmit} uppercase={false}>
                <HelperText visible={this.state.error} text='This email is not associated with an account.' />
              </ButtonBlock>
            </>
          )
        }
      </Form>
    );
  }
}

export default withTheme(Register);
