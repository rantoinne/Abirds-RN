import React, {Component} from 'react';
import { View, StyleSheet, Image, Text, ScrollView, Platform, StatusBar } from 'react-native';
import abirds from '../../assets/abirds.png';
import { TextField } from 'react-native-material-textfield';
import Spinner from 'react-native-loading-spinner-overlay';
import BrandIcons from 'react-native-vector-icons/FontAwesome5';
import { RaisedTextButton, RaisedButton } from 'react-native-material-buttons';
import { AccessToken, LoginManager } from 'react-native-fbsdk';
import { GoogleSignin, statusCodes } from 'react-native-google-signin';
import firebase from 'react-native-firebase';
import * as EmailValidator from 'email-validator';

const styles = StyleSheet.create({
    logo: {
        width: 128,
        height: 128,
        alignSelf: "center",
        marginTop: 16
    }
});

export default class LoginScreen extends Component {

    state = {
        email: '',
        emailErrorMessage: null,
        emailValid: false,
        password: '',
        passwordErrorMessage: null,
        loading: false
    };

    willFocus = this.props.navigation.addListener(
        'willFocus',
        payload => {
          this.componentDidMount();
        }
      );

credentialError(e){
    if(e != null){
        if (e.code === statusCodes.SIGN_IN_CANCELLED) {
            // user cancelled the login flow
            this.setState({
                loading: false,
                emailErrorMessage: null
            });
          } else if (e.code === statusCodes.IN_PROGRESS) {
            // operation (f.e. sign in) is in progress already
            this.setState({
                loading: false,
                emailErrorMessage: "An operation or sign in is in progress."
            });
          } else if (e.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
            // play services not available or outdated
            this.setState({
                loading: true,
                emailErrorMessage: "Google Play Services is not available."
            });
          } else {
            // some other error happened
            this.setState({
                loading: false,
                emailErrorMessage: e.message
            });
          }
    } else {
        // some other error happened
        this.setState({
            loading: false,
            emailErrorMessage: e==null?null:e.message
        });
      }
    console.warn(e.message);
}

loginWithGoogle(props) {
    this.setState({
        loading: true
    });
    GoogleSignin.hasPlayServices().then(()=>{
        GoogleSignin.signIn().then((data)=>{
            const credential = firebase.auth.GoogleAuthProvider.credential(data.idToken, data.accessToken);
    
            firebase.auth().signInAndRetrieveDataWithCredential(credential).then((currentUser)=>{
                firebase.firestore().collection("users").doc(currentUser.user.uid).set({name: currentUser.user.displayName}, {merge: true});
                this.setState({
                    loading: false,
                    emailErrorMessage: null
                });
    
                props.navigation.navigate('Home');
            }).catch((error)=>this.credentialError(error));
        }).catch((error)=>this.credentialError(error));
    }).catch((error)=>this.credentialError(error));
}

loginWithFacebook(props) {
    this.setState({
        loading: true
    });
    LoginManager.logInWithReadPermissions(['public_profile', 'email']).then((result)=>{
        if(result.isCancelled) {
            throw null;
        }
    
        AccessToken.getCurrentAccessToken().then((data)=>{         
            if(!data) {
                throw new Error("Something wen't wrong. Try Again.");
            }
        
            const credential = firebase.auth.FacebookAuthProvider.credential(data.accessToken);
        
            firebase.auth().signInAndRetrieveDataWithCredential(credential).then((currentUser)=>{
                firebase.firestore().collection("users").doc(currentUser.user.uid).set({name: currentUser.user.displayName}, {merge: true});
                this.setState({
                    loading: false,
                    emailErrorMessage: null
                });
            
                props.navigation.navigate('Home');
            }).catch((error)=>this.credentialError(error));
        }).catch((error)=>this.credentialError(error));
    }).catch((error)=>this.credentialError(error));
}

