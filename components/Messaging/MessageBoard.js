import React from 'react';
import {StyleSheet,ScrollView,KeyboardAvoidingView} from 'react-native';
import { Block } from 'galio-framework';
import HeaderBlock from '../Utility/HeaderBlock';
import Message from './Message';
import MessageInput from './MessageInput';
import {Button,Headline,withTheme} from 'react-native-paper';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
class MessageBoard extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            messages:new Array()
        }
    }
    componentDidMount(){
        this.props.messages.orderBy('created', 'desc').limit(10).onSnapshot((allMessages) => {
            let messages = [];
            allMessages.forEach((message) => {
                messages.push(message.data());
            })
            this.setState({messages})
        })
    }

    render(){
        const colors = this.props.theme.colors
        return (
            <Block flex column style={styles.container}>
                {/* <Block center style={{width:'100%'}}>
                    <Headline style={{color:this.props.theme.colors.white,textAlign:'center'}}>Messages</Headline>
                </Block> */}
                <ScrollView contentContainerStyle={{marginTop:'auto',flexDirection:'column-reverse',flex:1}}>
                {
                    this.state.messages.map((message, index) => {
                        return <Message key={index} message={message} />
                    })
                }
                </ScrollView>
                <MessageInput />                
            </Block>
        )
    }
}

const styles = StyleSheet.create({
    container: {
        width: '100%',
    }
})

export default withTheme(MessageBoard);