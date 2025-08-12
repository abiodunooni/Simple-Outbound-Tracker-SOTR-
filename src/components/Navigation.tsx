import { Link, useLocation } from 'react-router-dom'
import styled from 'styled-components'

const Nav = styled.nav`
  background: #f8f9fa;
  padding: 1rem 2rem;
  border-bottom: 1px solid #e9ecef;
`

const NavList = styled.ul`
  list-style: none;
  display: flex;
  gap: 2rem;
  margin: 0;
  padding: 0;
`

const NavItem = styled.li`
  /* No styles needed */
`

const NavLink = styled(Link)<{ $active: boolean }>`
  text-decoration: none;
  color: ${props => props.$active ? '#007bff' : '#495057'};
  font-weight: ${props => props.$active ? 'bold' : 'normal'};
  padding: 0.5rem 1rem;
  border-radius: 4px;
  transition: all 0.2s ease;

  &:hover {
    background: #e9ecef;
    color: #007bff;
  }
`

const Navigation = () => {
  const location = useLocation()

  return (
    <Nav>
      <NavList>
        <NavItem>
          <NavLink to="/" $active={location.pathname === '/'}>
            Home
          </NavLink>
        </NavItem>
        <NavItem>
          <NavLink to="/about" $active={location.pathname === '/about'}>
            About
          </NavLink>
        </NavItem>
      </NavList>
    </Nav>
  )
}

export default Navigation