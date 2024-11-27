'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Container,
  Grid,
  Card,
  CardContent,
  Button,
  Avatar,
  Snackbar,
  Box,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Link,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';

interface Conductor {
  id: number;
  codigo: string;
  nombre: string;
  avatar: string;
}

interface Programa {
  id: string;
  videoId: string;
  conductores: number[];
  titulo: string;
  portada: string;
}

interface DriverSpot {
  id: number;
  driver: number | null;
}

interface HistoryEntry {
  configuration: DriverSpot[];
  buttonUsed: string;
  result: string;
  previousScore: number;
  pointsEarned: number;
  newScore: number;
}

const Table: React.FC<{ spots: DriverSpot[], onSpotClick: (id: number) => void, conductores: Conductor[] }> = ({ spots, onSpotClick, conductores }) => (
  <Card sx={{ position: 'relative', width: '100%', mb: 2, overflow: 'hidden' }}>
    <Box
      component="img"
      src="https://www.revistadeck.com/wp-content/uploads/Olga-1.jpg"
      alt="Table background"
      sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
    />
    <Grid container spacing={2} sx={{ position: 'absolute', inset: 0, p: 2 }}>
      {spots.map((spot) => (
        <Grid item xs={4} key={`spot-${spot.id}`} >
          <Button className="boton_cartas_spots"
            onClick={() => onSpotClick(spot.id)}
            sx={{
              width: '100%',
              aspectRatio: '1/1',
              borderRadius: '50%',
              bgcolor: spot.driver ? conductores.find(c => c.id === spot.driver)?.codigo || 'rgba(255, 255, 255, 0.5)' : 'rgba(255, 255, 255, 0.5)',
              '&:hover': {
                bgcolor: spot.driver ? conductores.find(c => c.id === spot.driver)?.codigo || 'rgba(255, 255, 255, 0.7)' : 'rgba(255, 255, 255, 0.7)',
              },
            }}
          >
            {spot.driver ? (
              <Avatar 
                src={conductores.find(c => c.id === spot.driver)?.avatar} 
                alt={conductores.find(c => c.id === spot.driver)?.nombre || `Driver ${spot.driver}`} 
                sx={{ width: '75%', height: '75%' }} 
              />
            ) : (
              <Typography variant="h4" >{spot.id}</Typography>
            )}
          </Button>
        </Grid>
      ))}
    </Grid>
  </Card>
);

const ConfigurationList: React.FC<{ spots: DriverSpot[], conductores: Conductor[] }> = ({ spots, conductores }) => (
  <Card sx={{ mt: 2 }} className="ConfigurationListDEBUG">
    <CardContent>
      <Typography variant="h6" gutterBottom>Configuración actual:</Typography>
      <List>
        {spots.map((spot) => (
          <ListItem key={`config-${spot.id}`}>
            <ListItemAvatar>
              <Avatar sx={{ bgcolor: spot.driver ? conductores.find(c => c.id === spot.driver)?.codigo : 'grey.300' }}>
                {spot.driver ? (
                  <img src={conductores.find(c => c.id === spot.driver)?.avatar} alt={conductores.find(c => c.id === spot.driver)?.nombre} style={{ width: '100%', height: '100%' }} />
                ) : (
                  <Typography variant="body2">Vacío</Typography>
                )}
              </Avatar>
            </ListItemAvatar>
            <ListItemText 
              primary={`Spot ${spot.id}`} 
              secondary={spot.driver ? conductores.find(c => c.id === spot.driver)?.nombre : 'Empty'} 
            />
          </ListItem>
        ))}
      </List>
    </CardContent>
  </Card>
);

const ScoreCounter: React.FC<{ score: number }> = ({ score }) => (
  <Typography variant="h4" sx={{ position: 'absolute', top: 16, right: 16, color: '#006DC5' }}>
    Score: {score}
  </Typography>
);

