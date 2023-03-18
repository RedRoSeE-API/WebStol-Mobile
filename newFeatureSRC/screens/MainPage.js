import React, { useState, useEffect, useCallback } from "react";
import {
  StyleSheet,
  Text,
  View,
  Pressable,
  ScrollView,
  ActivityIndicator,
  SafeAreaView,
  Dimensions,
} from "react-native";
import { db } from "../../firebase";
import {
  doc,
  updateDoc,
  collection,
  getDoc,
} from "firebase/firestore";
import Colors from "../custom/colors";
import { LinearGradient } from "expo-linear-gradient";
import Header from "../custom/header";
import useAuth from "../useAuth";
import { BlurView } from "expo-blur";


const dbUsersUIDcollection = db.collection("usersUID");
const dbMealsCollection = db.collection("meals");
const dbInfoCollection = db.collection("dbInfo");

const MainPage = () => {

  const windowWidth = Dimensions.get('window').width;
  const windowHeight = Dimensions.get('window').height;

  //System Pause
  const [_systemPauseBoolean, set_systemPauseBoolean] = useState();
  const [_systemPauseDateTO, set_systemPauseDateTO] = useState();
  // Main User Info And Time
  const { user, userRole } = useAuth();
  const [userName, setUserName] = useState("Username");
  const [_TIME, set_TIME] = useState();
  //Firt Block Variables
  const [userBoolean, setUserBoolean] = useState();
  //Second Block Variables
  const [firstMealToday, setFirstMealToday] = useState();
  const [secondMealToday, setSecondMealToday] = useState();
  const [thirdMealToday, setThirdMealToday] = useState();
  //YES/NO Functions And Third Block Variable
  const [EatTimes, setEatTimes] = useState();
  const [priceForOneMeal, setPriceForOneMeal] = useState();
  const [priceDue, setPriceDue] = useState();
  //Third Block Variables
  const [PricePaid, setPricePaid] = useState(true);
  const [PriceMustPay, setPriceMustPay] = useState();
  const [MonthReportDayOfMonth, setMonthReportDayOfMonth] = useState();
  //Loading States For ALL Blocks
  const [isLoading, setIsLoading] = useState(true);
  const [GetUserInfoTextIsLoading, setGetUserInfoTextIsLoading] = useState(
    false
  );
  const [GetMealsTodayIsLoading, setGetMealsTodayIsLoading] = useState(false);
  const [GetPriceIsLoading, setGetPriceIsLoading] = useState(false);

  const [, updateState] = useState();
  const forceUpdate = useCallback(() => updateState({}), []);



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
    getDayToday();
  }, []);

  useEffect(() => {
    if (
      GetUserInfoTextIsLoading &&
      GetMealsTodayIsLoading &&
      GetPriceIsLoading
    ) {
      setIsLoading(false);
    }
  }, [GetUserInfoTextIsLoading, GetMealsTodayIsLoading, GetPriceIsLoading]);



  const getDayToday = async () => {
    const docRef = doc(dbInfoCollection, "time");
    await getDoc(docRef)
      .then((res) => {
        set_TIME(
          res
            .data()
            .dayToday.toDate()
            .getDay()
        );
      })
      .catch((err) => console.log(err));

    const docRef2 = doc(dbInfoCollection, "systemPause");
    await getDoc(docRef2)
      .then((res) => {
        set_systemPauseBoolean(res.data().systemPauseBoolean);


        let dateSystemPauseDateTo = new Date();
        if(res.data().systemPauseDateTO >= 1 && res.data().systemPauseDateTO <= 31){
          dateSystemPauseDateTo.setDate(res.data().systemPauseDateTO)
          set_systemPauseDateTO(`${dateSystemPauseDateTo.getDate(res.data().systemPauseDateTO)}/${dateSystemPauseDateTo.getMonth() + 1}/${dateSystemPauseDateTo.getFullYear()}`)
        }else{
          set_systemPauseDateTO("Неизвестен период от време!");
      }


        
      })
      .catch((err) => console.log(err));
  };

  const pressYES = () => {
    const docRef = doc(dbUsersUIDcollection, `${user.uid}`);

    getDoc(docRef)
      .then((res) => {
        if (!res.data().EatTrueFalse) {
          setIsLoading(true);
          updateDoc(docRef, {
            EatTrueFalse: true,
            EatTimesThisMonth: res.data().EatTimesThisMonth + 1,
            PriceDueThisMont: res.data().PriceDueThisMont + priceForOneMeal,
          })
            .then(() => {
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

  const pressNO = () => {
    const docRef = doc(dbUsersUIDcollection, `${user.uid}`);

    getDoc(docRef)
      .then((res) => {
        if (res.data().EatTrueFalse) {
          setIsLoading(true);
          updateDoc(docRef, {
            EatTrueFalse: false,
            EatTimesThisMonth: res.data().EatTimesThisMonth - 1,
            PriceDueThisMont: res.data().PriceDueThisMont - priceForOneMeal,
          })
            .then(() => {
              setIsLoading(false);
            })
            .catch((err) => console.log(err));
        }
      })
      .catch((err) => {
        console.log(err);
      });
  };

  function GetUserInfoText() {
    const docRef = doc(dbUsersUIDcollection, `${user.uid}`);

    getDoc(docRef)
      .then((res) => {
        setUserName(res.data().fullName);
        setUserBoolean(res.data().EatTrueFalse);
        setGetUserInfoTextIsLoading(true);
        setPricePaid(res.data().PricePaid);
        setPriceMustPay(res.data().PriceMustPay);
      })
      .catch((err) => console.log(err));

    if (PricePaid === false) {
      return (
        <Text style={styles.PAY}>
          Дължиш {(1 * PriceMustPay).toFixed(2)} лева!
        </Text>
      );
    }

    if (userBoolean) {
      return <Text style={styles.YES}>Записан/а си</Text>;
    } else {
      return <Text style={styles.NO}>Не си записан/а</Text>;
    }
  }

  function GetMealsToday() {
    let _docRef;
    if (_TIME + 1 > 1 && _TIME + 1 < 7) {
      _docRef = doc(dbMealsCollection, `${_TIME + 1}`);
    } else {
      _docRef = doc(dbMealsCollection, `1`);
    }
    getDoc(_docRef)
      .then((res) => {
        setFirstMealToday(res.data().firstMeal);
        setSecondMealToday(res.data().secondMeal);
        setThirdMealToday(res.data().thirdMeal);
        setGetMealsTodayIsLoading(true);
      })
      .catch((err) => console.log(err));

    return (
      <View>
        <LinearGradient
          colors={[Colors.titleViewsFirstColor, Colors.titleViewsSecondColor]}
          style={styles.titleLinear}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
        >
          <Text style={styles.mealMainText}>
            {_TIME + 1 > 1 && _TIME + 1 < 7
              ? "Менюто утре e:"
              : "Менюто в понеделник:"}
          </Text>
        </LinearGradient>
        <LinearGradient
          colors={[
            Colors.secondaryBackgroundFirstColor,
            Colors.secondaryBackgroundSecondColor,
          ]}
          style={styles.menuLinear}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
        >
          <View style={styles.mealsTodayViewPadding}>
            <View style={styles.centerView}>
            <Text style={styles.mealTextMealNumber}>Първо:</Text>
              <Text style={styles.mealText}>- {firstMealToday}</Text>
            </View>
            <View style={styles.centerView}>
            <Text style={styles.mealTextMealNumber}>Второ:</Text>
              <Text style={styles.mealText}>- {secondMealToday}</Text>
            </View>
            <View style={styles.centerView}>
            <Text style={styles.mealTextMealNumber}>Трето:</Text>
              <Text style={styles.mealText}>- {thirdMealToday}</Text>
            </View>
          </View>
        </LinearGradient>
      </View>
    );
  }

  function GetPrice() {
    const docRefUser = doc(dbUsersUIDcollection, `${user.uid}`);
    const docRefDBInfo = doc(dbInfoCollection, "monthReport");

    let docRefPrice;

    _TIME >= 1 && _TIME < 6
      ? (docRefPrice = doc(dbMealsCollection, `${_TIME}`))
      : (docRefPrice = doc(dbMealsCollection, "1"));

    getDoc(docRefUser)
      .then((res) => {
        setPriceDue(res.data().PriceDueThisMont);
        setEatTimes(res.data().EatTimesThisMonth);
      })
      .catch((err) => console.log(err));

    getDoc(docRefPrice)
      .then((res) => {
        setPriceForOneMeal(res.data().price);
      })
      .catch((err) => console.log(err));

    getDoc(docRefDBInfo)
      .then((res) => {

        let dateForMonthlyReport = new Date();
        if(res.data().dayForMonthlyReport >= 1 && res.data().dayForMonthlyReport <= 31){
          dateForMonthlyReport.setDate(res.data().dayForMonthlyReport);
          setMonthReportDayOfMonth(`${dateForMonthlyReport.getDate(res.data().dayForMonthlyReport)}/${dateForMonthlyReport.getMonth() + 1}/${dateForMonthlyReport.getFullYear()}`);
        }else{
          setMonthReportDayOfMonth(100);
        }


        setGetPriceIsLoading(true);
      })
      .catch((err) => console.log(err));

    return (
      <View style={styles.moneyViewMain}>
        <LinearGradient
          colors={[Colors.titleViewsFirstColor, Colors.titleViewsSecondColor]}
          style={styles.linear}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
        >
          <Text style={styles.price}>
            Цена за еденично ядене: {(1 * priceForOneMeal).toFixed(2)}лв.
          </Text>
        </LinearGradient>
        <LinearGradient
          colors={[
            Colors.secondaryBackgroundFirstColor,
            Colors.secondaryBackgroundSecondColor,
          ]}
          style={styles.priceLinear}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
        >
          <View style={styles.moneyViewMoneyText}>
            <Text style={styles.timesEathen}>Ял съм: {EatTimes == 1 ? `${EatTimes} ден` : `${EatTimes} дни`}</Text>
            {!priceDue ? (
              <Text style={styles.priceAll}>Дължа: {(1 * 0).toFixed(2)}лв.</Text>
            ) : (
              <Text style={styles.priceAll}>
                Дължа: {(1 * priceDue).toFixed(2)}лв.
              </Text>
            )}

            {MonthReportDayOfMonth === 100 ? null : (
              <Text style={styles.monthReportDate}>
                На {MonthReportDayOfMonth} ще бъде ден за плащане!
              </Text>
            )}
          </View>
        </LinearGradient>
      </View>
    );
  }

  if (typeof user.uid != "undefined") {
    return (
      <SafeAreaView pointerEvents="box-none">
        <Header />
        <View style={styles.loadingView}>
          {isLoading ? LoadingScrean() : null}
        </View>

          <LinearGradient
            colors={[Colors.backgroundFirstColor, Colors.backgroundSecondColor]}
            style={styles.mainPageBackgroundLinear}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
         
        <ScrollView style={styles.mainView} contentContainerStyle={{ alignItems: "center",width:"100%",  paddingBottom:180,}} >
            <Text style={styles.userName}>{userName}</Text>

            {_systemPauseBoolean ? (
              <View style={styles.willYouEatViewPause}>
                <LinearGradient
                  colors={[
                    Colors.titleViewsFirstColor,
                    Colors.titleViewsSecondColor,
                  ]}
                  style={styles.pauseLinearTitle}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 0, y: 1 }}
                  >
                  <Text style={styles.willYouEatTextPauseTitle}>
                    Столът не работи
                  </Text>
                </LinearGradient>
                <LinearGradient
                  colors={[
                    Colors.secondaryBackgroundFirstColor,
                    Colors.secondaryBackgroundSecondColor,
                  ]}
                  style={styles.pauseLinear}
                  start={{ x: 0, y: 1 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Text style={styles.willYouEatTextPause}>
                    Системата не работи до: {_systemPauseDateTO}
                  </Text>
                </LinearGradient>
              </View>
            ) : (
              <View style={styles.willYouEatView}>
                <LinearGradient
                  colors={[
                    Colors.titleViewsFirstColor,
                    Colors.titleViewsSecondColor,
                  ]}
                  style={styles.linear}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 0, y: 1 }}
                >
                  <Text style={styles.willYouEatText}>Ще обядваш ли утре?</Text>
                </LinearGradient>
                <LinearGradient
                  colors={[
                    Colors.secondaryBackgroundFirstColor,
                    Colors.secondaryBackgroundSecondColor,
                  ]}
                  style={styles.willYouEatLinear}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 0, y: 1 }}
                  >
                  <View style={styles.willYouEatButtons}>
                    <LinearGradient
                      colors={[
                        Colors.buttonsFirstColor,
                        Colors.buttonsSecondColor,
                      ]}
                      style={styles.YesNoBtns}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 0, y: 1 }}
                    >
                      <Pressable
                        disabled={PricePaid ? false : true}
                        style={styles.willYouEatPressable}
                        onPress={pressYES}
                      >
                        <Text style={styles.willYouEatPressableText}>Да</Text>
                      </Pressable>
                    </LinearGradient>

                    <LinearGradient
                      colors={[
                        Colors.buttonsFirstColor,
                        Colors.buttonsSecondColor,
                      ]}
                      style={styles.YesNoBtns}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 0, y: 1 }}
                      >
                      <Pressable
                        disabled={PricePaid ? false : true}
                        style={styles.willYouEatPressable}
                        onPress={pressNO}
                        >
                        <Text style={styles.willYouEatPressableText}>Не</Text>
                      </Pressable>
                    </LinearGradient>
                  </View>
                  <Text style={styles.willYouEatSecondText}>
                    Записан/a ли съм в {`\n`} момента?
                  </Text>
                  <GetUserInfoText />
                </LinearGradient>
              </View>
            )}

            <View style={styles.mealsTodayView}>
              <GetMealsToday />
            </View>

            <View style={styles.moneyView}>
              <GetPrice />
            </View>
        </ScrollView>

          </LinearGradient>
      </SafeAreaView>
    );
  }
};
const styles = StyleSheet.create({

//main
  mainView: {
    width:"100%",
    height: "100%",
   
  },
  loadingView: {
    position: "absolute",
    top: 24,
    zIndex: 3, // works on ios
    elevation: 3, // works on android
    width: "100%",
  },
  willYouEatView: {
    height: 430,
    width:355,
    borderRadius: 16,
    marginTop: 16,
    paddingTop:35,
    marginBottom: 24,
    justifyContent: "space-between",
    alignItems: "center",
    shadowColor: Colors.textColor,
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.21,
    shadowRadius: 3.65,
    elevation: 6,
    
    paddingBottom:8,
  },
  willYouEatViewPause: {
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    // width: "88%",
    width:346,
    height: 300,
    margin: 16,
    borderRadius: 16,
    backgroundColor: Colors.mainBlue,
    shadowColor: Colors.textColor,
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.21,
    shadowRadius: 3.65,
    elevation: 6,
    
  
  },


  //linear


  willYouEatLinear: {
    flexDirection: "column",
    justifyContent: "space-around",
    alignItems: "center",
    height: 330,
    width: 346,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    shadowColor: Colors.textColor,
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.21,
    shadowRadius: 3.65,
    elevation: 6,
  },
  priceLinear: {
    flexDirection: "column",
    justifyContent: "space-between",
    alignItems: "center",
    height: 250,
    width: 346,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    shadowColor: Colors.textColor,
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.21,
    shadowRadius: 3.65,
    elevation: 6,
    marginBottom:36,
  },
  menuLinear: {
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    height: 440,
    width: 346,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    shadowColor: Colors.textColor,
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.21,
    shadowRadius: 3.65,
    elevation: 6,
  },
  pauseLinear: {
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    height: 210,
    width: 346,
    padding: 16,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    shadowColor: Colors.textColor,
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.21,
    shadowRadius: 3.65,
    elevation: 6,
  },
  pauseLinearTitle: {
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    height: 90,
    width: 346,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    color: Colors.textColor,
  },
  linear: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: -36,
    height: 100,
    width: 346,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  titleLinear: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 100,
    width: 346,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },

  //content


  userName: {
    fontSize: 32,
    fontWeight: "bold",
    textAlign: "center",
    margin: 20,
    color: Colors.textColor,
  },
  willYouEatTextPause: {
    fontSize: 24,
    fontWeight: "500",
    textAlign: "center",
    color: Colors.textColor,
  },
  willYouEatTextPauseTitle: {
    fontSize: 28,
    fontWeight: "500",
    textAlign: "center",
    color: Colors.textColor,
  },
  willYouEatText: {
    fontWeight: "500",
    fontSize: 28,
    color: Colors.textColor,
  },
  willYouEatSecondText: {
    fontSize: 27,
    textAlign: "center",
    color: Colors.textColor,
  },
  willYouEatButtons: {
    flexDirection: "row",
    paddingTop: 8,
  },
  willYouEatPressable: {
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    width: 150,
    height: 60,
    borderRadius: 30,
    
  },
  willYouEatPressableText: {
    fontWeight: "bold",
    fontSize: 20,
    color: Colors.textColor,
  },
  YES: {
    fontSize: 24,
    fontWeight: "bold",
    fontStyle: "italic",
    marginBottom: 16,
    color: Colors.textColor,
  },
  NO: {
    fontSize: 24,
    fontWeight: "bold",
    fontStyle: "italic",
    marginBottom: 16,
    color: Colors.textColor,
  },
  PAY: {
    color: Colors.textColor,
    fontSize: 26,
    fontWeight: "bold",
    fontStyle: "italic",
    textAlign: "center",
    marginBottom: 16,
  },

  
  //main
  
  
  mealsTodayView: {
    height: 525,
    width:355,
    marginTop: 20,
    marginBottom: 50,
    borderRadius: 16,
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: Colors.textColor,
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.21,
    shadowRadius: 3.65,
    elevation: 6,
    
  },
  centerView: {
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    height:"100%",
    width:"100%",
  },
  mealsTodayViewPadding: {
    flexDirection: "column",
    justifyContent: "space-around",
    alignItems: "center",
    width:"100%",
    height:"100%",
    marginBottom:32,
  },

  //content


  mealMainText: {
    fontWeight: "500",
    fontSize: 28,
    fontStyle: "italic",
    marginBottom: 6,
    textAlign: "center",
    color: Colors.textColor,
  },
  mealText: {
    fontSize: 24,
    fontStyle: "italic",
    textAlign:"center",
    paddingHorizontal:16,
    color: Colors.textColor,
  },
  mealTextMealNumber: {
    fontSize: 22,
    fontStyle: "italic",
    textAlign:"center",
   fontWeight:"bold",
    color: Colors.textColor,
  },


  //main


  moneyViewMain: {
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 36,
  },
  moneyView: {
    width: 355,
    height: 350,
    borderRadius: 16,
    padding: 16,
    marginBottom: 45,
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


  moneyViewMoneyText: {
    flexDirection: "column",
    width: "100%",
    height: "100%",
    padding: 12,
    justifyContent: "space-evenly",
    color: Colors.textColor,
    
  },
  price: {
    fontWeight: "500",
    fontSize: 24,
    maxWidth: 300,
    textAlign: "center",
    color: Colors.textColor,
  },
  timesEathen: {
    fontSize: 24,
    padding: 16,
    textAlign: "left",
    color: Colors.textColor,
  },
  priceAll: {
    fontSize: 24,
    padding: 16,
    textAlign: "left",
    color: Colors.textColor,
  },
  monthReportDate: {
    fontSize: 24,
    textAlign: "left",
    width: 300,
    padding: 16,
    color: Colors.textColor,
  },
 
  YesNoBtns: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    margin: 8,
    maxWidth: 150,
    marginVertical: 12,
    borderRadius: 16,
    fontSize: 24,
    shadowColor: Colors.textColor,
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.21,
    shadowRadius: 3.65,
    elevation: 6,
  },


  //loading


  ActivityIndicatorStyle: {
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    width:"100%",
    height:820,
    zIndex:100,
  },

 
});


export default MainPage;
