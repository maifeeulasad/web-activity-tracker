import { useState, useEffect } from 'react';

// Hook to detect responsive breakpoints and popup mode
export const useResponsive = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [isPopupMode, setIsPopupMode] = useState(false);

  useEffect(() => {
    const checkResponsive = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      // Detect mobile (phones)
      setIsMobile(width < 768);
      
      // Detect tablet
      setIsTablet(width >= 768 && width < 1024);
      
      // Detect popup mode - smaller windows or extension context
      const isSmallScreen = width < 600 || height < 500;
      const isExtensionContext = typeof chrome !== 'undefined' && !!chrome.runtime;

      setIsPopupMode(isSmallScreen || isExtensionContext);
    };

    checkResponsive();
    window.addEventListener('resize', checkResponsive);
    
    return () => window.removeEventListener('resize', checkResponsive);
  }, []);

  return {
    isMobile,
    isTablet,
    isPopupMode,
    isDesktop: !isMobile && !isTablet,
    breakpoints: {
      xs: window.innerWidth < 576,
      sm: window.innerWidth >= 576 && window.innerWidth < 768,
      md: window.innerWidth >= 768 && window.innerWidth < 992,
      lg: window.innerWidth >= 992 && window.innerWidth < 1200,
      xl: window.innerWidth >= 1200,
    }
  };
};

// Hook to get responsive props for components
export const useResponsiveProps = () => {
  const { isMobile, isTablet, isPopupMode } = useResponsive();
  
  const getSpacing = () => {
    if (isPopupMode) return { gutterX: 8, gutterY: 8, marginBottom: 12 };
    if (isMobile) return { gutterX: 12, gutterY: 12, marginBottom: 16 };
    return { gutterX: 16, gutterY: 16, marginBottom: 24 };
  };
  
  const getFontSizes = () => {
    if (isPopupMode) return { 
      title: '14px', 
      body: '12px', 
      small: '10px',
      icon: '14px' 
    };
    if (isMobile) return { 
      title: '16px', 
      body: '14px', 
      small: '12px',
      icon: '16px' 
    };
    return { 
      title: '18px', 
      body: '16px', 
      small: '14px',
      icon: '18px' 
    };
  };
  
  const getCardProps = () => {
    if (isPopupMode) return { 
      bodyStyle: { padding: '8px' },
      minHeight: '80px'
    };
    if (isMobile) return { 
      bodyStyle: { padding: '12px' },
      minHeight: '100px'
    };
    return { 
      bodyStyle: { padding: '16px' },
      minHeight: 'auto'
    };
  };
  
  return {
    isMobile,
    isTablet,
    isPopupMode,
    spacing: getSpacing(),
    fonts: getFontSizes(),
    card: getCardProps(),
  };
};