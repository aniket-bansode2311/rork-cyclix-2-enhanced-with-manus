import React, { useState, useRef, useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { Link } from 'expo-router';
import { Eye, EyeOff, Mail, Lock, Clock } from 'lucide-react-native';

import { useAuth } from '@/hooks/use-auth';
import { testSupabaseConnection } from '@/lib/supabase';
import Colors from '@/constants/colors';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rateLimitCooldown, setRateLimitCooldown] = useState(0);
  const [lastAttemptTime, setLastAttemptTime] = useState(0);
  const [connectionStatus, setConnectionStatus] = useState<string>('');
  const { login, isLoggingIn, loginError, clearErrors } = useAuth();
  const cooldownInterval = useRef<NodeJS.Timeout | null>(null);
  const passwordInputRef = useRef<TextInput>(null);

  // Test connection on component mount
  useEffect(() => {
    const testConnection = async () => {
      setConnectionStatus('Testing connection...');
      try {
        const result = await testSupabaseConnection();
        if (result.success) {
          setConnectionStatus('✅ Connection OK');
        } else {
          setConnectionStatus(`❌ Connection Failed: ${result.error?.message || 'Unknown error'}`);
        }
      } catch (error) {
        setConnectionStatus(`❌ Test Failed: ${error.message}`);
      }
    };
    testConnection();
  }, []);

  // Clear errors when component unmounts
  useEffect(() => {
    return () => {
      if (cooldownInterval.current) {
        clearInterval(cooldownInterval.current);
      }
      clearErrors?.();
    };
  }, [clearErrors]);

  // Clear errors when inputs change
  useEffect(() => {
    if (loginError && clearErrors) {
      clearErrors();
    }
  }, [email, password, loginError, clearErrors]);

  const startCooldown = (seconds: number) => {
    console.log(`Starting login cooldown for ${seconds} seconds`);
    setRateLimitCooldown(seconds);
    
    if (cooldownInterval.current) {
      clearInterval(cooldownInterval.current);
    }
    
    cooldownInterval.current = setInterval(() => {
      setRateLimitCooldown((prev) => {
        if (prev <= 1) {
          if (cooldownInterval.current) {
            clearInterval(cooldownInterval.current);
            cooldownInterval.current = null;
          }
          console.log('Login cooldown finished');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleLogin = async () => {
    console.log('Login button clicked');
    
    // Prevent rapid successive clicks
    const now = Date.now();
    if (now - lastAttemptTime < 2000) {
      console.log('Preventing rapid successive login clicks');
      return;
    }
    setLastAttemptTime(now);

    if (rateLimitCooldown > 0) {
      Alert.alert(
        'Please Wait', 
        `You can try again in ${rateLimitCooldown} seconds. This security measure prevents spam login attempts.`
      );
      return;
    }

    // Validate inputs
    const trimmedEmail = email.trim().toLowerCase();
    const trimmedPassword = password.trim();

    if (!trimmedEmail || !trimmedPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (!validateEmail(trimmedEmail)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    if (trimmedPassword.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters long');
      return;
    }

    console.log('Login validation passed, calling login function');
    try {
      await login(trimmedEmail, trimmedPassword);
      console.log('Login completed successfully');
    } catch (error) {
      console.error('Login failed:', error);
      // Error is already set in the auth hook, no need to handle it here
    }
  };

  const getErrorMessage = () => {
    if (!loginError) return null;
    
    const errorMessage = loginError.message.toLowerCase();
    console.log('Processing login error:', errorMessage);
    
    if (errorMessage.includes('too many requests') || 
        errorMessage.includes('rate limit') || 
        errorMessage.includes('too many')) {
      // Extract seconds from error message if possible
      const match = errorMessage.match(/(\d+)\s*seconds?/);
      const seconds = match ? parseInt(match[1]) : 60;
      
      if (rateLimitCooldown === 0) {
        startCooldown(seconds);
      }
      
      return `Too many login attempts. Please wait ${rateLimitCooldown || seconds} seconds before trying again.`;
    }
    
    if (errorMessage.includes('invalid login credentials') || 
        errorMessage.includes('invalid email or password') ||
        errorMessage.includes('invalid credentials')) {
      return 'Invalid email or password. Please check your credentials and try again.';
    }
    
    if (errorMessage.includes('email not confirmed') || 
        errorMessage.includes('email not verified') ||
        errorMessage.includes('confirm your email')) {
      return 'Please check your email and click the confirmation link before signing in.';
    }
    
    if (errorMessage.includes('user not found') ||
        errorMessage.includes('no user found')) {
      return 'No account found with this email address. Please sign up first.';
    }

    if (errorMessage.includes('network') || 
        errorMessage.includes('connection') ||
        errorMessage.includes('fetch')) {
      return 'Network error. Please check your internet connection and try again.';
    }
    
    return loginError.message;
  };

  const isButtonDisabled = isLoggingIn || rateLimitCooldown > 0;

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>Sign in to continue tracking your cycle</Text>
          {connectionStatus && (
            <Text style={styles.connectionStatus}>{connectionStatus}</Text>
          )}
        </View>

        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <Mail size={20} color={Colors.light.darkGray} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Email address"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              testID="email-input"
              editable={!isButtonDisabled}
              returnKeyType="next"
              onSubmitEditing={() => passwordInputRef.current?.focus()}
            />
          </View>

          <View style={styles.inputContainer}>
            <Lock size={20} color={Colors.light.darkGray} style={styles.inputIcon} />
            <TextInput
              ref={passwordInputRef}
              style={styles.input}
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              autoComplete="password"
              testID="password-input"
              editable={!isButtonDisabled}
              returnKeyType="done"
              onSubmitEditing={handleLogin}
            />
            <TouchableOpacity
              style={styles.eyeIcon}
              onPress={() => setShowPassword(!showPassword)}
              testID="toggle-password-visibility"
              disabled={isButtonDisabled}
            >
              {showPassword ? (
                <EyeOff size={20} color={Colors.light.darkGray} />
              ) : (
                <Eye size={20} color={Colors.light.darkGray} />
              )}
            </TouchableOpacity>
          </View>

          {loginError && (
            <View style={[
              styles.errorContainer,
              (loginError.message.toLowerCase().includes('rate limit') || 
               loginError.message.toLowerCase().includes('too many')) && styles.rateLimitContainer
            ]}>
              {(loginError.message.toLowerCase().includes('rate limit') || 
                loginError.message.toLowerCase().includes('too many')) && (
                <Clock size={16} color={Colors.light.primary} style={styles.clockIcon} />
              )}
              <Text style={[
                styles.errorText,
                (loginError.message.toLowerCase().includes('rate limit') || 
                 loginError.message.toLowerCase().includes('too many')) && styles.rateLimitText
              ]}>
                {getErrorMessage()}
              </Text>
            </View>
          )}

          <TouchableOpacity
            style={[styles.loginButton, isButtonDisabled && styles.disabledButton]}
            onPress={handleLogin}
            disabled={isButtonDisabled}
            testID="login-button"
            activeOpacity={0.8}
          >
            {rateLimitCooldown > 0 ? (
              <View style={styles.buttonContent}>
                <Clock size={16} color="#FFF" style={styles.buttonIcon} />
                <Text style={styles.loginButtonText}>
                  Wait {rateLimitCooldown}s
                </Text>
              </View>
            ) : (
              <Text style={styles.loginButtonText}>
                {isLoggingIn ? 'Signing In...' : 'Sign In'}
              </Text>
            )}
          </TouchableOpacity>

          <Link href="/(auth)/forgot-password" asChild>
            <TouchableOpacity 
              style={styles.forgotPasswordButton}
              disabled={isButtonDisabled}
              activeOpacity={0.7}
            >
              <Text style={[
                styles.forgotPasswordText,
                isButtonDisabled && styles.disabledText
              ]}>
                Forgot Password?
              </Text>
            </TouchableOpacity>
          </Link>

          {/* Debug button - remove in production */}
          <TouchableOpacity 
            style={styles.debugButton}
            onPress={async () => {
              console.log('=== DEBUG INFO ===');
              console.log('Environment variables:');
              console.log('EXPO_PUBLIC_SUPABASE_URL:', process.env.EXPO_PUBLIC_SUPABASE_URL);
              console.log('EXPO_PUBLIC_SUPABASE_ANON_KEY:', process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY?.substring(0, 20) + '...');
              
              const result = await testSupabaseConnection();
              console.log('Connection test result:', result);
              
              Alert.alert('Debug Info', `Check console for detailed logs. Connection: ${result.success ? 'OK' : 'Failed'}`);
            }}
            activeOpacity={0.7}
          >
            <Text style={styles.debugButtonText}>
              🔧 Debug Connection
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Don't have an account? </Text>
          <Link href="/(auth)/register" asChild>
            <TouchableOpacity 
              disabled={isButtonDisabled}
              activeOpacity={0.7}
            >
              <Text style={[
                styles.signUpText,
                isButtonDisabled && styles.disabledText
              ]}>
                Sign Up
              </Text>
            </TouchableOpacity>
          </Link>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
    minHeight: '100%',
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.light.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.light.darkGray,
    textAlign: 'center',
    lineHeight: 22,
  },
  form: {
    marginBottom: 32,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.lightGray,
    borderRadius: 12,
    marginBottom: 16,
    paddingHorizontal: 16,
    height: 56,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: Colors.light.text,
    paddingVertical: 0,
  },
  eyeIcon: {
    padding: 4,
    borderRadius: 20,
  },
  errorContainer: {
    backgroundColor: Colors.light.periodLight,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  rateLimitContainer: {
    backgroundColor: Colors.light.lightGray,
    borderWidth: 1,
    borderColor: Colors.light.primary,
  },
  clockIcon: {
    marginRight: 8,
    marginTop: 2,
  },
  errorText: {
    color: Colors.light.periodHeavy,
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
    lineHeight: 18,
  },
  rateLimitText: {
    color: Colors.light.primary,
  },
  loginButton: {
    backgroundColor: Colors.light.primary,
    borderRadius: 12,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: Colors.light.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  disabledButton: {
    opacity: 0.6,
    shadowOpacity: 0,
    elevation: 0,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  buttonIcon: {
    marginRight: 8,
  },
  loginButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  forgotPasswordButton: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  forgotPasswordText: {
    color: Colors.light.primary,
    fontSize: 14,
    fontWeight: '500',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 20,
  },
  footerText: {
    fontSize: 14,
    color: Colors.light.darkGray,
  },
  signUpText: {
    fontSize: 14,
    color: Colors.light.primary,
    fontWeight: '600',
  },
  disabledText: {
    opacity: 0.6,
  },
  connectionStatus: {
    fontSize: 12,
    color: Colors.light.darkGray,
    textAlign: 'center',
    marginTop: 8,
    fontFamily: 'monospace',
  },
  debugButton: {
    alignItems: 'center',
    paddingVertical: 8,
    marginTop: 8,
  },
  debugButtonText: {
    color: Colors.light.darkGray,
    fontSize: 12,
    fontWeight: '500',
  },
});