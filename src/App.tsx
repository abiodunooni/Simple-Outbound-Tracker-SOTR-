import { Routes, Route } from 'react-router-dom'
import styled from 'styled-components'
import Navigation from './components/Navigation'
import Home from './pages/Home'
import About from './pages/About'

const AppContainer = styled.div`
  min-height: 100vh;
  background: #ffffff;
`

const MainContent = styled.main`
  padding: 2rem;
`

function App() {
  return (
    <AppContainer>
      <Navigation />
      <MainContent>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
        </Routes>
      </MainContent>
    </AppContainer>
  )
}

export default App
