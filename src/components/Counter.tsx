import { observer } from 'mobx-react-lite'
import styled from 'styled-components'
import { useStore } from '../context/StoreContext'

const CounterContainer = styled.div`
  text-align: center;
  padding: 2rem;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  background: #f8f9fa;
  margin: 2rem 0;
`

const CountDisplay = styled.div`
  font-size: 3rem;
  font-weight: bold;
  color: #007bff;
  margin: 1rem 0;
`

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-top: 1rem;
`

const Button = styled.button`
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &.primary {
    background: #007bff;
    color: white;
    
    &:hover {
      background: #0056b3;
    }
  }
  
  &.secondary {
    background: #6c757d;
    color: white;
    
    &:hover {
      background: #545b62;
    }
  }
  
  &.danger {
    background: #dc3545;
    color: white;
    
    &:hover {
      background: #c82333;
    }
  }
`

const Counter = observer(() => {
  const { counterStore } = useStore()

  return (
    <CounterContainer>
      <h3>MobX Counter Demo</h3>
      <CountDisplay>{counterStore.count}</CountDisplay>
      <ButtonGroup>
        <Button className="secondary" onClick={counterStore.decrement}>
          -
        </Button>
        <Button className="danger" onClick={counterStore.reset}>
          Reset
        </Button>
        <Button className="primary" onClick={counterStore.increment}>
          +
        </Button>
      </ButtonGroup>
    </CounterContainer>
  )
})

export default Counter