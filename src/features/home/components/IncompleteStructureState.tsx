import Container from '@mui/material/Container'
import Paper from '@mui/material/Paper'
import Typography from '@mui/material/Typography'

interface IncompleteStructureStateProps {
  title: string
}

export function IncompleteStructureState({ title }: IncompleteStructureStateProps) {
  return (
    <Container component="main" maxWidth="lg" sx={{ py: { xs: 4, md: 6 } }}>
      <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', p: 4 }}>
        <Typography variant="h1" sx={{ fontSize: { xs: '1.8rem', md: '2.4rem' } }}>
          {title}
        </Typography>
      </Paper>
    </Container>
  )
}
