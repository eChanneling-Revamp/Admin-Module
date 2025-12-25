'use client'

import React, { useMemo } from 'react'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'

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
}

const darkPalette = {
  primary: {
    main: '#42A5F5',
    light: '#64B5F6',
    dark: '#1976D2',
    contrastText: '#000000',
  },
  secondary: {
    main: '#F48FB1',
    light: '#F8BBD0',
    dark: '#C2185B',
    contrastText: '#000000',
  },
  success: {
    main: '#66BB6A',
    light: '#81C784',
    dark: '#388E3C',
  },
  warning: {
    main: '#FFA726',
    light: '#FFB74D',
    dark: '#F57C00',
  },
  error: {
    main: '#EF5350',
    light: '#E57373',
    dark: '#C62828',
  },
  info: {
    main: '#29B6F6',
    light: '#4FC3F7',
    dark: '#0277BD',
  },
  background: {
    default: '#121212',
    paper: '#1E1E1E',
  },
  divider: '#424242',
}

export function MuiThemeProvider({ children }: { children: React.ReactNode }) {
  const theme = useMemo(() => {
    // Determine theme mode - default to light
    const isDark = false // You can use next-themes to detect mode if needed

    return createTheme({
      palette: isDark ? darkPalette : lightPalette,
      typography: {
        fontFamily: '"Geist", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
        h1: {
          fontSize: '2.5rem',
          fontWeight: 700,
          lineHeight: 1.2,
        },
        h2: {
          fontSize: '2rem',
          fontWeight: 700,
          lineHeight: 1.3,
        },
        h3: {
          fontSize: '1.75rem',
          fontWeight: 600,
          lineHeight: 1.4,
        },
        h4: {
          fontSize: '1.5rem',
          fontWeight: 600,
          lineHeight: 1.4,
        },
        h5: {
          fontSize: '1.25rem',
          fontWeight: 600,
          lineHeight: 1.5,
        },
        h6: {
          fontSize: '1rem',
          fontWeight: 600,
          lineHeight: 1.5,
        },
        body1: {
          fontSize: '1rem',
          lineHeight: 1.5,
        },
        body2: {
          fontSize: '0.875rem',
          lineHeight: 1.5,
        },
      },
      components: {
        MuiCssBaseline: {
          styleOverrides: {
            body: {
              margin: 0,
              padding: 0,
            },
            html: {
              margin: 0,
              padding: 0,
            },
          },
        },
        MuiButton: {
          styleOverrides: {
            root: {
              textTransform: 'none',
              fontWeight: 500,
              borderRadius: '8px',
              transition: 'all 0.3s ease',
            },
          },
        },
        MuiCard: {
          styleOverrides: {
            root: {
              borderRadius: '12px',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
            },
          },
        },
      },
    })
  }, [])

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  )
}
