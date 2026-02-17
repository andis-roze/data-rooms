import AppBar from '@mui/material/AppBar'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import ToggleButton from '@mui/material/ToggleButton'
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import { NavLink, Outlet } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import type { AppLanguage } from '../../i18n/resources'

export function AppLayout() {
  const { t, i18n } = useTranslation()
  const currentLanguage = (i18n.resolvedLanguage ?? i18n.language).startsWith('de')
    ? 'de'
    : 'en'

  const handleLanguageChange = (_: React.MouseEvent<HTMLElement>, value: AppLanguage | null) => {
    if (!value) {
      return
    }

    void i18n.changeLanguage(value)
  }

  return (
    <>
      <AppBar position="sticky" color="transparent" elevation={0} sx={{ backdropFilter: 'blur(10px)' }}>
        <Toolbar sx={{ gap: 2, justifyContent: 'space-between', flexWrap: 'wrap' }}>
          <Typography variant="h6" component="p" sx={{ fontWeight: 800 }}>
            {t('brand')}
          </Typography>

          <Stack direction="row" spacing={1} component="nav" aria-label={t('navigationLabel')}>
            <Button component={NavLink} to="/" color="inherit" end>
              {t('navHome')}
            </Button>
            <Button component={NavLink} to="/about" color="inherit">
              {t('navAbout')}
            </Button>
          </Stack>

          <Stack direction="row" spacing={1} alignItems="center">
            <Typography variant="body2" color="text.secondary">
              {t('language')}
            </Typography>
            <ToggleButtonGroup
              size="small"
              color="primary"
              value={currentLanguage}
              exclusive
              onChange={handleLanguageChange}
              aria-label={t('language')}
            >
              <ToggleButton value="en">EN</ToggleButton>
              <ToggleButton value="de">DE</ToggleButton>
            </ToggleButtonGroup>
          </Stack>
        </Toolbar>
      </AppBar>
      <Box component="div">
        <Outlet />
      </Box>
    </>
  )
}
