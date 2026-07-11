import { DataProvider } from './data/DataContext'
import AppShell from './components/AppShell'

export default function App() {
  return (
    <DataProvider>
      <AppShell />
    </DataProvider>
  )
}
