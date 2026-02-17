import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Chip from '@mui/material/Chip'
import Container from '@mui/material/Container'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'react-i18next'

export function HomePage() {
  const { t } = useTranslation()
  const cartItemCount = 12345
  const monthlyRevenue = 1234567.89
  const features = [
    { title: t('featureOneTitle'), body: t('featureOneBody') },
    { title: t('featureTwoTitle'), body: t('featureTwoBody') },
    { title: t('featureThreeTitle'), body: t('featureThreeBody') },
  ]

  return (
    <Container component="main" maxWidth="md" sx={{ py: { xs: 6, md: 10 } }}>
      <Stack spacing={4}>
        <Chip label="React + TypeScript + i18next" color="primary" sx={{ alignSelf: 'start' }} />

        <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
          <CardContent sx={{ p: { xs: 3, md: 5 } }}>
            <Stack spacing={3}>
              <Typography variant="h1" sx={{ fontSize: { xs: '2rem', md: '3rem' } }}>
                {t('title')}
              </Typography>
              <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 500 }}>
                {t('subtitle')}
              </Typography>

              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <Button variant="contained" color="primary">
                  {t('primaryAction')}
                </Button>
                <Button variant="outlined" color="primary">
                  {t('secondaryAction')}
                </Button>
              </Stack>

              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 0.5 }}>
                  {t('autoFormattingTitle')}
                </Typography>
                <Typography color="text.secondary">{t('cartItems', { count: cartItemCount })}</Typography>
                <Typography color="text.secondary">{t('monthlyRevenue', { value: monthlyRevenue })}</Typography>
              </Box>
            </Stack>
          </CardContent>
        </Card>

        <Box component="section" aria-labelledby="features-title">
          <Typography id="features-title" variant="h2" sx={{ fontSize: { xs: '1.4rem', md: '1.8rem' }, mb: 2 }}>
            {t('sectionTitle')}
          </Typography>
          <Stack spacing={2}>
            {features.map((feature) => (
              <Card key={feature.title} elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {feature.title}
                  </Typography>
                  <Typography color="text.secondary">{feature.body}</Typography>
                </CardContent>
              </Card>
            ))}
          </Stack>
        </Box>
      </Stack>
    </Container>
  )
}
