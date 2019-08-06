import React, { Component } from 'react';
import { View, Text, ScrollView, Platform, StatusBar } from 'react-native';
import { TextField } from 'react-native-material-textfield';
import Spinner from 'react-native-loading-spinner-overlay';
import { TextButton, RaisedTextButton } from 'react-native-material-buttons';
import firebase from 'react-native-firebase';
import * as EmailValidator from 'email-validator';

export default class RegisterScreen extends Component {

    state = {
        name: '',
        nameErrorMessage: null,
        nameValid: false,
        email: '',
        emailErrorMessage: null,
        emailValid: false,
        password: '',
        passwordErrorMessage: null,
        errorExists: false,
        loading: false
    };

    signUp(props){
        if(this.state.email == null || this.state.email.trim() == "") return;
        if(this.state.password == null || this.state.password.trim() == "") return;
        if((this.state.name == null || this.state.name.trim() == "") || !nameValid) return;
        if(props == null) return;
        this.setState({
            loading: true
        });
        firebase.auth().createUserAndRetrieveDataWithEmailAndPassword(this.state.email, this.state.password).then((user)=>{
            user.user.updateProfile({displayName: this.state.name});
            firebase.firestore().collection("users").doc(user.user.uid).set({name: this.state.name}, {merge: true});
            user.user.sendEmailVerification().then(()=>{
                this.setState({
                    loading: false
                });
                firebase.auth().signOut();
                props.navigation.navigate('LoginActionSuccess', {
                    title: "Just one more step",
                    body: "We have successfully made your account. To login to SwitchQR, you have to verify your email. Check " + this.state.email + " for a link to verify your email.",
                    finishNavigate: "Login"
                });
            }).catch((e)=>{
                this.setState({
                    loading: false
                });
                props.navigation.navigate('LoginActionFailure', {
                    title: "Failed to send verification email",
                    body: "To continue, Sign in and follow the instructions.",
                    finishNavigate: "Login"
                });
            });
        }).catch((e)=>{
            this.setState({
                loading: false,
                emailErrorMessage: e.message
            });
        });
    }

    checkIsEmailValid(email){
        this.setState({
            emailValid: EmailValidator.validate(email),
            emailErrorMessage: EmailValidator.validate(email)?null:"Your email is invalid"
        });
    }

    checkIsNameValid(name){
        this.setState({
            nameValid: (name.length >= 3),
            nameErrorMessage: (name.length >= 3)?null:"Your name is too short"
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
            <Text style={{alignSelf: "center", textAlign: "center"}}>Welcome to SwitchQR. Use the fields below to register.</Text>
        </View>
            <View margin={32} marginVertical={0}>
                <TextField 
                label="Name"
                value={this.state.name}
                tintColor="#000000"
                errorColor="#FF0000"
                error={this.state.nameErrorMessage}
                onChangeText={(name) => {
                    this.setState({ name, nameErrorMessage: null });
                    this.checkIsNameValid(name);
                }}/>
            </View>
            <View margin={32} marginVertical={0}>
                <TextField 
                label="Email"
                value={this.state.email}
                tintColor="#000000"
                errorColor="#FF0000"
                error={this.state.emailErrorMessage}
                onChangeText={(email) => {
                    this.setState({ email, emailErrorMessage: null });
                    this.checkIsEmailValid(email);
                }}/>
            </View>
            <View margin={32} marginVertical={0}>
                <TextField 
                label="Password"
                value={this.state.password}
                tintColor="#000000"
                errorColor="#FF0000"
                secureTextEntry={true}
                maxLength={50}
                textContentType="password"
                error={this.state.passwordErrorMessage}
                onChangeText={ (password) => {
                    this.setState({ password: password, passwordErrorMessage: null });
                } }/>
            </View>
            <View style={{margin: 24, backgroundColor: "transparent"}}>
                <RaisedTextButton onPress={this.state.emailValid?()=>this.signUp(this.props):()=>this.signUp(null)} title="Register" color="#000000" titleColor="#FFFFFF" style={{shadowOpacity: 0, height: 48, borderRadius: 6, elevation: 0}}/>
            </View>
        </ScrollView>
        </View>;
    }

}