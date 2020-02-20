import React from 'react';
import {Dimensions,Keyboard,TouchableWithoutFeedback,ScrollView,TouchableOpacity} from 'react-native';
import {Block} from 'galio-framework';

import {withTheme, TextInput, Text, Headline, Subheading, Button} from 'react-native-paper'

import Notification from '../components/Notification'

import * as firebase from 'firebase';
import 'firebase/firestore';
import HeaderBlock from '../components/HeaderBlock';

const {height, width} = Dimensions.get('window');

class UserList extends React.Component {

    constructor(props){
        super(props);
        this.state = {
            users:new Array(),
            complete:false
        }
    }

    componentDidMount(){
        let users = new Array();
        this.props.navigation.getParam('users',[]).forEach(user => {
            users.push(firebase.firestore().collection('users').doc(user).get().then(user => {
                let userData = user.data();
                userData.id = user.id;
                return userData;
            }))
        })
        Promise.all(users).then((users) => {
            this.setState({users,complete:true});
        });
    }

    navToUserProfile = (id) => {
        if(id != firebase.auth().currentUser.uid){
          this.props.navigation.push("UserProfile", {userId:id});
         } else {
          this.props.navigation.navigate('Profile')
         }
      }

    render(){
        const colors = this.props.theme.colors;
        return (
            <>
                <TouchableWithoutFeedback onPress={Keyboard.dismiss} height={height} width={width}>
                    <Block column center flex style={{backgroundColor:colors.dBlue,width,padding:16, paddingTop:56}}>
                        <HeaderBlock text={this.props.navigation.getParam('listType',null)} backButton={true} backPress={() => this.props.navigation.goBack()} />
                            {
                                this.state.complete
                                ? (this.state.users.length > 0
                                    ? <ScrollView style={{width:'100%'}}>
                                        {
                                            this.state.users.map((user,key) => {
                                                return (
                                                    <TouchableOpacity onPress={() => this.navToUserProfile(user.id)} key={key} style={{width:'100%'}}>
                                                        <Block row center middle style={{justifyContent:'space-between',borderColor:colors.orange,borderWidth:1,borderRadius:8, padding: 10, width:'100%', marginBottom:10}}>
                                                            <Block column>
                                                                <Text style={{color:"#fff"}}>{user.name}</Text>
                                                                <Text style={{color:"#fff"}}>@{user.username}</Text>
                                                            </Block>
                                                            <Text style={{color:"#fff"}}>{`${user.wins}-${user.losses}`}</Text>
                                                        </Block>
                                                    </TouchableOpacity>
                                                )
                                            })
                                        }
                                    </ScrollView>
                                    :   <Block center middle style={{ borderColor:colors.orange, borderWidth:1, borderRadius:8, width:'100%', padding:8}}>
                                            <Headline style={{color:colors.grey,fontSize:20,textAlign:'center'}}>No Users</Headline>
                                        </Block>
                                )
                                : null
                            }
                    </Block>
                </TouchableWithoutFeedback>
            </>
        );
        
    }
}

export default withTheme(UserList);