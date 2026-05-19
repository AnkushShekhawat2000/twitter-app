import {
    GoogleAuthProvider,
    signInWithPopup,
    signOut,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    onAuthStateChanged,
 } from "firebase/auth";

import auth from "../firebase.init"
import {createContext, useContext, useEffect, useState} from "react";

const userAuthcontext = createContext();

export function UserauthcontextProvider({children}){
    const [user, SetUser] = useState([]);

    
    function login(email, password){
        return signInWithEmailAndPassword(auth, email,password);
    }

    function signin(email, password){
        return createUserWithEmailAndPassword(auth, email, password);
    }

    function logout(){
        return signOut(auth)
        
    }


    function googlesignin(){
        const googleauthprovider = new GoogleAuthProvider();
        return signInWithPopup(auth, googleauthprovider);
    }

    useEffect(()=> {
        const Unsubscribe = onAuthStateChanged(auth,(currentuser) => {
            console.log("Auth", currentuser);
                SetUser(currentuser);
        } );
        return () => {
            Unsubscribe();
        }
    },[]);

    return (
        <userAuthcontext.Provider value={{user, login, signin, logout, googlesignin}}>
            {children}
        </userAuthcontext.Provider>
    )


}


export  function useUserauth(){
    return useContext(userAuthcontext);
}

