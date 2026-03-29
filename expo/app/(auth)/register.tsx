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
import { Eye, EyeOff, Mail, Lock, User, Clock } from 'lucide-react-native';

import { useAuth } from '@/hooks/use-auth';
import Colors from '@/constants/colors';

export default function RegisterScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [rateLimitCooldown, setRateLimitCooldown] = useState(0);
  const [lastAttemptTime, setLastAttemptTime] = useState(0);
  const { register, isRegistering, registerError, clearErrors } = useAuth();
  const cooldownInterval = useRef<number | null>(null);
  const emailInputRef = useRef<TextInput>(null);
  const passwordInputRef = useRef<TextInput>(null);
  const confirmPasswordInputRef = useRef<TextInput>(null);

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
    if (registerError && clearErrors) {
      clearErrors();
    }
  }, [name, email, password, confirmPassword, registerError, clearErrors]);

  const startCooldown = (seconds: number) => {
    console.log(`Starting register cooldown for ${seconds} seconds`);
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
          console.log('Register cooldown finished');
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

  const handleRegister = async () => {
    console.log('Register button clicked');
    
    // Prevent rapid successive clicks (within 2 seconds)
    const now = Date.now();
    if (now - lastAttemptTime < 2000) {
      console.log('Preventing rapid successive register clicks');
      return;
    }
    setLastAttemptTime(now);

    if (rateLimitCooldown > 0) {
      Alert.alert(
        'Please Wait', 
        `You can try again in ${rateLimitCooldown} seconds. This security measure prevents spam registrations.`
      );
      return;
    }

    // Validate inputs
    const trimmedName = name.trim();
    const trimmedEmail = email.trim().toLowerCase();
    const trimmedPassword = password.trim();
    const trimmedConfirmPassword = confirmPassword.trim();

    if (!trimmedName || !trimmedEmail || !trimmedPassword || !trimmedConfirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (trimmedName.length < 2) {
      Alert.alert('Error', 'Name must be at least 2 characters long');
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

    if (trimmedPassword !== trimmedConfirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    // Check for password strength (optional but recommended)
    if (!/(?=.*[a-zA-Z])(?=.*\d)/.test(trimmedPassword)) {
      Alert.alert(
        'Weak Password', 
        'For better security, use a password with both letters and numbers',
        [
          { text: 'Use Anyway', onPress: () => performRegistration(trimmedEmail, trimmedPassword, trimmedName) },
          { text: 'Change Password', style: 'cancel' }
        ]
      );
      return;
    }

    await performRegistration(trimmedEmail, trimmedPassword, trimmedName);
  };

  const performRegistration = async (email: string, password: string, name: string) => {
    console.log('Validation passed, calling register function');
    try {
      await register(email, password, name);
      console.log('Registration completed successfully');
      
      // Show success message if registration was successful but email verification is needed
      Alert.alert(
        'Registration Successful!',
        'Please check your email and click the verification link to complete your account setup.',
        [{ text: 'OK', style: 'default' }]
      );
    } catch (error) {
      console.error('Registration failed:', error);
      // Error is already set in the auth hook, no need to handle it here
    }
  };

  const getErrorMessage = () => {
    if (!registerError) return null;
    
    const errorMessage = registerError.message.toLowerCase();
    console.log('Processing register error:', errorMessage);
    
    if (errorMessage.includes('request this after') || 
        errorMessage.includes('rate limit') || 
        errorMessage.includes('too many')) {
      // Extract seconds from error message if possible
      const match = errorMessage.match(/(\d+)\s*seconds?/);
      const seconds = match ? parseInt(match[1]) : 60;
      
      if (rateLimitCooldown === 0) {
        startCooldown(seconds);
      }
      
      return `Too many registration attempts. Please wait ${rateLimitCooldown || seconds} seconds before trying again.`;
    }
    
    if (errorMessage.includes('email already registered') || 
        errorMessage.includes('already been registered') ||
        errorMessage.includes('user already registered')) {
      return 'This email is already registered. Try signing in instead.';
    }
    
    if (errorMessage.includes('invalid email') || 
        errorMessage.includes('invalid email address')) {
      return 'Please enter a valid email address.';
    }
    
    if (errorMessage.includes('weak password') || 
        errorMessage.includes('password')) {
      return 'Password is too weak. Use at least 6 characters with a mix of letters and numbers.';
    }

    if (errorMessage.includes('network') || 
        errorMessage.includes('connection') ||
        errorMessage.includes('fetch')) {
      return 'Network error. Please check your internet connection and try again.';
    }

    if (errorMessage.includes('email not confirmed') || 
        errorMessage.includes('signup disabled')) {
      return 'Account registration is currently disabled. Please contact support.';
    }
    
    return registerError.message;
  };

  const isButtonDisabled = isRegistering || rateLimitCooldown > 0;

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
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Join thousands of women tracking their cycles</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <User size={20} color={Colors.light.darkGray} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Full name"
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
              autoComplete="name"
              testID="name-input"
              editable={!isButtonDisabled}
              returnKeyType="next"
              onSubmitEditing={() => emailInputRef.current?.focus()}
            />
          </View>

          <View style={styles.inputContainer}>
            <Mail size={20} color={Colors.light.darkGray} style={styles.inputIcon} />
            <TextInput
              ref={emailInputRef}
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
              placeholder="Password (min 6 characters)"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              autoComplete="new-password"
              testID="password-input"
              editable={!isButtonDisabled}
              returnKeyType="next"
              onSubmitEditing={() => confirmPasswordInputRef.current?.focus()}
            />
            <TouchableOpacity
              style={styles.eyeIcon}
              onPress={() => setShowPassword(!showPassword)}
              testID="toggle-password-visibility"
              disabled={isButtonDisabled}
              activeOpacity={0.7}
            >
              {showPassword ? (
                <EyeOff size={20} color={Colors.light.darkGray} />
              ) : (
                <Eye size={20} color={Colors.light.darkGray} />
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.inputContainer}>
            <Lock size={20} color={Colors.light.darkGray} style={styles.inputIcon} />
            <TextInput
              ref={confirmPasswordInputRef}
              style={styles.input}
              placeholder="Confirm password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!showConfirmPassword}
              autoComplete="new-password"
              testID="confirm-password-input"
              editable={!isButtonDisabled}
              returnKeyType="done"
              onSubmitEditing={handleRegister}
            />
            <TouchableOpacity
              style={styles.eyeIcon}
              onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              testID="toggle-confirm-password-visibility"
              disabled={isButtonDisabled}
              activeOpacity={0.7}
            >
              {showConfirmPassword ? (
                <EyeOff size={20} color={Colors.light.darkGray} />
              ) : (
                <Eye size={20} color={Colors.light.darkGray} />
              )}
            </TouchableOpacity>
          </View>

          {registerError && (
            <View style={[
              styles.errorContainer,
              (registerError.message.toLowerCase().includes('rate limit') || 
               registerError.message.toLowerCase().includes('too many')) && styles.rateLimitContainer
            ]}>
              {(registerError.message.toLowerCase().includes('rate limit') || 
                registerError.message.toLowerCase().includes('too many')) && (
                <Clock size={16} color={Colors.light.primary} style={styles.clockIcon} />
              )}
              <Text style={[
                styles.errorText,
                (registerError.message.toLowerCase().includes('rate limit') || 
                 registerError.message.toLowerCase().includes('too many')) && styles.rateLimitText
              ]}>
                {getErrorMessage()}
              </Text>
            </View>
          )}

          <TouchableOpacity
            style={[styles.registerButton, isButtonDisabled && styles.disabledButton]}
            onPress={handleRegister}
            disabled={isButtonDisabled}
            testID="register-button"
            activeOpacity={0.8}
          >
            {rateLimitCooldown > 0 ? (
              <View style={styles.buttonContent}>
                <Clock size={16} color="#FFF" style={styles.buttonIcon} />
                <Text style={styles.registerButtonText}>
                  Wait {rateLimitCooldown}s
                </Text>
              </View>
            ) : (
              <Text style={styles.registerButtonText}>
                {isRegistering ? 'Creating Account...' : 'Create Account'}
              </Text>
            )}
          </TouchableOpacity>

          <Text style={styles.termsText}>
            By creating an account, you agree to our{' '}
            <Text style={styles.linkText}>Terms of Service</Text> and{' '}
            <Text style={styles.linkText}>Privacy Policy</Text>
          </Text>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Already have an account? </Text>
          <Link href="/(auth)/login" asChild>
            <TouchableOpacity 
              disabled={isButtonDisabled}
              activeOpacity={0.7}
            >
              <Text style={[
                styles.signInText,
                isButtonDisabled && styles.disabledText
              ]}>
                Sign In
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
  registerButton: {
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
  registerButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  termsText: {
    fontSize: 12,
    color: Colors.light.darkGray,
    textAlign: 'center',
    lineHeight: 18,
  },
  linkText: {
    color: Colors.light.primary,
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
  signInText: {
    fontSize: 14,
    color: Colors.light.primary,
    fontWeight: '600',
  },
  disabledText: {
    opacity: 0.6,
  },
});