import { createTheme } from '@mui/material/styles'

export const appTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#0f766e',
      contrastText: '#f8fafc',
    },
    secondary: {
      main: '#fb8500',
    },
    background: {
      default: '#f2f5f9',
      paper: '#ffffff',
    },
    text: {
      primary: '#1f2937',
      secondary: '#4b5563',
    },
  },
  shape: {
    borderRadius: 16,
  },
  typography: {
    fontFamily: 'Manrope, "Segoe UI", sans-serif',
    h1: {
      fontWeight: 700,
      letterSpacing: '-0.03em',
    },
    h2: {
      fontWeight: 700,
      letterSpacing: '-0.02em',
    },
    button: {
      fontWeight: 700,
      textTransform: 'none',
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 999,
          paddingInline: '1.2rem',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },
  },
})
