import React from 'react';
import {StyleSheet,TouchableOpacity} from 'react-native';
import { Block } from 'galio-framework';
import HeaderBlock from '../Utility/HeaderBlock';
import { Subheading, Text, withTheme } from 'react-native-paper';
import ProfilePic from '../Utility/ProfilePic';
import firebase from 'firebase';

class Message extends React.Component{
    render(){
        colors = this.props.theme.colors
        if(this.props.message.senderId == firebase.auth().currentUser.uid){
            return (
                <Block style={{flexDirection:'row-reverse',marginBottom:8}}>
                    {
                        this.props.messageBelow == undefined || this.props.messageBelow.senderId != this.props.message.senderId
                        ? <Block style={{marginTop:"auto"}} >
                            <ProfilePic size={30} proPicUrl={this.props.picture}/>
                        </Block>
                        : null
                    }
                    <Block flex column style={{borderColor:colors.white,paddingRight: 8}}>
                        {
                            this.props.messageAbove == undefined || this.props.messageAbove.senderId != this.props.message.senderId
                            ? <Text style={{color:colors.grey,marginLeft:'auto',marginRight:(!(this.props.messageBelow == undefined || this.props.messageBelow.senderId != this.props.message.senderId) ? 34 : 0),paddingBottom:4}}>{`@${this.props.message.senderName}`}</Text>
                            : null
                        }
                        <Text style={[{color:colors.white, marginLeft:'auto', padding:10, borderColor: colors.orange, borderRadius: 8, borderWidth: 1},!(this.props.messageBelow == undefined || this.props.messageBelow.senderId != this.props.message.senderId) ? {marginRight:34} : null ]}>{this.props.message.content}</Text>
                    </Block>
                </Block>
            )
        } else if(this.props.message.senderId == null){
            return (
                <Block center middle style={{marginBottom:8,marginTop:8}}>
                    <Text style={{color:colors.grey,marginLeft:'auto'}}>{`${this.props.message.content}`}</Text>
                </Block>
            )
        } else {
            return (
                <Block style={{flexDirection:'row',marginBottom:8}}>
                    {
                        this.props.messageBelow == undefined || this.props.messageBelow.senderId != this.props.message.senderId
                        ? <TouchableOpacity style={{marginTop:"auto"}} onPress={() => this.props.navigation.navigate('UserProfile', {userId:this.props.message.senderId})}>
                            <ProfilePic size={30} proPicUrl={this.props.picture}/>
                        </TouchableOpacity>
                        : null
                    }
                    <Block flex column style={{borderColor:colors.white,paddingLeft:8}}>
                        {
                            this.props.messageAbove == undefined || this.props.messageAbove.senderId != this.props.message.senderId
                            ? <TouchableOpacity style={{marginTop:"auto"}} onPress={() => this.props.navigation.navigate('UserProfile', {userId:this.props.message.senderId})}>
                            <Text style={{color:colors.grey,marginRight:'auto',marginLeft:(!(this.props.messageBelow == undefined || this.props.messageBelow.senderId != this.props.message.senderId) ? 34 : 0),paddingBottom:4}}>{`@${this.props.message.senderName}`}</Text>
                            </TouchableOpacity>
                            : null
                        }
                        <Text style={[{color:colors.white, marginRight:'auto', padding:10, borderColor: colors.white, borderRadius: 8, borderWidth: 1},!(this.props.messageBelow == undefined || this.props.messageBelow.senderId != this.props.message.senderId) ? {marginLeft:34} : null ]}>{this.props.message.content}</Text>
                    </Block>
                </Block>
            )
        }
        
    }
}

export default withTheme(Message);