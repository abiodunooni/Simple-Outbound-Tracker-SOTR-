import styled from 'styled-components'
import Counter from '../components/Counter'

const Container = styled.div`
  text-align: center;
  padding: 2rem;
`

const Title = styled.h1`
  color: #333;
  margin-bottom: 1rem;
`

const Subtitle = styled.p`
  color: #666;
  font-size: 1.1rem;
  margin-bottom: 2rem;
`

const Home = () => {
  return (
    <Container>
      <Title>Welcome to Quidax Demo</Title>
      <Subtitle>A React app built with Vite, styled-components, MobX, and React Router</Subtitle>
      <Counter />
    </Container>
  )
}

export default Home