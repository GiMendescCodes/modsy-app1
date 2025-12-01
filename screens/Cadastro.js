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
import { useFonts } from 'expo-font';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebaseConfig';
import { useNavigation } from '@react-navigation/native';


export default function Cadastro() {
  const navigation = useNavigation();
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [fontsLoaded] = useFonts({
    'CreatoDisplay-Medium': require('../assets/fonts/CreatoDisplay-Medium.otf'),
     'CreatoDisplay-Regular': require('../assets/fonts/CreatoDisplay-Regular.otf'),
  });
 
  const handleCadastro = async () => {
    if (!nome || !email || !password || !confirmPassword) {
      Alert.alert('Atenção', 'Preencha todos os campos');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Atenção', 'As senhas não coincidem');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Atenção', 'A senha deve ter pelo menos 6 caracteres');
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await setDoc(doc(db, 'users', user.uid), {
        nome,
        email,
        estilos: []
      });

      Alert.alert('Sucesso', 'Conta criada com sucesso!');
      navigation.replace('SelecaoEstilos');
    } catch (error) {
      let msg = 'Erro ao criar conta.';
      if (error.code === 'auth/email-already-in-use') {
        msg = 'Este email já está em uso.';
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
  <Text style={styles.title}>CADASTRE-SE</Text>
  <View style={styles.line1} />

 
  <View style={styles.inputWrapper}>
    <Ionicons name="person" size={15} color="#fff" style={styles.icon} />
    <TextInput
      placeholder="Nome de usuário"
      value={nome}
      onChangeText={setNome}
      style={styles.input}
      placeholderTextColor="#fff"
    />
  </View>

 
  <View style={styles.inputWrapper}>
    <Ionicons name="mail" size={15} color="#fff" style={styles.icon} />
    <TextInput
      placeholder="Email"
      value={email}
      onChangeText={setEmail}
      keyboardType="email-address"
      autoCapitalize="none"
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
<View style={styles.inputWrapper}>
    <Ionicons name="shield" size={15} color="#fff" style={styles.icon} />
    <TextInput
      placeholder="Confirmar senha"
      value={confirmPassword}
      onChangeText={setConfirmPassword}
      secureTextEntry
      style={styles.input}
      placeholderTextColor="#fff"
    />
  </View>

  <TouchableOpacity style={styles.button} onPress={handleCadastro}>
    <Text style={styles.buttonText}>CADASTRE-SE</Text>
  </TouchableOpacity>

 
  <View style={styles.orSeparator}>
    <View style={styles.line} />
    <Text style={styles.orText}>ou</Text>
    <View style={styles.line} />
  </View>

 
  <View style={styles.loginLinkContainer}>
    <Text style={styles.loginText}>Já tem uma conta? </Text>
    <TouchableOpacity onPress={() => navigation.navigate('Login')}>
      <Text style={styles.loginLink}>Faça o Login</Text>
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
    left:30,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(225, 255, 255, 0.17)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 20,
    alignSelf: 'center',
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
    height:140,
    resizeMode: 'contain',
    marginTop:80,
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
  height: 555
},
  title: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 10,
    color: '#fff',
    textTransform: 'uppercase',
    paddingTop: 30,
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
    alignSelf: 'center',
    marginBottom: 23,
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
    fontFamily: 'CreatoDisplay-Regular'
  },
  button: {
    backgroundColor: '#000',
    borderRadius: 25,
    paddingVertical: 13,
    alignItems: 'center',
    marginTop: 5,
    alignSelf: 'center',
    width: 170,
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
    textTransform: 'uppercase',
    fontFamily: 'CreatoDisplay-Medium'
  },
  orSeparator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
    alignSelf: 'center',
    marginBottom: 15,
    alignSelf: 'center',
    marginTop: 15
  },
  line: {
    height: 1,
    width: 45,
    backgroundColor: '#ddd',
    alignSelf: 'center',
    marginTop: 4,
  },
  line1: {
    height: 1,
    width: 100,
    backgroundColor: '#ddd',
    marginBottom: 30,
    alignSelf: 'center',
    alignSelf: 'center'
  },
  orText: {
    marginHorizontal: 10,
    color: '#fff',
    alignSelf: 'center',
    fontSize: 14,

  },
  socialButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    alignSelf: 'center',
    marginBottom: 10,
  },
  socialButton2: {
    width: 25,
    height: 25,
    borderRadius: 5,
    backgroundColor: '#1F459C',
    justifyContent: 'center',
    alignSelf: 'center',
    alignItems: 'center',
  },
   socialButton: {
    width: 25,
    height: 25,
    borderRadius: 5,
    alignSelf: 'center',
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginLinkContainer: {
    flexDirection: 'row',
    alignSelf: 'center',
    justifyContent: 'center',
    marginTop: 5,
  },
  loginText: {
    color: '#fff',
    fontSize: 14.5,
    alignSelf: 'center',
     fontFamily: 'CreatoDisplay-Regular'
  },
  loginLink: {
    color: '#fff',
    fontSize: 14.5,
    textDecorationLine: 'none',
    fontFamily: 'CreatoDisplay-Medium'
  },
});