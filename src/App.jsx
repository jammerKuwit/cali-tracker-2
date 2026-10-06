import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { DataProvider } from './context/DataContext'
import Layout from './components/Layout'
import Home from './pages/Home'
import Log from './pages/Log'
import CalendarPage from './pages/Calendar'
import Progress from './pages/Progress'
import Exercises from './pages/Exercises'
import WorkoutDetail from './pages/WorkoutDetail'
import EditWorkout from './pages/EditWorkout'

export default function App() {
  return (
    <BrowserRouter>
      <DataProvider>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="log" element={<Log />} />
            <Route path="calendar" element={<CalendarPage />} />
            <Route path="progress" element={<Progress />} />
            <Route path="exercises" element={<Exercises />} />
            <Route path="library" element={<Navigate to="/exercises" replace />} />
            <Route path="templates" element={<Navigate to="/exercises" replace />} />
            <Route path="workout/:id" element={<WorkoutDetail />} />
            <Route path="workout/:id/edit" element={<EditWorkout />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </DataProvider>
    </BrowserRouter>
  )
}
