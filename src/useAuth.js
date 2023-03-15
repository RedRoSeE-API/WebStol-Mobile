import React, { createContext, useContext, useEffect, useState } from "react";
import { auth, db } from "../firebase";
import { doc, collection, getDoc } from 'firebase/firestore';

const dbUsersUIDcollection = collection(db, "usersUID");

const AuthContext = createContext({});

export function AuthProvider ({ children }) {


  const [user, setCurrentUser] = useState(null);
  const [userRole, setUserRole] = useState(null);

  function userSingOut () {
    auth.signOut(auth).then(() =>{
        console.log("SignOut")
    }).catch(err => {
    });
}




//pri vsqka promqna na authState-a na firebase se storva novata informaciq vuv user
  useEffect(() => {
    
    const unsubscribe = auth.onAuthStateChanged((user) => {
      console.log(user)
      setCurrentUser(user);
      
;      if(user){
      
        const docRef = doc(dbUsersUIDcollection, `${user.uid}`)
        getDoc(docRef).then(res =>{
          if(res.data().role == "teacher"){
            console.log(res.data().role)
            setUserRole(res.data().role)
          }else if(res.data().role == "student"){
            setUserRole(res.data().role)
          }
          else{
            userSingOut();
            alert("Грешен имейл или парола!")
          }
        })
      }
    
    });

    return unsubscribe;

  }, [user]);

 

const value={
  user,
  userRole,
  userSingOut
}

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}


export default function useAuth() {
  return useContext(AuthContext);
}


//sega mojem da predadem promenlivata user na vseki komponent wrap-nat v AuthProvider-a