    login(props){
        if(props == null) return;
        if(this.state.password == null || this.state.password.trim() == "") return;
        this.setState({
            loading: true
        });
        firebase.auth().signInAndRetrieveDataWithEmailAndPassword(this.state.email, this.state.password).then((user)=>{
            this.setState({
                loading: false
            });
            if(user.user.emailVerified)
            props.navigation.navigate('Home');
            else {
                this.setState({
                    loading: true
                });
                user.user.sendEmailVerification().then(()=>{
                    this.setState({
                        loading: false
                    });
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
                        body: "Please Try Again, If your email is failing to be verified, Please contact The SwitchQR Team.",
                        finishNavigate: "Login"
                    });
                });
            }
        }).catch((reason)=>{
            this.setState({
                loading: false,
                emailErrorMessage: reason.message
            });
        });
    }

    register(props){
        props.navigation.navigate('Register');
    }

    forgotPassword(props){
        props.navigation.navigate('ForgotPassword');
    }

    componentDidMount(){
        StatusBar.setHidden(false);
        if(Platform.OS == 'android'){
            StatusBar.setTranslucent(false);
            StatusBar.setBackgroundColor("#000000");
            StatusBar.setBarStyle("light-content");
        }
        else StatusBar.setBarStyle("dark-content");
    }

    checkIsEmailValid(email){
        this.setState({
            emailValid: EmailValidator.validate(email),
            emailErrorMessage: EmailValidator.validate(email)?null:"Your email is invalid"
        });
    }

    render() {
        return (
        <View style={{flex: 1, backgroundColor: "#fff"}}>
        <Spinner visible={this.state.loading} textContent={"Loading..."} textStyle={{color: '#FFFFFF'}} />
        <ScrollView style={{flex: 1, zIndex: 1}}>
            <View style={{flex: 1, backgroundColor: "#fff", shadowColor: '#651fff', shadowOpacity: 0}}>
            <Image style={styles.logo} source={abirds}/>
            <Text style={{alignSelf: "center", fontSize: 24, color: "#000000", fontWeight: "700"}}>
                Welcome to SwitchQR
            </Text>
            <View style={{margin: 32, marginTop: 12}}>
                <TextField
                    label='Email'
                    value={this.state.email}
                    tintColor="#000000"
                    errorColor="#FF0000"
                    error={this.state.emailErrorMessage}
                    maxLength={50}
                    textContentType="emailAddress"
                    keyboardType="email-address"
                    onChangeText={(email) => {
                        this.setState({ email, emailErrorMessage: null });
                        this.checkIsEmailValid(email);
                    }}
                />
                <TextField
                    label='Password'
                    value={this.state.password}
                    tintColor="#000000"
                    errorColor="#FF0000"
                    error={this.state.passwordErrorMessage}
                    secureTextEntry={true}
                    maxLength={50}
                    textContentType="password"
                    onChangeText={(password) => {
                        this.setState({ password, passwordErrorMessage: null });
                    }}
                />
                <Text style={{alignSelf: "flex-end", color: "#000000"}} onPress={()=>this.forgotPassword(this.props)}>Forgot password?</Text>
                <View style={{marginTop: 24, backgroundColor: "transparent"}}>
                    <RaisedTextButton onPress={this.state.emailValid?()=>this.login(this.props):()=>this.login(null)} title="Login" color="#000000" titleColor="#FFFFFF" style={{shadowOpacity: 0, height: 48, borderRadius: 6, elevation: 0}}/>
                </View>
                <View style={{backgroundColor: "transparent"}}>
                    <Text style={{margin: 20, alignSelf: "center"}}>or</Text>
                </View>
                <View style={{marginTop: 0, backgroundColor: "transparent"}}>
                <RaisedButton onPress={()=>this.loginWithFacebook(this.props)} color="#FFFFFF" style={{shadowOpacity: 0, height: 48, borderRadius: 6, elevation: 0, borderColor: "#000000", borderWidth: 1}}>
                    <View style={{flex: 1, alignItems: "center", flexDirection: "row"}}>
                        <View style={{flex: 1, alignItems: "center", flexDirection: "column"}}>
                            <View style={{height: 24, alignItems: "center", flexDirection: "row"}}>
                                <BrandIcons name="facebook-f" color="#000000" size={16} style={{marginRight: 12}}/>
                                <Text style={{color: "#000000", fontWeight: "700", fontSize: 14}}>Sign in with Facebook</Text>
                            </View>
                        </View>
                    </View>
                    </RaisedButton>
                </View>
                <View style={{marginTop: 12, backgroundColor: "transparent"}}>
                    <RaisedButton onPress={()=>this.loginWithGoogle(this.props)} color="#FFFFFF" style={{shadowOpacity: 0, height: 48, borderRadius: 6, elevation: 0, borderColor: "#000000", borderWidth: 1}}>
                    <View style={{flex: 1, alignItems: "center", flexDirection: "row"}}>
                        <View style={{flex: 1, alignItems: "center", flexDirection: "column"}}>
                            <View style={{height: 24, alignItems: "center", flexDirection: "row"}}>
                                <BrandIcons name="google" color="#000000" size={16} style={{marginRight: 12}}/>
                                <Text style={{color: "#000000", fontWeight: "700", fontSize: 14}}>Sign in with Google</Text>
                            </View>
                        </View>
                    </View>
                    </RaisedButton>
                </View>
                <View style={{backgroundColor: "transparent"}}>
                    <Text style={{margin: 20, alignSelf: "center", color: "#000000"}} onPress={()=>this.register(this.props)}>Not a member yet? Register</Text>
                </View>
            </View>
        </View>
        </ScrollView>
        </View>
        );
    }

}