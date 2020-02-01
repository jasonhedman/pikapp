import React from 'react';
import {Dimensions,Keyboard,TouchableWithoutFeedback,ScrollView,TouchableOpacity} from 'react-native';
import {Block} from 'galio-framework';

import {withTheme, TextInput, Text, Headline, Subheading, Button} from 'react-native-paper'

import Notification from '../components/Notification'

import * as firebase from 'firebase';
import 'firebase/firestore';

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
                    <Block column center flex style={{backgroundColor:colors.dBlue,width}}>
                        <Block flex width={width*.9}>
                            <Block column style={{justifyContent:'flex-end',marginTop:height*.1,}}>
                                <Button icon='navigate-before' onPress={() => this.props.navigation.goBack()} mode={'text'} theme={{colors:{primary:colors.orange},fonts:{medium:this.props.theme.fonts.regular}}} style={{marginRight:'auto'}}>
                                    Back
                                </Button>
                            </Block>
                            <Headline style={{color:"#FFF",textAlign:'center', marginBottom:height*.025}}>{this.props.navigation.getParam('listType',null)}</Headline>
                            <Block flex style={{justifyContent:'flex-start'}}>
                                {
                                    this.state.complete
                                    ? (this.state.users.length > 0
                                        ? <ScrollView style={{flex:1}}>
                                            {
                                                this.state.users.map((user,key) => {
                                                    return (
                                                        <TouchableOpacity onPress={() => this.navToUserProfile(user.id)} key={key}>
                                                            <Block row center middle style={{justifyContent:'space-between',borderColor:colors.orange,borderWidth:1,borderRadius:8, padding: 10, width: width*.9,marginBottom:10}}>
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
                                        :   <Block center middle style={{width:width*.9, borderColor:colors.orange, borderWidth:1, borderRadius:8}}>
                                                <Headline style={{color:colors.grey,fontSize:20,marginTop:height*.015,marginBottom:height*.015,textAlign:'center'}}>No Users</Headline>
                                            </Block>
                                    )
                                    : null
                                }
                            </Block>
                            
                        </Block>
                    </Block>
                </TouchableWithoutFeedback>
            </>
        );
        
    }
}

export default withTheme(UserList);