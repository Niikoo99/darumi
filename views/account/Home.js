import React, {useState, useEffect} from 'react'
import { StyleSheet, Text, View } from 'react-native'

import { firebaseApp } from '../../utils/firebase'
import * as firebase from '../../utils/firebase'
import 'firebase/firestore'

import UserLogged from './UserLogged'
import UserGuest from './UserGuest'

export default function Home() {
  const [login, setLogin] = useState(null)

  useEffect(() => {
    firebase.auth().onAuthStateChanged((user) => {
      user != null ? (setLogin(false)) : setLogin(true)
    }, [])
  }, [])
 
  if (login == null) {
    return <Text>Cargando...</Text>
  }

  return login ? <UserLogged/> : <UserGuest/>
}

const styles = StyleSheet.create({})