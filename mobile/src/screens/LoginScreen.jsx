import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setIsLoading(true);
    try {
      // API call would go here
      setTimeout(() => {
        setIsLoading(false);
        // For demo purposes, navigate to main app
        navigation.replace('Main');
      }, 1000);
    } catch (error) {
      setIsLoading(false);
      Alert.alert('Error', 'Login failed');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="school" size={80} color="#3B82F6" />
        <Text style={styles.title}>Student Portal</Text>
        <Text style={styles.subtitle}>Sign in to continue</Text>
      </View>

      <View style={styles.form}>
        <View style={styles.inputContainer}>
          <Ionicons name="mail" size={20} color="#9CA3AF" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        <View style={styles.inputContainer}>
          <Ionicons name="lock-closed" size={20} color="#9CA3AF" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
        </View>

        <TouchableOpacity
          style={[styles.loginButton, isLoading && styles.loginButtonDisabled]}
          onPress={handleLogin}
          disabled={isLoading}
        >
          <Text style={styles.loginButtonText}>
            {isLoading ? 'Signing In...' : 'Sign In'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    padding,
  },
  header: {
    alignItems: 'center',
    marginBottom,
  },
  title: {
    fontSize,
    fontWeight: 'bold',
    color: '#1F2937',
    marginTop,
  },
  subtitle: {
    fontSize,
    color: '#6B7280',
    marginTop,
  },
  form: {
    marginTop,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius,
    marginBottom,
    paddingHorizontal,
    borderWidth,
    borderColor: '#E5E7EB',
  },
  inputIcon: {
    marginRight,
  },
  input: {
    flex,
    height,
    fontSize,
    color: '#1F2937',
  },
  loginButton: {
    backgroundColor: '#3B82F6',
    borderRadius,
    height,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop,
  },
  loginButtonDisabled: {
    opacity: 0.6,
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize,
    fontWeight: '600',
  },
});

export default LoginScreen;
