import { createTheme, ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import { useMemo } from 'react';
import { useTheme } from 'next-themes';

// Define color palette
const lightPalette = {
  primary: {
    main: '#1976D2',
    light: '#42A5F5',
    dark: '#1565C0',
    contrastText: '#FFFFFF',
  },
  secondary: {
    main: '#DC004E',
    light: '#FF5983',
    dark: '#9A0036',
    contrastText: '#FFFFFF',
  },
  success: {
    main: '#4CAF50',
    light: '#81C784',
    dark: '#388E3C',
  },
  warning: {
    main: '#FFA726',
    light: '#FFB74D',
    dark: '#F57C00',
  },
  error: {
    main: '#F44336',
    light: '#EF5350',
    dark: '#D32F2F',
  },
  info: {
    main: '#29B6F6',
    light: '#4FC3F7',
    dark: '#0277BD',
  },
  background: {
    default: '#FAFAFA',
    paper: '#FFFFFF',
  },
  divider: '#BDBDBD',
};

const darkPalette = {
  primary: {
    main: '#42A5F5',
    light: '#64B5F6',
    dark: '#1976D2',
    contrastText: '#000000',
  },
  secondary: {
    main: '#FF5983',
    light: '#FF7BA8',
    dark: '#DC004E',
    contrastText: '#000000',
  },
  success: {
    main: '#66BB6A',
    light: '#81C784',
    dark: '#4CAF50',
  },
  warning: {
    main: '#FFA726',
    light: '#FFB74D',
    dark: '#F57C00',
  },
  error: {
    main: '#EF5350',
    light: '#F44336',
    dark: '#D32F2F',
  },
  info: {
    main: '#4FC3F7',
    light: '#29B6F6',
    dark: '#0277BD',
  },
  background: {
    default: '#121212',
    paper: '#1E1E1E',
  },
  divider: '#424242',
};

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { theme: systemTheme } = useTheme();
  const isDarkMode = systemTheme === 'dark';

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode: isDarkMode ? 'dark' : 'light',
          ...(isDarkMode ? darkPalette : lightPalette),
        },
        typography: {
          fontFamily: [
            '-apple-system',
            'BlinkMacSystemFont',
            '"Segoe UI"',
            'Roboto',
            '"Helvetica Neue"',
            'Arial',
            'sans-serif',
          ].join(','),
          h1: { fontSize: '2.5rem', fontWeight: 700, lineHeight: 1.2 },
          h2: { fontSize: '2rem', fontWeight: 700, lineHeight: 1.3 },
          h3: { fontSize: '1.75rem', fontWeight: 600, lineHeight: 1.4 },
          h4: { fontSize: '1.5rem', fontWeight: 600, lineHeight: 1.4 },
          h5: { fontSize: '1.25rem', fontWeight: 600, lineHeight: 1.5 },
          h6: { fontSize: '1rem', fontWeight: 600, lineHeight: 1.5 },
          body1: { fontSize: '1rem', lineHeight: 1.5 },
          body2: { fontSize: '0.875rem', lineHeight: 1.43 },
          caption: { fontSize: '0.75rem', lineHeight: 1.66 },
          button: { textTransform: 'none', fontWeight: 500 },
        },
        shape: { borderRadius: 8 },
        components: {
          MuiButton: {
            styleOverrides: {
              root: {
                textTransform: 'none',
                fontWeight: 600,
                padding: '8px 16px',
                transition: 'all 0.3s ease',
              },
              contained: {
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                '&:hover': { boxShadow: '0 4px 12px rgba(0,0,0,0.15)' },
              },
            },
          },
          MuiCard: {
            styleOverrides: {
              root: {
                boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                  transform: 'translateY(-2px)',
                },
              },
            },
          },
          MuiPaper: {
            styleOverrides: {
              root: {
                transition: 'background-color 0.3s ease',
              },
            },
          },
          MuiAppBar: {
            styleOverrides: {
              root: {
                boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
              },
            },
          },
        },
      }),
    [isDarkMode]
  );

  return <MuiThemeProvider theme={theme}>{children}</MuiThemeProvider>;
}
