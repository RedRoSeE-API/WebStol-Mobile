import React from "react";
import {
  StyleSheet,
  Text,
  View,
  Image,
  Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Colors from "../custom/colors";
import logo from "../images/logo.png";
import useAuth from "../useAuth";

export default function Header({ navigation }) {
  const { user, userRole, userSingOut } = useAuth();



  return (
    <LinearGradient
      colors={[Colors.headerFirstColor, Colors.headerSecondColor]}
      style={styles.linearHeader}
      start={{ x: 0, y: 1 }}
      end={{ x: 1.3, y: 1 }}
    >
    <View style={styles.header}>
        <Image style={styles.logoImg} source={logo}></Image>
        <View style={styles.ViewText}>
          {!user ? (
            <Text style={styles.headerText}>WebStol</Text>
          ) : (
            <>
              {userRole === "teacher" ? (
                <View style={styles.webstolView}>
                  <Text style={styles.headerText}>WebStol</Text>
                  <Text style={styles.headerTextTwo}>TEACHER</Text>
                </View>
              ) : (
                <View style={styles.webstolView}>
                  <Text style={styles.headerText}>WebStol</Text>
                  <Text style={styles.headerTextTwo}>STUDENT</Text>
                </View>
              )}
            </>
          )}
        </View>
        {!user ? (
          <Text style={styles.noUserText}></Text>
        ) : (
          <LinearGradient
            colors={[Colors.buttonsFirstColor, Colors.buttonsSecondColor]}
            style={styles.LogOut}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Text onPress={userSingOut} style={styles.LogOutText}>
              Излез
            </Text>
          </LinearGradient>
        )}
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  header: {
    // paddingTop:16,
    width: "100%",
    height: 100,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: Platform.OS === "ios" ? "space-around" : "space-around",
  },
  noUserText: {
    paddingLeft: 80,
  },
  headerImg: {
    marginLeft: 46,
  },
  logoImg: {
    width: 65,
    height: 65,
    marginLeft: 4,
  },
  headerText: {
    textAlign: "center",
    fontSize: 28,
    fontWeight: "bold",
    marginLeft: 10,
    color: Colors.textColor,
  },
  headerTextTwo: {
    fontWeight: "bold",
    fontSize: 14,
    marginTop: Platform.OS === "ios" ? -4: -8,
  
    marginLeft: 10,
    color: Colors.textColor,
  },
  webstolView: {
    marginTop: 4,
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
  },
  LogOut: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 16,
    marginTop: 6,
    marginRight: 6,
    padding: 6,
    paddingLeft: 14,
    paddingRight: 14,
    marginRight: 10,
    shadowColor: Colors.textColor,
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.21,
    shadowRadius: 3.65,
    elevation: 6,
    marginTop: 12,
  },
  LogOutText: {
    fontSize: 12,
    fontWeight: "bold",
    color: Colors.textColor,
  },
});
