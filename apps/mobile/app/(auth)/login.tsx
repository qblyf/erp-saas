import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import {
  Text,
  TextInput,
  Button,
  Surface,
  IconButton,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/hooks/useAuth';

export default function LoginScreen() {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    if (!username.trim()) {
      Alert.alert('错误', '请输入用户名');
      return;
    }
    if (!password.trim()) {
      Alert.alert('错误', '请输入密码');
      return;
    }

    setLoading(true);
    try {
      await login({ username: username.trim(), password });
    } catch (error: any) {
      Alert.alert('登录失败', error?.response?.data?.message || '请检查用户名和密码');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <View style={styles.content}>
          <View style={styles.header}>
            <Text variant="displaySmall" style={styles.title}>
              ERP Mobile
            </Text>
            <Text variant="bodyLarge" style={styles.subtitle}>
              企业资源管理系统
            </Text>
          </View>

          <Surface style={styles.form} elevation={2}>
            <TextInput
              label="用户名"
              value={username}
              onChangeText={setUsername}
              mode="outlined"
              autoCapitalize="none"
              autoCorrect={false}
              left={<TextInput.Icon icon="account" />}
              style={styles.input}
            />

            <TextInput
              label="密码"
              value={password}
              onChangeText={setPassword}
              mode="outlined"
              secureTextEntry={!showPassword}
              left={<TextInput.Icon icon="lock" />}
              right={
                <TextInput.Icon
                  icon={showPassword ? 'eye-off' : 'eye'}
                  onPress={() => setShowPassword(!showPassword)}
                />
              }
              style={styles.input}
            />

            <Button
              mode="contained"
              onPress={handleLogin}
              loading={loading}
              disabled={loading}
              style={styles.button}
              contentStyle={styles.buttonContent}
            >
              登录
            </Button>
          </Surface>

          <Text variant="bodySmall" style={styles.version}>
            Version 1.0.0
          </Text>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
  },
  title: {
    fontWeight: 'bold',
    color: '#2196f3',
  },
  subtitle: {
    color: '#666',
    marginTop: 8,
  },
  form: {
    padding: 24,
    borderRadius: 16,
    backgroundColor: '#fff',
  },
  input: {
    marginBottom: 16,
    backgroundColor: '#fff',
  },
  button: {
    marginTop: 8,
    borderRadius: 8,
  },
  buttonContent: {
    paddingVertical: 8,
  },
  version: {
    textAlign: 'center',
    color: '#999',
    marginTop: 32,
  },
});