const ProgramList: React.FC<{ programs: Programa[], conductores: Conductor[] }> = ({ programs, conductores }) => (
  <Card sx={{ mt: 2 }}>
    <CardContent>
      <Typography variant="h6" gutterBottom>Programas conducido por ellos:</Typography>
      <List>
        {programs.map((program) => (
          <ListItem key={program.id}>
            <ListItemText className='titulo_videos'
              primary={program.titulo}
              secondary={
                <>
                  <Link href={`https://www.youtube.com/watch?v=${program.videoId}`} target="_blank" rel="noopener noreferrer">
                    Ver en YouTube
                  </Link>
                  <br />
                  Conductores: {program.conductores.map(id => conductores.find(c => Number(c.id) === Number(id))?.nombre).join(', ')}
                </>
              }
            />
          </ListItem>
        ))}
      </List>
    </CardContent>
  </Card>
);

const History: React.FC<{ history: HistoryEntry[] }> = ({ history }) => (
  <Card sx={{ mt: 2 }}>
    <CardContent>
      <Typography variant="h6" gutterBottom>HISTORIAL</Typography>
      <List>
        {history.map((entry, index) => (
          <ListItem key={`history-${index}`}>
            <ListItemText
              primary={`Jugada ${index + 1}`}
              secondary={`Botón: ${entry.buttonUsed}, Resultado: ${entry.result}, Puntaje antes: ${entry.previousScore}, Resultado: ${entry.pointsEarned}, Nuevo Puntaje: ${entry.newScore}`}
            />
          </ListItem>
        ))}
      </List>
    </CardContent>
  </Card>
);

