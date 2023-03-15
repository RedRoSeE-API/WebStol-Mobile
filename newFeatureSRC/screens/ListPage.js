import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  Pressable,
  ActivityIndicator,
  SafeAreaView,
  Dimensions
} from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { app } from "../../firebase";
import {
  getFirestore,
  doc,
  updateDoc,
  collection,
  getDoc,
  getDocs,
  query,
  where
} from "firebase/firestore";
import useAuth from "../useAuth";
import { LinearGradient } from "expo-linear-gradient";
import Colors from "../custom/colors";
import Header from "../custom/header";
import { BlurView } from "expo-blur";

const db = getFirestore(app);
const dbUsersUIDcollection = collection(db, "usersUID");
const dbMealsCollection = collection(db, "meals");
const dbInfoCollection = collection(db, "dbInfo");

const MainPage = () => {

  const windowWidth = Dimensions.get('window').width;
  const windowHeight = Dimensions.get('window').height;

  const { user, userRole } = useAuth();
  const [_TIME, set_TIME] = useState();
  const [priceForOneMeal, setPriceForOneMeal] = useState();
  const [teacherClass, setTeacherClass] = useState();
  const [userInfoFromDB, setUserInfoFromDB] = useState([]);
  const [isLoadingSTInfo, setIsLoadingSTInfo] = useState(true);
  const [isLoading, setIsLoading] = useState(false);


  const LoadingScrean = () => {
    return (
      <BlurView intensity={60} style={styles.ActivityIndicatorStyle}>
    <ActivityIndicator  size={60} color={Colors.textColor} style={{ 
    position: "absolute", 
    top: windowHeight / 2,
    left: windowWidth / 2,
    transform: [
      { translateX: -30 },
      { translateY: -30 },

    ],
  }} />
    </BlurView>
      )
  };

  useEffect(() => {
    getUserClass();
    getDayToday();
    getPrice();
    // getStudentsInfo();
  }, []);

  const getUserClass = async () => {
    
      const docRef = doc(dbUsersUIDcollection, user.uid);
      await getDoc(docRef)
        .then((res) => {
          setTeacherClass(res.data().classTeaching);
          getStudentsInfo(res.data().classTeaching);
        })
        .catch((err) => console.log(err));
  };

  const getDayToday = async () => {
    const docRef = doc(dbInfoCollection, "time");
    await getDoc(docRef)
      .then((res) => {
        set_TIME(
          res.data().dayToday.toDate().getDay()
        );
      })
      .catch((err) => console.log(err));
  };

  const getPrice = () => {
    let docRefPrice;

    _TIME >= 1 && _TIME < 6
      ? (docRefPrice = doc(dbMealsCollection, `${_TIME}`))
      : (docRefPrice = doc(dbMealsCollection, "1"));

    getDoc(docRefPrice)
      .then((res) => {
        setPriceForOneMeal(res.data().price);
      })
      .catch((err) => console.log(err));
  };

  const getStudentsInfo = async (teacherClassVar) => {
    let q;
    if(teacherClass === undefined){
      q = query(dbUsersUIDcollection, where("class", "==", teacherClassVar))
    }
    else{
      q = query(dbUsersUIDcollection, where("class", "==", teacherClass))
    }

    const querySnapshot = await getDocs(q);
    setUserInfoFromDB([]);
    querySnapshot.forEach((doc) => {
      let updatedValue = doc.data();
          updatedValue.docID = doc.id;
      setUserInfoFromDB((userInfoFromDB) => [
        ...userInfoFromDB,
        updatedValue,
      ]);
      
    });
    setIsLoadingSTInfo(false)
  };

  const pressYES = (id) => {
    return function() {
      const docRef = doc(dbUsersUIDcollection, id.docID);

      getDoc(docRef)
        .then((res) => {
          if (!res.data().EatTrueFalse) {
            setIsLoading(true);
            updateDoc(docRef, {
              EatTrueFalse: true,
              EatTimesThisMonth: res.data().EatTimesThisMonth + 1,
              PriceDueThisMont: res.data().PriceDueThisMont + priceForOneMeal,
            })
              .then(async() => {
                
                await getStudentsInfo();
                setIsLoading(false);
              })
              .catch((err) => console.log(err));

            if (!res.data().CheckIndicatorBoolean) {
              updateDoc(docRef, {
                CheckIndicatorBoolean: true,
              });
            }
          }
        })
        .catch((err) => {
          console.log(err);
        });
    };
  };

  const pressNO = (id) => {
    return function() {
      const docRef = doc(dbUsersUIDcollection, id.docID);

      getDoc(docRef)
        .then((res) => {
          if (res.data().EatTrueFalse) {
            setIsLoading(true);
            updateDoc(docRef, {
              EatTrueFalse: false,
              EatTimesThisMonth: res.data().EatTimesThisMonth - 1,
              PriceDueThisMont: res.data().PriceDueThisMont - priceForOneMeal,
            })
              .then(async () => {
                await getStudentsInfo();
                setIsLoading(false);
              })
              .catch((err) => console.log(err));
          }
        })
        .catch((err) => {
          console.log(err);
        });
    };
  };

  function EatOrNotForDisplayUsers(prop) {
    if (prop.boolean) {
      return <Text style={styles.EatOrNotForDisplayUsersYes}>Записан/а</Text>;
    } else {
      return (
        <Text style={styles.EatOrNotForDisplayUsersNo}>Не е записан/а</Text>
      );
    }
  }

  function DisplayUsers() {
    userInfoFromDB.sort((a, b) => a.numberInClass - b.numberInClass);

    return (
      <SafeAreaView>
        <Header />
          <ScrollView
            style={styles.listScrollView}
            showsVerticalScrollIndicator={false}
          >
        <View style={styles.displayUsersView}>
          <Text style={styles.classText}>Ученици от клас {teacherClass}</Text>

            <View style={styles.paddingView}>
              {userInfoFromDB.map((item) => {
                  return (
                    <View style={styles.listMainView} key={item.numberInClass}>
                      <LinearGradient
                        colors={[
                          Colors.secondaryBackgroundFirstColor,
                          Colors.secondaryBackgroundSecondColor,
                        ]}
                        style={styles.displayUsersRowBackgroundLinear}
                        start={{ x: 0.2, y: 1 }}
                        end={{ x: 1, y: 1 }}
                      >
                        <LinearGradient
                          colors={[
                            Colors.titleViewsFirstColor,
                            Colors.titleViewsSecondColor,
                          ]}
                          style={styles.rowNameLinear}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 0, y: 1 }}
                        >
                          <View style={styles.listText}>
                            <Text style={styles.listItemNumberInClass}>
                              №{item.numberInClass}:
                            </Text>
                            <Text style={styles.listItemFullName}>
                              {item.fullName}
                            </Text>
                          </View>
                        </LinearGradient>

                        {item.PricePaid ? (
                          <>
                            <View style={styles.displayFlex}>
                              <View style={styles.listPressable}>
                                <View style={styles.btnQuestionTextViewColumn}>
                                  <Text style={styles.miniTitles}>
                                    Ще обядва ли?
                                  </Text>
                                  <View style={styles.btnQuestionTextViewRow}>
                                    <LinearGradient
                                      colors={[
                                        Colors.buttonsFirstColor,
                                        Colors.buttonsSecondColor,
                                      ]}
                                      style={styles.eatBtnsLinear}
                                      start={{ x: 0, y: 1 }}
                                      end={{ x: 1, y: 1 }}
                                    >
                                      <Pressable onPress={pressYES(item)}>
                                        <Text
                                          style={
                                            item.EatTrueFalse
                                              ? styles.YES
                                              : styles.YN
                                          }
                                        >
                                          Да
                                        </Text>
                                      </Pressable>
                                    </LinearGradient>
                                    <LinearGradient
                                      colors={[
                                        Colors.buttonsFirstColor,
                                        Colors.buttonsSecondColor,
                                      ]}
                                      style={styles.eatBtnsLinear}
                                      start={{ x: 0, y: 1 }}
                                      end={{ x: 1, y: 1 }}
                                    >
                                      <Pressable onPress={pressNO(item)}>
                                        <Text
                                          style={
                                            !item.EatTrueFalse
                                              ? styles.NO
                                              : styles.YN
                                          }
                                        >
                                          Не
                                        </Text>
                                      </Pressable>
                                    </LinearGradient>
                                  </View>
                                </View>
                              </View>
                              <View style={styles.studentStatus}>
                                <Text style={styles.miniTitles}>
                                  Статус:
                                </Text>
                                <EatOrNotForDisplayUsers
                                  boolean={item.EatTrueFalse}
                                />
                                <Text style={styles.miniTitlesPay}>
                                  Дължи:{" "}
                                  {(1 * item.PriceDueThisMont).toFixed(2)}лв.
                                </Text>
                              </View>
                            </View>
                          </>
                        ) : (
                          <Text style={styles.miniTitle}>
                            Дължи: {(1 * item.PriceMustPay).toFixed(2)}лв.
                          </Text>
                        )}
                      </LinearGradient>
                    </View>
                  );
              })}
            </View>
        </View>
          </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <View pointerEvents="box-none" style={styles.mainView}>
      <View style={styles.loadingView}>
      {isLoadingSTInfo || isLoading ? LoadingScrean() : null}
      </View>
      <LinearGradient
        colors={[Colors.backgroundFirstColor, Colors.backgroundSecondColor]}
        style={styles.listPageBackgroundLinear}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      >
        <DisplayUsers />
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
 //main
 mainView: {
  backgroundColor: Colors.lightBlue,
  flex: 1,
  
},
loadingView: {
  position: "absolute",
  top: 0,
  zIndex: 3, // works on ios
  elevation: 3, // works on android
  height: 40,
  width: "100%",
},
displayUsersView: {
  flexDirection: "column",
  justifyContent: "center",
  alignItems: "center",
  paddingBottom: "25%",
},
listScrollView: {
  height: "90%",
  width: "100%",
  borderRadius: 16,
  borderBottomLeftRadius: 16,
},
listMainView: {
  flexDirection: "column",
  justifyContent: "center",
  alighItems: "center",
  borderRadius: 16,
  height: "auto",
  marginBottom: 16,
},


// linear


rowNameLinear: {
  borderTopLeftRadius: 16,
  borderTopRightRadius: 16,
  minHeight:60,
  marginTop:-8,
  flexDirection:"row",
  alignItems:"center",
},

eatBtnsLinear: {
  borderRadius: 16,
  marginHorizontal: 6,
  paddingHorizontal: 6,
  shadowColor: Colors.textColor,
  shadowOffset: {
    width: 0,
    height: 6,
  },
  shadowOpacity: 0.21,
  shadowRadius: 5.65,
  elevation: 6,
},
displayUsersBackgroundLinear: {
  borderRadius: 16,
  paddingVertical: 12,
},
displayUsersRowBackgroundLinear: {
  borderRadius: 16,
  width: 340,
  shadowColor: Colors.textColor,
  shadowOffset: {
    width: 0,
    height: 6,
  },
  shadowOpacity: 0.21,
  shadowRadius: 5.65,
  elevation: 6,
  paddingTop:8,
  paddingBottom:8,
  
},


//other views


studentStatus: {
  flexDirection: "column",
  justifyContent: "space-between",
  alignItems: "center",
  paddingHorizontal: 6,
  paddingRight: 2,
  paddingBottom: 4,
},
btnQuestionTextViewColumn: {
  flexDirection: "column",
  justifyContent: "center",
  alignItems: "center",
},
btnQuestionTextViewRow: {
  flexDirection: "row",
  justifyContent: "center",
  alignItems: "center",
  paddingVertical: 12,
},
paddingView: {
  flexDirection: "column",
  justifyContent: "center",
  alignItems: "center",
  padding: 16,
  paddingBottom: 4,
},
displayFlex: {
  width: "100%",
  paddingHorizontal: 8,
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-around",
},


//content


classText: {
  fontSize: 30,
  fontWeight: "bold",
  marginTop: 10,
  paddingTop: 6,
  textAlign: "center",
},
listText: {
  flexDirection: "row",
  alignSelf: "center",
  justifyContent: "flex-start",
  paddingBottom: 8,
  alignItems:"center",
  minHeight:60,
  paddingRight:6,
  paddingLeft:16,
},
miniTitles: {
  width:"100%",
  textAlign: "center",
  fontSize: 16,
  padding: 4,
  fontWeight: "bold",

},
miniTitlesPay: {
  fontSize: 16,
  fontWeight: "bold",
  padding: 4,
  
},
miniTitle: {
  fontSize: 16,
  padding: 4,
  
  fontWeight: "bold",
  paddingTop: 30,
},
listItemNumberInClass: {
  fontSize: 16,
  fontWeight: "bold",
  
  alignItems:"center",
},
listItemFullName: {
  fontSize: 17,
  marginLeft: 8,
  textAlign: "left",
  flex:1,
  flexWrap:"wrap",
  fontWeight: "bold",
},
listPressable: {
  flexDirection: "row",
  justifyContent: "center",
},
EatOrNotForDisplayUsersYes: {
  fontSize: 16,
  fontWeight: "bold",
  textAlignVertical: "center",
  color: Colors.textColor,
  padding: 4,
},

EatOrNotForDisplayUsersNo: {
  fontSize: 16,
  fontWeight: "bold",
  textAlignVertical: "center",
  color: Colors.textColor,
  padding: 4,
},
YES: {
  color: Colors.textColor,
  fontSize: 16,
  fontWeight: "bold",
  borderRadius: 8,
  paddingRight: 8,
  paddingLeft: 8,
  margin: 6,
},
NO: {
  color: Colors.textColor,
  fontSize: 16,
  fontWeight: "bold",
  borderRadius: 8,
  paddingRight: 8,
  paddingLeft: 9,
  margin: 6,
},
YN: {
  color: Colors.textColor,
  fontSize: 16,
  fontWeight: "bold",
  borderRadius: 8,
  paddingRight: 8,
  paddingLeft: 8,
  margin: 6,
},

ActivityIndicatorStyle: {
 
  flexDirection: "column",
  justifyContent: "center",
  alignItems: "center",
  width:"100%",
  height: 820,
  zIndex:100,
},
});

export default MainPage;
