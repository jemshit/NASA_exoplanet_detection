import React from 'react';
import { View, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { Sun, Moon, Smartphone, User } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';

const logoLight = require('@/assets/images/logo-light.png');
const logoDark = require('@/assets/images/logo-dark.png');

export function AppHeader() {
  const { effectiveTheme, toggleTheme, theme } = useTheme();
  const isDark = effectiveTheme === 'dark';

  const getThemeIcon = () => {
    if (theme === 'system') return Smartphone;
    return theme === 'dark' ? Moon : Sun;
  };

  const ThemeIcon = getThemeIcon();

  return (
    <View style={[
      styles.container,
      { 
        backgroundColor: isDark ? '#0B0C10' : '#F8FAFD',
        borderBottomColor: isDark ? '#363D50' : '#E2E8F0',
      }
    ]}>
      <View style={styles.content}>
        {/* Logo */}
        <View style={styles.logoContainer}>
          <Image source={isDark ? logoDark : logoLight} style={styles.logo} />
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          {/* Theme Toggle */}
          <TouchableOpacity
            onPress={toggleTheme}
            style={[
              styles.button,
              { backgroundColor: isDark ? '#242936' : '#FFFFFF' }
            ]}
          >
            <ThemeIcon
              size={20}
              color="#00BFFF"
            />
          </TouchableOpacity>

          {/* User */}
          <TouchableOpacity
            style={[
              styles.button,
              { backgroundColor: isDark ? '#242936' : '#FFFFFF' }
            ]}
          >
            <User
              size={20}
              color={isDark ? '#E6F1FF' : '#0B0C10'}
            />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderBottomWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  logoContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  logo: {
    height: 40,
    width: 200,
    resizeMode: 'contain',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  button: {
    padding: 8,
    borderRadius: 8,
  },
});

