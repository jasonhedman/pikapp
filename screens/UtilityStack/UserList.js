import React from 'react';
import {Dimensions,Keyboard,TouchableWithoutFeedback,ScrollView,TouchableOpacity} from 'react-native';
import {Block} from 'galio-framework';

import {withTheme, Text, Headline} from 'react-native-paper'

import * as firebase from 'firebase';
import 'firebase/firestore';
import HeaderBlock from '../../components/Utility/HeaderBlock';

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
        (this.props.route.params.users != undefined ? this.props.route.params.users : []).forEach(user => {
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
          this.props.navigation.navigate('ProfileStack')
         }
      }

    render(){
        const colors = this.props.theme.colors;
        return (
            <>
                <TouchableWithoutFeedback onPress={Keyboard.dismiss} height={height} width={width}>
                    <Block column center flex style={{backgroundColor:colors.dBlue,width,padding:16}}>
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
                                                        <Text style={{color:"#fff"}}>{`${user.points} point${user.points == 1 ? "" : 's'}`}</Text>
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