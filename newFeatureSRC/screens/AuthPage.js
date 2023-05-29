import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  View,
  Pressable,
  TouchableWithoutFeedback,
  Keyboard,
  ActivityIndicator,
  SafeAreaView,
  Dimensions
} from "react-native";
import { app } from "../../firebase";
import {
  getAuth,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import Colors from "../custom/colors";
import Header from "../custom/header";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";


const auth = getAuth(app);
const db = getFirestore(app);

const AuthPage = () => {
  const windowWidth = Dimensions.get('window').width;
  const windowHeight = Dimensions.get('window').height;

  const [email, SetEmail] = useState("");
  const [password, SetPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const LoadingScrean = () => {
    return (
      <BlurView intensity={60} style={styles.ActivityIndicatorStyle}>
     <ActivityIndicator  size={60} color={Colors.textColor} style={{ 
    position: "absolute", 
    top: windowHeight / 2,
    left: windowWidth / 2,
    translateX: -30,
    translateY: -30
  }} />
    </BlurView>
      )
  };  

  const handleLogin = () => {
    signInWithEmailAndPassword(auth, email, password)
      .then((userCreadentials) => {
        setIsLoading(true);
      })
      .catch((err) => {
        alert(`Грешен имейл или парола!`);
      });
  };

  return (
    <SafeAreaView>
      <Header />
      <TouchableWithoutFeedback
        onPress={() => {
          Keyboard.dismiss();
        }}
        >
        <LinearGradient
          colors={[Colors.backgroundFirstColor, Colors.backgroundSecondColor]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          
        >
          <View style={styles.body}>
            <View style={styles.loadingView}>
              {isLoading ? LoadingScrean() : null}
            </View>
            <View style={[styles.mainContent]}>
              <LinearGradient
              
                colors={[
                  Colors.secondaryBackgroundFirstColor,
                  Colors.secondaryBackgroundSecondColor,
                ]}
                style={styles.secondContent}
                start={{ x: 0, y: 1 }}
                end={{ x: 0, y: 0 }}
                
              >
                <LinearGradient
                  colors={[
                    Colors.titleViewsFirstColor,
                    Colors.titleViewsSecondColor,
                  ]}
                  style={styles.logInTextLinear}
                  start={{ x: 0, y: 1 }}
                  end={{ x: 0, y: 0 }}
                >
                  <Text style={styles.logInText}>Влез в своя акаунт</Text>
                </LinearGradient>

                <TextInput
                  style={styles.inputBox}
                  placeholder="Имейл"
                  value={email}
                  onChangeText={(email) => SetEmail(email)}
                />
                <TextInput
                  style={styles.inputBox}
                  placeholder="Парола"
                  secureTextEntry={true}
                  value={password}
                  onChangeText={(text) => SetPassword(text)}
                />
                <LinearGradient
                  colors={[Colors.buttonsFirstColor, Colors.buttonsSecondColor]}
                  style={styles.submitBtnLinear}
                  start={{ x: 0, y: 1 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Pressable style={styles.LogInBtn} onPress={handleLogin}>
                    <Text style={styles.submitBtnText}>Влез</Text>
                  </Pressable>
                </LinearGradient>
              </LinearGradient>
            </View>
          </View>
        </LinearGradient>
      </TouchableWithoutFeedback>
  </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  //main
  body: {
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    marginTop: -50,
  },
  mainContent: {
    position: "absolute",
    flexDirection: "column",
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  secondContent: {
    width: 350,
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
    borderRadius: 16,
    shadowColor: Colors.textColor,
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.21,
    shadowRadius: 3.65,
    elevation: 6,
  },


  //content


  inputBox: {
    backgroundColor: "white",
    marginBottom: 36,
    width: 300,
    height: 55,
    borderRadius: 12,
    textAlign: "center",
    fontSize: 18,
    shadowColor: Colors.textColor,
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.21,
    shadowRadius: 3.65,
    elevation: 6,
  },
  submitBtnLinear: {
    justifyContent: "center",
    borderRadius: 16,
    shadowColor: Colors.textColor,
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.21,
    shadowRadius: 3.65,
    elevation: 6,
  },
  submitBtnText: {
    textAlign: "center",
    alignSelf: "center",
    fontSize: 16,
    fontWeight: "bold",
  },
  logInText: {
    fontWeight: "bold",
    fontSize: 28,
    color: Colors.textColor,
    textAlign: "center",
  },
  logInTextLinear: {
    width: 350,
    height: 80,
    justifyContent: "center",
    alignItems: "center",
    marginTop: -32,
    marginBottom: 36,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  LogInBtn: {
   height:50,
   paddingHorizontal:48,
   justifyContent:"center",
alignItems:"center",

  },
  ActivityIndicatorStyle: {
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    width:"100%",
    height:820,
    zIndex:100,
  },
  //main
  body: {
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    marginTop: -50,
  },
  mainContent: {
    position: "absolute",
    flexDirection: "column",
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    maxWidth:350,
  },
  mainContentLinear: {
  maxWidth:350,
  },
  secondContent: {
    // marginBottom: 100,
    width: 350,
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
    borderRadius: 16,
    shadowColor: Colors.textColor,
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.21,
    shadowRadius: 3.65,
    elevation: 6,
    maxWidth:330,
    padding:24,
  },


  //content


  inputBox: {
    backgroundColor: "white",
    marginBottom: 36,
    width: 280,
    height: 45,
    borderRadius: 12,
    textAlign: "center",
    fontSize: 18,
    shadowColor: Colors.textColor,
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.21,
    shadowRadius: 3.65,
    elevation: 6,
  },
  submitBtnLinear: {
    justifyContent: "center",
    borderRadius: 16,
    shadowColor: Colors.textColor,
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.21,
    shadowRadius: 3.65,
    elevation: 6,
  },
  submitBtnText: {
    textAlign: "center",
    alignSelf: "center",
    fontSize: 16,
    fontWeight: "bold",
  },
  logInText: {
    fontWeight: "bold",
    fontSize: 28,
    color: Colors.textColor,
    textAlign: "center",
  },
  logInTextLinear: {
    width: 330,
    height: 80,
    justifyContent: "center",
    alignItems: "center",
    marginTop: -32,
    marginBottom: 36,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  LogInBtn: {
   height:50,
   paddingHorizontal:48,
   justifyContent:"center",
alignItems:"center",

  },
  ActivityIndicatorStyle: {
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    width:"100%",
    height:820,
    zIndex:100,
  },
});

export default AuthPage;
