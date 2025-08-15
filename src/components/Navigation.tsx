import { Link, useLocation } from "react-router-dom";
import styled from "styled-components";
import {
  Users,
  Building2,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  Target,
} from "lucide-react";
import React, { useCallback } from "react";
import { useSidebar } from "../context/SidebarContext";
import { ThemeToggle } from "./ThemeToggle";

const Sidebar = styled.nav<{
  width: number;
  $isCollapsed: boolean;
  $isHovered: boolean;
  $isPinned: boolean;
}>`
  position: fixed;
  left: 0;
  top: 0;
  bottom: 0;
  width: ${(props) => {
    if (props.$isCollapsed && !props.$isHovered) return "0px";
    return `${props.width}px`;
  }};
  background: var(--background-primary);
  border-right: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
  z-index: 100;
  padding-top: 24px;
  user-select: none;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  transform: ${(props) => {
    if (props.$isCollapsed && !props.$isHovered) return "translateX(-100%)";
    return "translateX(0)";
  }};
  box-shadow: ${(props) => {
    if (props.$isCollapsed && props.$isHovered)
      return "4px 0 12px rgba(0, 0, 0, 0.15)";
    return "none";
  }};
`;

const UserSection = styled.div`
  padding: 12px 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin: 0 16px;
  position: relative;
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const UserAvatar = styled.div`
  width: 24px;
  height: 24px;
  background: linear-gradient(135deg, #10b981, #059669);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  font-size: 11px;
`;

const UserName = styled.div`
  font-weight: 600;
  color: var(--text-primary);
  font-size: 14px;
`;

const NavSection = styled.div`
  flex: 1;
  padding: 24px 0;
`;

const NavList = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
`;

const NavItem = styled.li`
  margin-bottom: 2px;
`;


const NavIcon = styled.span`
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const SubNavList = styled.ul<{ $isOpen: boolean }>`
  list-style: none;
  margin: 0;
  padding: 0;
  max-height: ${(props) => (props.$isOpen ? "200px" : "0")};
  overflow: hidden;
  transition: max-height 0.3s ease;
`;

const SubNavItem = styled.li`
  margin-bottom: 1px;
`;

const SubNavLink = styled(Link)<{ $active: boolean }>`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 24px 10px 56px;
  margin: 0 16px;
  text-decoration: none;
  color: ${(props) =>
    props.$active ? "var(--text-primary)" : "var(--text-secondary)"};
  font-weight: ${(props) => (props.$active ? "600" : "400")};
  font-size: 13px;
  border-radius: 6px;
  transition: all 0.2s ease;
  background: ${(props) =>
    props.$active ? "var(--background-hover)" : "transparent"};

  &:hover {
    background: var(--background-hover);
    color: var(--text-primary);
  }
`;

const NavButton = styled.button<{ $active: boolean; $hasChildren: boolean }>`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 24px;
  margin: 0 16px;
  text-decoration: none;
  color: ${(props) =>
    props.$active ? "var(--text-primary)" : "var(--text-secondary)"};
  font-weight: ${(props) => (props.$active ? "600" : "500")};
  font-size: 14px;
  border-radius: 8px;
  transition: all 0.2s ease;
  background: ${(props) =>
    props.$active ? "var(--background-hover)" : "transparent"};
  border: none;
  width: calc(100% - 32px);
  cursor: pointer;
  justify-content: ${(props) =>
    props.$hasChildren ? "space-between" : "flex-start"};

  &:hover {
    background: var(--background-hover);
    color: var(--text-primary);
  }
`;

const ChevronIcon = styled.span<{ $isOpen: boolean }>`
  transition: transform 0.2s ease;
  transform: ${(props) => (props.$isOpen ? "rotate(180deg)" : "rotate(0deg)")};
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ResizeHandle = styled.div`
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  width: 4px;
  cursor: col-resize;
  background: transparent;
  z-index: 101;

  &:hover {
    background: #e5e7eb;
  }
`;

const CollapseButton = styled.button<{ $isCollapsed: boolean }>`
  position: ${(props) => (props.$isCollapsed ? "fixed" : "absolute")};
  top: ${(props) => (props.$isCollapsed ? "24px" : "35px")};
  right: ${(props) => (props.$isCollapsed ? "auto" : "24px")};
  left: ${(props) => (props.$isCollapsed ? "12px" : "auto")};
  background: ${(props) =>
    props.$isCollapsed ? "var(--background-primary)" : "none"};
  border: ${(props) =>
    props.$isCollapsed ? "1px solid var(--border-color)" : "none"};
  padding: ${(props) => (props.$isCollapsed ? "6px" : "4px")};
  cursor: pointer;
  color: var(--text-secondary);
  border-radius: ${(props) => (props.$isCollapsed ? "6px" : "4px")};
  transition: all 0.2s;
  z-index: 102;
  box-shadow: ${(props) =>
    props.$isCollapsed ? "0 2px 8px rgba(0, 0, 0, 0.1)" : "none"};

  &:hover {
    background: ${(props) =>
      props.$isCollapsed
        ? "var(--background-hover)"
        : "var(--background-hover)"};
    color: var(--text-primary);
    border-color: ${(props) =>
      props.$isCollapsed ? "var(--border-hover)" : "transparent"};
  }
`;

const Navigation = () => {
  const location = useLocation();
  const {
    sidebarWidth,
    setSidebarWidth,
    isCollapsed,
    setIsCollapsed,
    isHovered,
    isPinned,
    setIsPinned,
  } = useSidebar();
  const [isResizing, setIsResizing] = React.useState(false);
  const [isProspectsOpen, setIsProspectsOpen] = React.useState(
    location.pathname === "/leads" || location.pathname === "/companies"
  );

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (isCollapsed) return;
      e.preventDefault();
      setIsResizing(true);
    },
    [isCollapsed]
  );

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isResizing) return;

      const newWidth = e.clientX;
      if (newWidth >= 200 && newWidth <= 300) {
        setSidebarWidth(newWidth);
      }
    },
    [isResizing, setSidebarWidth]
  );

  const handleToggleCollapse = useCallback(() => {
    const newCollapsed = !isCollapsed;
    setIsCollapsed(newCollapsed);
    if (!newCollapsed) {
      setIsPinned(true);
    } else {
      setIsPinned(false);
    }
  }, [isCollapsed, setIsCollapsed, setIsPinned]);

  const handleMouseUp = useCallback(() => {
    setIsResizing(false);
  }, []);

  React.useEffect(() => {
    if (isResizing) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      return () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [isResizing, handleMouseMove, handleMouseUp]);

  const prospectsSubItems = [
    { path: "/leads", label: "Leads", icon: Users },
    { path: "/companies", label: "Companies", icon: Building2 },
  ];

  const isProspectsActive = location.pathname === "/leads" || location.pathname === "/companies";

  React.useEffect(() => {
    if (isProspectsActive && !isProspectsOpen) {
      setIsProspectsOpen(true);
    }
  }, [isProspectsActive, isProspectsOpen]);

  return (
    <Sidebar
      width={sidebarWidth}
      $isCollapsed={isCollapsed}
      $isHovered={isHovered}
      $isPinned={isPinned}
    >
      <UserSection>
        <UserInfo>
          <UserAvatar>S</UserAvatar>
          <UserName>Sammy</UserName>
        </UserInfo>
        <ThemeToggle />
      </UserSection>

      <NavSection>
        <NavList>
          <NavItem>
            <NavButton
              $active={isProspectsActive}
              $hasChildren={true}
              onClick={() => setIsProspectsOpen(!isProspectsOpen)}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <NavIcon>
                  <Target size={20} />
                </NavIcon>
                Prospects
              </div>
              <ChevronIcon $isOpen={isProspectsOpen}>
                <ChevronDown size={16} />
              </ChevronIcon>
            </NavButton>
            <SubNavList $isOpen={isProspectsOpen}>
              {prospectsSubItems.map((item) => (
                <SubNavItem key={item.path}>
                  <SubNavLink to={item.path} $active={location.pathname === item.path}>
                    <NavIcon>
                      <item.icon size={16} />
                    </NavIcon>
                    {item.label}
                  </SubNavLink>
                </SubNavItem>
              ))}
            </SubNavList>
          </NavItem>
        </NavList>
      </NavSection>
      <CollapseButton $isCollapsed={isCollapsed} onClick={handleToggleCollapse}>
        {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
      </CollapseButton>
      {(!isCollapsed || isHovered) && (
        <ResizeHandle onMouseDown={handleMouseDown} />
      )}
    </Sidebar>
  );
};

export default Navigation;
