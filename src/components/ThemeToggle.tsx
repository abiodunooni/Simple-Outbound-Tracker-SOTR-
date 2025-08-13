import styled from 'styled-components';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../hooks/useTheme';

const ToggleButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border: none;
  border-radius: 8px;
  background: var(--background-secondary);
  color: var(--text-primary);
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: var(--background-hover);
  }

  svg {
    width: 20px;
    height: 20px;
  }
`;

export const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <ToggleButton onClick={toggleTheme} title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}>
      {theme === 'light' ? <Moon /> : <Sun />}
    </ToggleButton>
  );
};