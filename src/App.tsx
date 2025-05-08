import { useState, useEffect, useRef } from 'react'
import { ThemeProvider, createTheme } from '@mui/material'
import CssBaseline from '@mui/material/CssBaseline'
import styled from '@emotion/styled'
import Map from './components/Map'
import TaskList from './components/TaskList'
import { Task } from './types'
import LocationOnIcon from '@mui/icons-material/LocationOn'
import { IconButton } from '@mui/material'

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#2196f3',
    },
    secondary: {
      main: '#f50057',
    },
  },
})

const AppContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100vw;
  background-color: #121212;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
`

const Header = styled.header`
  padding: 1rem;
  background-color: #1e1e1e;
  box-shadow: 0 2px 4px rgba(0,0,0,0.2);
  z-index: 1000;
`

const Title = styled.h1`
  margin: 0;
  color: #fff;
  font-size: 1.5rem;
  text-align: center;
`

const MainContent = styled.main`
  display: flex;
  flex: 1;
  overflow: hidden;
  position: relative;
  
  @media (max-width: 768px) {
    flex-direction: column;
  }
`

const MapContainer = styled.div`
  flex: 2;
  height: 100%;
  position: relative;
  
  @media (max-width: 768px) {
    height: 20vh;
    min-height: 150px;
  }
`

const TaskContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
  background-color: #1e1e1e;
  min-width: 300px;
  max-width: 400px;
  
  @media (max-width: 768px) {
    height: 50vh;
    max-width: none;
  }
`

const StyledIconButton = styled(IconButton)`
  position: absolute;
  top: 1rem;
  right: 1rem;
  z-index: 1000;
`

const tasks: Task[] = [
  {
    id: 1,
    title: "Lotnisko w Chrcynnie",
    description: "Znajdź się w pobliżu lotniska w Chrcynnie i wykonaj zadanie!",
    location: { lat: 52.573889, lng: 20.871667 },
    radius: 20000,
    completed: false,
    requirements: {
      type: 'code',
      description: "Znajdź kod na hangarze lotniska i wpisz go poniżej",
      validation: {
        code: "CHRCYNO2024"
      }
    },
    hint: "Kod znajduje się na głównym hangarze lotniska"
  },
  {
    id: 2,
    title: "Pałac Kultury i Nauki",
    description: "Znajdź się w pobliżu PKiN i wykonaj zadanie!",
    location: { lat: 52.231958, lng: 21.006725 },
    radius: 200,
    completed: false,
    requirements: {
      type: 'location',
      description: "Znajdź się dokładnie przy wejściu głównym do PKiN",
      validation: {
        exactLocation: { lat: 52.231958, lng: 21.006725 },
        exactLocationRadius: 10
      }
    },
    hint: "Wejście główne znajduje się od strony ulicy Marszałkowskiej"
  },
  {
    id: 3,
    title: "Łazienki Królewskie",
    description: "Odkryj piękno Łazienek Królewskich!",
    location: { lat: 52.215833, lng: 21.035833 },
    radius: 300,
    completed: false,
    requirements: {
      type: 'quiz',
      description: "Odpowiedz na pytanie o Pałacu na Wodzie",
      validation: {
        quizQuestion: "W którym roku rozpoczęto budowę Pałacu na Wodzie?",
        quizOptions: ["1764", "1772", "1784", "1792"],
        quizAnswer: "1772"
      }
    },
    hint: "Informacja znajduje się na tablicy informacyjnej przed pałacem"
  },
  {
    id: 4,
    title: "Stare Miasto",
    description: "Zwiedź historyczne Stare Miasto!",
    location: { lat: 52.249722, lng: 21.012222 },
    radius: 400,
    completed: false,
    requirements: {
      type: 'photo',
      description: "Zrób zdjęcie z Kolumną Zygmunta i Zamkiem Królewskim w tle",
      validation: {
        exactLocation: { lat: 52.249722, lng: 21.012222 },
        exactLocationRadius: 50
      }
    },
    hint: "Najlepszy widok jest z placu Zamkowego"
  },
  {
    id: 5,
    title: "Centrum Nauki Kopernik",
    description: "Odkryj naukowe ciekawostki w CNK!",
    location: { lat: 52.241667, lng: 21.028889 },
    radius: 250,
    completed: false,
    requirements: {
      type: 'code',
      description: "Znajdź kod na wahadle Foucault i wpisz go",
      validation: {
        code: "KOPERNIK2024"
      }
    },
    hint: "Kod znajduje się na tablicy informacyjnej przy wahadle"
  }
]

function App() {
  const [currentTasks, setCurrentTasks] = useState<Task[]>(tasks)
  const [userLocation, setUserLocation] = useState<google.maps.LatLngLiteral | null>(null)
  const mapRef = useRef<google.maps.Map | null>(null)

  const handleLocationUpdate = (location: google.maps.LatLngLiteral) => {
    setUserLocation(location)
  }

  const handleTaskComplete = (taskId: number) => {
    setCurrentTasks(tasks.map(task => 
      task.id === taskId ? { ...task, completed: true } : task
    ))
  }

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          handleLocationUpdate(location);
        },
        (error) => {
          console.error('Błąd geolokalizacji: ' + error.message);
        }
      );
    } else {
      console.error('Twoja przeglądarka nie wspiera geolokalizacji');
    }
  }, [handleLocationUpdate]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AppContainer>
        <Header>
          <Title>Warszawa Quest</Title>
        </Header>
        <MainContent>
          <MapContainer>
            <Map 
              tasks={currentTasks}
              userLocation={userLocation}
              onLocationUpdate={handleLocationUpdate}
              onTaskComplete={handleTaskComplete}
              mapRef={mapRef}
            />
          </MapContainer>
          <TaskContainer>
            <TaskList 
              tasks={currentTasks}
              userLocation={userLocation}
              onTaskComplete={handleTaskComplete}
            />
          </TaskContainer>
        </MainContent>
      </AppContainer>
    </ThemeProvider>
  )
}

export default App
