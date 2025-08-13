import { Outlet } from "react-router-dom";
import styled from "styled-components";
import Navigation from "./Navigation";
import { useSidebar } from "../context/SidebarContext";

const AppContainer = styled.div`
  min-height: 100vh;
  background: var(--background-primary);
  display: flex;
  transition: background 0.3s ease;
`;

const MainContent = styled.main<{
  $sidebarWidth: number;
  $isCollapsed: boolean;
}>`
  flex: 1;
  margin-left: ${(props) => {
    if (props.$isCollapsed) return "0px";
    return `${props.$sidebarWidth}px`;
  }};
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  transition: margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1);
`;

const ContentArea = styled.div`
  flex: 1;
  padding: 32px;
  overflow-y: auto;
  position: relative;
`;

export const Layout = () => {
  const { sidebarWidth, isCollapsed } = useSidebar();

  return (
    <AppContainer>
      <Navigation />
      <MainContent $sidebarWidth={sidebarWidth} $isCollapsed={isCollapsed}>
        <ContentArea>
          <Outlet />
        </ContentArea>
      </MainContent>
    </AppContainer>
  );
};
