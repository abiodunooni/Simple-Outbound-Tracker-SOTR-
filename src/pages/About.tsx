import styled from 'styled-components'

const Container = styled.div`
  text-align: center;
  padding: 2rem;
`

const Title = styled.h1`
  color: #333;
  margin-bottom: 1rem;
`

const Content = styled.div`
  max-width: 600px;
  margin: 0 auto;
  color: #666;
  line-height: 1.6;
`

const About = () => {
  return (
    <Container>
      <Title>About</Title>
      <Content>
        <p>This is a demo React application showcasing the integration of:</p>
        <ul style={{ textAlign: 'left', marginTop: '1rem' }}>
          <li>Vite for fast development and building</li>
          <li>Styled Components for CSS-in-JS styling</li>
          <li>MobX for state management</li>
          <li>React Router for client-side routing</li>
        </ul>
      </Content>
    </Container>
  )
}

export default About