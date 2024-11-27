'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { ThemeProvider } from '@mui/material/styles'
import { CircularProgress, Box, Typography } from '@mui/material'
import theme from '../styles/theme'

const DriverGame = dynamic(() => import('../components/DriverGame'), { 
  ssr: false,
  loading: () => <CircularProgress />
})

export default function Home() {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  if (!isClient) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <CircularProgress />
      </Box>
    )
  }

  return (
    <ThemeProvider theme={theme}>
      <Box className="fondo">
        <Typography variant="h4" component="h1" gutterBottom className='titulo_juego'>
          FORMACIONES DE OLGA
        </Typography>
        <DriverGame />
      </Box>
    </ThemeProvider>
  )
}
