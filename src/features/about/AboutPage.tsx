import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Container from '@mui/material/Container'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'react-i18next'

export function AboutPage() {
  const { t } = useTranslation()

  return (
    <Container component="main" maxWidth="md" sx={{ py: { xs: 6, md: 10 } }}>
      <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
        <CardContent sx={{ p: { xs: 3, md: 5 } }}>
          <Stack spacing={2}>
            <Typography variant="h1" sx={{ fontSize: { xs: '1.8rem', md: '2.5rem' } }}>
              {t('aboutTitle')}
            </Typography>
            <Typography color="text.secondary">{t('aboutBody')}</Typography>
          </Stack>
        </CardContent>
      </Card>
    </Container>
  )
}
