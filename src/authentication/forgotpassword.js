import React, { Component } from 'react';
import { View, Text, ScrollView, Platform, StatusBar } from 'react-native';
import { TextField } from 'react-native-material-textfield';
import Spinner from 'react-native-loading-spinner-overlay';
import { TextButton, RaisedTextButton } from 'react-native-material-buttons';
import firebase from 'react-native-firebase';

export default class ForgotPasswordScreen extends Component {

    state = {
        email: '',
        emailErrorMessage: null,
        loading: false
    };

    resetPassword(props, email){
        if(email == null || email.trim() == "") return;
        this.setState({
            loading: true
        });
        firebase.auth().sendPasswordResetEmail(email).then((user)=>{
            this.setState({
                loading: false
            });
            props.navigation.navigate('LoginActionSuccess', {
                title: "Check " + email + " on instructions to reset your password",
                body: "We successfully reset your password. Check your email for instructions on how to complete the process.",
                finishNavigate: "Login"
              });
        }).catch((e)=>{
            this.setState({
                loading: false,
            });
            props.navigation.navigate('LoginActionFailure', {
                title: "We tried to send a forgot password link to " + email,
                body: e.message,
                finishNavigate: "Login"
              });
        });
    }

    componentDidMount(){
        if(Platform.OS == 'android') {
            StatusBar.setBackgroundColor("#000000");
            StatusBar.setBarStyle("light-content");
        }
        else StatusBar.setBarStyle("dark-content");
    }

    render(){
        return <View style={{flex: 1, backgroundColor: "#fff"}}>
        <Spinner visible={this.state.loading} textContent={"Loading..."} textStyle={{color: '#FFFFFF'}} />
            <ScrollView style={{flex: 1}}>
        <View style={{margin: 24, marginBottom: 0}}>
            <Text style={{alignSelf: "center", textAlign: "center"}}>Welcome to SwitchQR. Use the field below to reset your password.</Text>
        </View>
            <View margin={32} marginVertical={0}>
                <TextField 
                label="Email"
                value={this.state.email}
                tintColor="#000000"
                errorColor="#FF0000"
                error={this.state.emailErrorMessage}
                onChangeText={ (email) => {
                    this.setState({ email, emailErrorMessage: null });
                } }/>
            </View>
            <View style={{margin: 24, backgroundColor: "transparent"}}>
                <RaisedTextButton onPress={()=>this.resetPassword(this.props, this.state.email)} title="Reset Password" color="#000000" titleColor="#FFFFFF" style={{shadowOpacity: 0, height: 48, borderRadius: 6, elevation: 0}}/>
            </View>
        </ScrollView>
        </View>;
    }

}