export default function DriverGame() {
  const [spots, setSpots] = useState<DriverSpot[]>(Array.from({ length: 6 }, (_, index) => ({ id: index + 1, driver: null })));
  const [score, setScore] = useState(0);
  const [conductores, setConductores] = useState<Conductor[]>([]);
  const [programasConductores, setProgramasConductores] = useState<Programa[]>([]);
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [matchingPrograms, setMatchingPrograms] = useState<Programa[]>([]);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [driverSelectionOpen, setDriverSelectionOpen] = useState(false);
  const [selectedSpot, setSelectedSpot] = useState<number | null>(null);

  const assignRandomDrivers = useCallback(() => {
    console.log('Assigning random drivers: ', conductores);
    if (conductores.length === 0) {
      console.log('No conductores available, returning empty spots');
      return Array.from({ length: 6 }, (_, index) => ({ id: index + 1, driver: null }));
    }
    const shuffledDrivers = [...conductores].sort(() => Math.random() - 0.5);
    const numDrivers = Math.floor(Math.random() * 3) + 4; // 4 to 6 drivers
    return Array.from({ length: 6 }, (_, index) => ({
      id: index + 1,
      driver: index < numDrivers ? shuffledDrivers[index].id : null
    }));
  }, [conductores]);

  useEffect(() => {
    const conductoresURL =
      'https://sheets.livepolls.app/api/spreadsheets/04f6928d-3097-4c28-918b-054bc2d649d9/EXPORT-%3ECSV_conductores';
    const programasURL =
      'https://sheets.livepolls.app/api/spreadsheets/04f6928d-3097-4c28-918b-054bc2d649d9/EXPORT-%3ECSV_programas';
    
    const fetchData = async () => {
      try {
        const [conductoresRes, programasRes] = await Promise.all([
          fetch(conductoresURL),
          fetch(programasURL),
        ]);

        const conductoresText = await conductoresRes.json();
        const programasText = await programasRes.json();

        setConductores(conductoresText.data);

        const programasUnificados: Programa[] = programasText.data.map((item: any) => ({
          id: item.id,
          videoId: item.videoId,
          conductores: [item.c1, item.c2, item.c3, item.c4, item.c5, item.c6]
            .filter((c: string) => c !== "") // Filtra valores vacíos
            .map(Number), // Convierte a números
          titulo: item.titulo,
          portada: item.portada,
          detalles: `${item.titulo} (Video ID: ${item.videoId})`, // Campo unificado
        }));
        setProgramasConductores(programasUnificados);
    
        setIsDataLoaded(true);
      } catch (error) {
        console.error('Error loading data:', error);
        setSnackbarMessage('Error al cargar los datos. Inténtalo nuevamente.');
        setSnackbarOpen(true);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (isDataLoaded && conductores.length > 0) {
      console.log('Assigning random drivers');
      const randomSpots = assignRandomDrivers();
      console.log('Random spots assigned:', randomSpots);
      setSpots(randomSpots);
    }
  }, [isDataLoaded, assignRandomDrivers, conductores]);

  const handleSpotClick = (id: number) => {
    console.log('Spot clicked:', id);
    const spot = spots.find(s => s.id === id);
    if (spot && spot.driver === null) {
      setSelectedSpot(id);
      console.log('Opening driver selection dialog');
      setDriverSelectionOpen(true);
    } else {
      setSpots(spots.map(spot => spot.id === id ? { ...spot, driver: null } : spot));
    }
  };

  const handleDriverSelection = (driverId: number) => {
    console.log('Driver selected:', driverId);
    if (selectedSpot !== null) {
      setSpots(prevSpots => prevSpots.map(spot => 
        spot.id === selectedSpot ? { ...spot, driver: driverId } : 
        spot.driver === driverId ? { ...spot, driver: null } : spot
      ));
      setDriverSelectionOpen(false);
      setSelectedSpot(null);
    }
  };

  const checkOutcome = (occurred: boolean, checkOrder: boolean) => {
    const currentConfig = spots.map(spot => spot.driver).filter(Boolean) as number[];
    
    if (currentConfig.length < 4) {
      setModalMessage('NO TERMINASTE');
      setModalOpen(true);
      return;
    }

    const buttonUsed = checkOrder ? 'OCURRIO EN ORDEN' : (occurred ? 'OCURRIO' : 'NO OCURRIO');
    
    // Check if a similar play has been made before
    const similarPlay = history.find(entry => 
      entry.buttonUsed === buttonUsed &&
      entry.configuration.filter(spot => spot.driver !== null).length === currentConfig.length &&
      entry.configuration.every(spot => spot.driver === null || currentConfig.includes(spot.driver))
    );

    if (similarPlay) {
      setSnackbarMessage('Ya has hecho una jugada similar. Intenta algo diferente.');
      setSnackbarOpen(true);
      setSpots(assignRandomDrivers());
      return;
    }

    let isCorrect = false;
    let matchingPrograms: Programa[] = [];
    const currentConfigNumbers = currentConfig.map(Number);
    console.log('programasConductores: ', programasConductores);
    console.log('currentConfig: ', currentConfig);
    console.log('checkOrder: ', checkOrder);
    if (checkOrder) {
      isCorrect = programasConductores.some(program => 
        program.conductores.length === currentConfigNumbers.length &&
        program.conductores.every((conductor, index) => conductor === currentConfigNumbers[index])
      );
      matchingPrograms = programasConductores.filter(program => 
        program.conductores.length === currentConfigNumbers.length &&
        program.conductores.every((conductor, index) => conductor === currentConfigNumbers[index])
      );
    } else {
      isCorrect = programasConductores.some(program => 
        program.conductores.length === currentConfigNumbers.length &&
        program.conductores.every(conductor => currentConfigNumbers.includes(conductor))
      );
      matchingPrograms = programasConductores.filter(program => 
        program.conductores.length === currentConfigNumbers.length &&
        program.conductores.every(conductor => currentConfigNumbers.includes(conductor))
      );
    }

    const points = checkOrder ? 30 : (occurred ? 10 : 20);
    const previousScore = score;
    const pointsEarned = isCorrect === occurred ? points : -points;
    const newScore = previousScore + pointsEarned;

    if (isCorrect === occurred) {
      setModalMessage('Siiii!');
      setScore(newScore);
    } else {
      setModalMessage('MENTIRA PORQUE MENTIS');
      setScore(newScore);
    }

    setHistory(prevHistory => [...prevHistory,
{ 
        configuration: spots, 
        buttonUsed, 
        result: isCorrect === occurred ? 'Acierto' : 'NoAcierto',
        previousScore,
        pointsEarned,
        newScore
      }
    ]);

    setMatchingPrograms(matchingPrograms);
    setModalOpen(true);
  };

  const clearConfiguration = () => {
    setSpots(prevSpots => prevSpots.map(spot => ({ ...spot, driver: null })));
  };

  if (!isDataLoaded) {
    //return '<div class="loading">CARGANDOOOOO...</div>';
    return(
      <Dialog 
        open={true} 
        onClose={() => {
          setModalOpen(true);          
        }}
        PaperProps={{
          style: {
            backgroundColor: modalMessage === 'CARGANDO INFO DE PROGRAMAS' ? '#ff084a' : 'rgba(215, 29, 23, 0.8)',
          },
        }}
      >
        <DialogTitle>CARGANDO EL JUEGO</DialogTitle>
        <DialogContent>
          <Typography>cargando los shows de Olga</Typography>
        </DialogContent>
      </Dialog>
    );
    
  }

  return (
    <Container className="contenedor_juego" maxWidth="lg" sx={{ py: 4, bgcolor: '#00184C' }}>
      <AppBar position="static" sx={{ mb: 4, bgcolor: '#D71D17' }} className='header_juego'>
        <Toolbar>
          <Typography variant="h6" >CONFIGURÁ LA MESA</Typography>
        </Toolbar>
      </AppBar>
      <Box sx={{ position: 'relative' }}>
        <ScoreCounter score={score} />
        <Table spots={spots} onSpotClick={handleSpotClick} conductores={conductores} />
      </Box>
      <ConfigurationList spots={spots} conductores={conductores} />
      <Grid container spacing={2} justifyContent="center" sx={{ mt: 2 }}>
        <Grid item>
          <Button 
            variant="contained" 
            sx={{ bgcolor: '#489D01', '&:hover': { bgcolor: '#000000' } }}
            onClick={() => checkOutcome(true, false)}
          >
            OCURRIÓ
          </Button>
        </Grid>
        <Grid item>
          <Button 
            variant="contained" 
            sx={{ bgcolor: '#ff084a', '&:hover': { bgcolor: '#000000' } }}
            onClick={() => checkOutcome(false, false)}
          >
            NO OCURRIÓ
          </Button>
        </Grid>
        <Grid item>
          <Button 
            variant="contained" 
            sx={{ bgcolor: '#0069ae', '&:hover': { bgcolor: '#000000' } }}
            onClick={() => checkOutcome(true, true)}
          >
            OCURRIO EN ESE ORDEN!
          </Button>
        </Grid>
        <Grid item>
          <Button 
            variant="contained" 
            sx={{ bgcolor: '#F9A31A', '&:hover': { bgcolor: '#D71D17' } }}
            onClick={clearConfiguration}
          >
            LIMPIAR LUGARES
          </Button>
        </Grid>
      </Grid>
      <Button 
        variant="outlined" 
        sx={{ mt: 2, color: '#006DC5', borderColor: '#006DC5' }}
        onClick={() => setShowHistory(!showHistory)}
      >
        {showHistory ? 'OCULTAR EL HISTORIAL' : 'MOSTRAL EL HISTORIAL DE JUGADAS'}
      </Button>
      {showHistory && <History history={history} />}
      <Dialog 
        open={modalOpen} 
        onClose={() => {
          setModalOpen(false);
          setSpots(assignRandomDrivers());
        }}
        PaperProps={{
          style: {
            backgroundColor: modalMessage === 'Siiii!' ? 'rgba(72, 157, 1, 0.8)' : 'rgba(215, 29, 23, 0.8)',
          },
        }}
      >
        <DialogTitle>{modalMessage}</DialogTitle>
        <DialogContent>
          <Typography>Tu puntaje es: {score}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setModalOpen(false);
            setSpots(assignRandomDrivers());
          }} sx={{ color: '#006DC5' }}>
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog open={driverSelectionOpen} onClose={() => setDriverSelectionOpen(false)}>
        <DialogTitle>Seleccioná uno conductor:</DialogTitle>
        <DialogContent>
          <Grid container spacing={2}>
            {conductores.map((driver) => (
              <Grid item key={`driver-${driver.id}`} xs={6} sm={4} md={3}>
                <Button
                  onClick={() => handleDriverSelection(driver.id)}
                  sx={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    textAlign: 'center',
                  }}
                >
                  <Avatar src={driver.avatar} alt={driver.nombre} sx={{ width: 56, height: 56, mb: 1 }} />
                  <Typography variant="caption">{driver.nombre}</Typography>
                </Button>
              </Grid>
            ))}
          </Grid>
        </DialogContent>
      </Dialog>
      {matchingPrograms.length > 0 && <ProgramList programs={matchingPrograms} conductores={conductores} />}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
        message={snackbarMessage}
      />
    </Container>
  );
}

