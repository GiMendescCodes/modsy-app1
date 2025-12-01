import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Alert,
  StyleSheet,
  ImageBackground,
  Image,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { MaterialIcons } from '@expo/vector-icons';
import { FontAwesome } from '@expo/vector-icons';
import { useFonts } from 'expo-font';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebaseConfig';
import { useNavigation } from '@react-navigation/native';

export default function Login() {
  const navigation = useNavigation();
  const [emailOuNome, setEmailOuNome] = useState('');
  const [password, setPassword] = useState('');

  const [fontsLoaded] = useFonts({
    'CreatoDisplay-Medium': require('../assets/fonts/CreatoDisplay-Medium.otf'),
    'CreatoDisplay-Regular': require('../assets/fonts/CreatoDisplay-Regular.otf'),
  });

  const handleLogin = async () => {
    if (!emailOuNome || !password) {
      Alert.alert('Atenção', 'Preencha todos os campos');
      return;
    }

    try {
      await signInWithEmailAndPassword(auth, emailOuNome, password);
      navigation.replace('GuardaRoupa');
    } catch (error) {
      let msg = 'Erro ao fazer login.';
      if (error.code === 'auth/invalid-credential') {
        msg = 'Email ou senha incorretos.';
      }
      Alert.alert('Erro', msg);
    }
  };

  return (
    <ImageBackground
      source={require('../assets/fundo_cadastro.png')}
      style={styles.background}
      resizeMode="cover"
    >
     
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <MaterialIcons name="keyboard-arrow-left" size={38} color="white" />
      </TouchableOpacity>

     
      <View style={styles.logoContainer}>
        <Image source={require('../assets/logo.png')} style={styles.logoImage} />
      </View>

     
      <ImageBackground
        source={require('../assets/fundo_forms.png')}
        style={styles.formContainer}
        resizeMode="cover"
      >
        <Text style={styles.title}>BEM-VINDO DE VOLTA</Text>
        <View style={styles.line1} />

        <View style={styles.inputWrapper}>
          <Ionicons name="person" size={15} color="#fff" style={styles.icon} />
          <TextInput
            placeholder="Email"
            value={emailOuNome}
            onChangeText={setEmailOuNome}
            style={styles.input}
            placeholderTextColor="#fff"
          />
        </View>

     
        <View style={styles.inputWrapper}>
          <Ionicons name="lock-closed" size={15} color="#fff" style={styles.icon} />
          <TextInput
            placeholder="Senha"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            style={styles.input}
            placeholderTextColor="#fff"
          />
        </View>

     
        <TouchableOpacity style={styles.button} onPress={handleLogin}>
          <Text style={styles.buttonText}>ENTRAR</Text>
        </TouchableOpacity>

       
        <TouchableOpacity style={styles.forgotPassword}>
          <Text style={styles.forgotPasswordText}>Esqueceu a senha?</Text>
        </TouchableOpacity>

     
        <View style={styles.orSeparator}>
          <View style={styles.line} />
          <Text style={styles.orText}>ou</Text>
          <View style={styles.line} />
        </View>

 
        <View style={styles.loginLinkContainer}>
          <Text style={styles.loginText}>Não tem uma conta? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Cadastro')}>
            <Text style={styles.loginLink}>Cadastre-se</Text>
          </TouchableOpacity>
        </View>
      </ImageBackground>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backButton: {
    position: 'absolute',
    top: 40,
    left: 30,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(225, 255, 255, 0.17)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 20,
  },
  logoContainer: {
    position: 'absolute',
    top: 40,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 10,
    alignSelf: 'center',
  },
  logoImage: {
    width: 420,
    height: 140,
    resizeMode: 'contain',
    marginTop: 80,
    alignSelf: 'center',
  },
  formContainer: {
    borderTopLeftRadius: 80,
    borderTopRightRadius: 80,
    paddingHorizontal: 50,
    paddingBottom: 40,
    marginTop: 'auto',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgb(255, 255, 255, 0.6)',
    height: 555,
  },
  title: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 10,
    color: '#fff',
    textTransform: 'uppercase',
    paddingTop: 70,
    fontFamily: 'CreatoDisplay-Regular',
    fontWeight: 'thin',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.2,
    borderColor: '#ddd',
    borderRadius: 27,
    paddingHorizontal: 15,
    marginBottom: 23,
    alignSelf: 'center',
  },
  icon: {
    marginRight: 10,
    alignSelf: 'center',
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 14,
    color: '#ffff',
    alignSelf: 'center',
    fontFamily: 'CreatoDisplay-Regular',
  },
  button: {
    backgroundColor: '#000',
    borderRadius: 25,
    paddingVertical: 13,
    alignItems: 'center',
    marginTop: 10,
    alignSelf: 'center',
    width: 160,
  },
  buttonText: {
    color: '#fff',
    fontSize: 13,
    alignSelf: 'center',
    textTransform: 'uppercase',
    fontFamily: 'CreatoDisplay-Medium',
  },
  forgotPassword: {
    alignSelf: 'center',
    marginTop: 10,
  },
  forgotPasswordText: {
    color: '#fff',
    alignSelf: 'center',
    fontSize: 14,
    textDecorationLine: 'none',
    fontFamily: 'CreatoDisplay-Regular',
  },
  orSeparator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
    alignSelf: 'center',
   
    marginBottom: 15,
    marginTop: 30,
  },
  line: {
    height: 1,
    width: 45,
    alignSelf: 'center',
    backgroundColor: '#ddd',
    marginTop: 4,
  },
  line1: {
    height: 1,
    width: 150,
    alignSelf: 'center',
    backgroundColor: '#ddd',
    marginBottom: 45,
    alignSelf: 'center',
  },
  orText: {
    marginHorizontal: 10,
    color: '#fff',
    fontSize: 14,
    alignSelf: 'center',
  },
  socialButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 10,
    alignSelf: 'center',
    marginTop: 15
  },

  loginLinkContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 27,
  },
  loginText: {
    color: '#fff',
    fontSize: 14,
    fontFamily: 'CreatoDisplay-Regular',
  },
  loginLink: {
    color: '#fff',
    fontSize: 14,
    textDecorationLine: 'none',
    fontFamily: 'CreatoDisplay-Medium',
  },
});