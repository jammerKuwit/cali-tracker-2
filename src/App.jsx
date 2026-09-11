import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { DataProvider } from './context/DataContext'
import Layout from './components/Layout'
import Home from './pages/Home'
import Log from './pages/Log'
import History from './pages/History'
import CalendarPage from './pages/Calendar'
import Progress from './pages/Progress'
import Library from './pages/Library'
import Templates from './pages/Templates'
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
            <Route path="history" element={<History />} />
            <Route path="calendar" element={<CalendarPage />} />
            <Route path="progress" element={<Progress />} />
            <Route path="library" element={<Library />} />
            <Route path="templates" element={<Templates />} />
            <Route path="workout/:id" element={<WorkoutDetail />} />
            <Route path="workout/:id/edit" element={<EditWorkout />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </DataProvider>
    </BrowserRouter>
  )
}
