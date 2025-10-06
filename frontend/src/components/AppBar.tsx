import {
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  Switch,
} from '@heroui/react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';


export function AppBar() {
  const { theme, toggleTheme } = useTheme();

  return (
    <Navbar isBordered maxWidth="full" className="bg-background dark:bg-dark-background border-b border-border dark:border-dark-border py-2">
      <NavbarBrand>
        <div className="flex items-center gap-3">
          <img 
            src={theme === 'dark' ? '/assets/images/logo1-dark.svg' : '/assets/images/logo1-light.svg'}
            alt="Exoplanet Analyzer Logo" 
            className="h-14 w-auto"
          />
        </div>
      </NavbarBrand>
      <NavbarContent justify="end">
        <NavbarItem>
          <div className="flex items-center gap-2">
            <Switch
              isSelected={theme === 'dark'}
              onValueChange={toggleTheme}
              size="sm"
              color="primary"
              thumbIcon={({ isSelected, className }) =>
                isSelected ? <Moon className={className} /> : <Sun className={className} />
              }
            />
          </div>
        </NavbarItem>
        {/* <NavbarItem>
          <Dropdown>
            <DropdownTrigger>
              <Button 
                variant="light" 
                className="text-primary-text dark:text-dark-primary-text border-accent dark:border-dark-accent hover:bg-accent-hover dark:hover:bg-dark-accent-hover hover:text-white"
                endContent={<ChevronDown size={16} />}
              >
                John Doe
              </Button>
            </DropdownTrigger>
            <DropdownMenu variant="light" color="primary" aria-label="User menu">
              <DropdownItem key="logout" color="danger">
                Logout
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
        </NavbarItem> */}
      </NavbarContent>
    </Navbar>
  );
}

