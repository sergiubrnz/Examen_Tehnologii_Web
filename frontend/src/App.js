import Container from './layout/Container';
import { Routes, Route, Navigate } from 'react-router-dom';
import SpacecraftsTable from './pages/Spacecrafts';
import AstronautsTable from './pages/Astronauts';

function App() {
  return (
    <Container>
      <Routes>
        <Route path='/spacecrafts' element={<SpacecraftsTable/>}/>
        <Route path='/astronauts' element={<AstronautsTable/>}/>
        <Route path='/*' element={<SpacecraftsTable/>}/>
      </Routes>
    </Container>
  );
}

export default App;
