import React, { useState, useEffect, useRef } from 'react';

const SearchBar = ({
  placeholder = "Search doctors, hospitals, specialties...",
  onSearch,
  onSuggestionSelect,
  showSuggestions = true,
  showFilters = true,
  showVoiceSearch = false,
  debounceMs = 300,
  searchType = 'all', // all, doctors, hospitals, specialties
  size = 'medium', // small, medium, large
  variant = 'default', // default, minimal, prominent
  initialValue = '',
  isLoading = false,
  autoFocus = false
}) => {
  const [searchTerm, setSearchTerm] = useState(initialValue);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestionsList, setShowSuggestionsList] = useState(false);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);
  const [isSearching, setIsSearching] = useState(false);
  const [recentSearches, setRecentSearches] = useState([]);
  const [isListening, setIsListening] = useState(false);

  const searchInputRef = useRef(null);
  const suggestionListRef = useRef(null);
  const debounceRef = useRef(null);

  // Size configurations
  const sizeConfig = {
    small: {
      height: '36px',
      fontSize: '14px',
      padding: '8px 12px',
      iconSize: '16px'
    },
    medium: {
      height: '44px',
      fontSize: '16px',
      padding: '12px 16px',
      iconSize: '20px'
    },
    large: {
      height: '52px',
      fontSize: '18px',
      padding: '14px 20px',
      iconSize: '24px'
    }
  };

  const config = sizeConfig[size];

  // Variant styles
  const getVariantStyles = () => {
    const baseStyles = {
      border: '1px solid #ddd',
      borderRadius: '8px',
      backgroundColor: '#fff'
    };

    switch (variant) {
      case 'minimal':
        return {
          ...baseStyles,
          border: 'none',
          borderBottom: '2px solid #e9ecef',
          borderRadius: '0',
          backgroundColor: 'transparent'
        };
      case 'prominent':
        return {
          ...baseStyles,
          border: '2px solid #3498db',
          borderRadius: '12px',
          boxShadow: '0 4px 12px rgba(52, 152, 219, 0.15)'
        };
      default:
        return baseStyles;
    }
  };

  useEffect(() => {
    if (autoFocus && searchInputRef.current) {
      searchInputRef.current.focus();
    }
    loadRecentSearches();
  }, []);

  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (searchTerm.trim()) {
      debounceRef.current = setTimeout(() => {
        fetchSuggestions(searchTerm);
      }, debounceMs);
    } else {
      setSuggestions([]);
      setShowSuggestionsList(false);
    }

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [searchTerm, debounceMs]);

  // Load recent searches from localStorage
  const loadRecentSearches = () => {
    try {
      const recent = localStorage.getItem('medi-link-recent-searches');
      if (recent) {
        setRecentSearches(JSON.parse(recent));
      }
    } catch (error) {
      console.error('Error loading recent searches:', error);
    }
  };

  // Save search to recent searches
  const saveToRecentSearches = (term) => {
    try {
      const updated = [term, ...recentSearches.filter(s => s !== term)].slice(0, 5);
      setRecentSearches(updated);
      localStorage.setItem('medi-link-recent-searches', JSON.stringify(updated));
    } catch (error) {
      console.error('Error saving recent search:', error);
    }
  };

  // Fetch search suggestions
  const fetchSuggestions = async (query) => {
    if (!showSuggestions) return;

    setIsSearching(true);
    try {
      const response = await fetch(`/api/search/suggestions?q=${encodeURIComponent(query)}&type=${searchType}`);
      const data = await response.json();
      setSuggestions(data.suggestions || []);
      setShowSuggestionsList(true);
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      // Fallback to mock suggestions
      generateMockSuggestions(query);
    } finally {
      setIsSearching(false);
    }
  };

  // Generate mock suggestions for development
  const generateMockSuggestions = (query) => {
    const mockSuggestions = [
      {
        type: 'doctor',
        id: '1',
        title: 'Dr. Sarah Johnson',
        subtitle: 'Cardiologist • City Hospital',
        avatar: '/api/placeholder/40/40',
        rating: 4.8
      },
      {
        type: 'hospital',
        id: '2',
        title: 'Nairobi Hospital',
        subtitle: 'General Hospital • 2.3 km away',
        icon: '🏥',
        rating: 4.5
      },
      {
        type: 'specialty',
        id: '3',
        title: 'Cardiology',
        subtitle: '124 doctors available',
        icon: '❤️'
      },
      {
        type: 'service',
        id: '4',
        title: 'Emergency Services',
        subtitle: '24/7 availability',
        icon: '🚑'
      }
    ].filter(item => 
      item.title.toLowerCase().includes(query.toLowerCase()) ||
      item.subtitle.toLowerCase().includes(query.toLowerCase())
    );

    setSuggestions(mockSuggestions);
    setShowSuggestionsList(true);
  };

  // Handle input change
  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    setSelectedSuggestionIndex(-1);
  };

  // Handle search submission
  const handleSearch = (term = searchTerm) => {
    if (!term.trim()) return;

    const searchQuery = term.trim();
    saveToRecentSearches(searchQuery);
    setShowSuggestionsList(false);
    
    if (onSearch) {
      onSearch(searchQuery, searchType);
    }
  };

  // Handle suggestion selection
  const handleSuggestionSelect = (suggestion) => {
    setSearchTerm(suggestion.title);
    setShowSuggestionsList(false);
    saveToRecentSearches(suggestion.title);
    
    if (onSuggestionSelect) {
      onSuggestionSelect(suggestion);
    } else if (onSearch) {
      onSearch(suggestion.title, suggestion.type);
    }
  };

  // Handle keyboard navigation
  const handleKeyDown = (e) => {
    if (!showSuggestionsList || suggestions.length === 0) {
      if (e.key === 'Enter') {
        handleSearch();
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedSuggestionIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedSuggestionIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedSuggestionIndex >= 0) {
          handleSuggestionSelect(suggestions[selectedSuggestionIndex]);
        } else {
          handleSearch();
        }
        break;
      case 'Escape':
        setShowSuggestionsList(false);
        setSelectedSuggestionIndex(-1);
        break;
    }
  };

  // Voice search functionality
  const handleVoiceSearch = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Voice search is not supported in your browser');
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setSearchTerm(transcript);
      handleSearch(transcript);
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  // Clear search
  const clearSearch = () => {
    setSearchTerm('');
    setSuggestions([]);
    setShowSuggestionsList(false);
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  };

  // Handle focus
  const handleFocus = () => {
    if (searchTerm.trim() && suggestions.length > 0) {
      setShowSuggestionsList(true);
    } else if (!searchTerm.trim() && recentSearches.length > 0) {
      setShowSuggestionsList(true);
    }
  };

  // Handle blur with delay to allow click on suggestions
  const handleBlur = () => {
    setTimeout(() => {
      setShowSuggestionsList(false);
      setSelectedSuggestionIndex(-1);
    }, 200);
  };

  // Get suggestion icon
  const getSuggestionIcon = (suggestion) => {
    if (suggestion.avatar) {
      return (
        <img 
          src={suggestion.avatar} 
          alt="" 
          style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            objectFit: 'cover'
          }}
        />
      );
    }
    
    if (suggestion.icon) {
      return (
        <div style={{
          width: '32px',
          height: '32px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '18px'
        }}>
          {suggestion.icon}
        </div>
      );
    }

    const typeIcons = {
      doctor: '👨‍⚕️',
      hospital: '🏥',
      specialty: '🩺',
      service: '🔬'
    };

    return (
      <div style={{
        width: '32px',
        height: '32px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '18px'
      }}>
        {typeIcons[suggestion.type] || '🔍'}
      </div>
    );
  };

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      {/* Search Input */}
      <div style={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        ...getVariantStyles()
      }}>
        {/* Search Icon */}
        <div style={{
          position: 'absolute',
          left: config.padding.split(' ')[1],
          display: 'flex',
          alignItems: 'center',
          color: '#95a5a6',
          fontSize: config.iconSize
        }}>
          {isSearching || isLoading ? (
            <div style={{
              width: config.iconSize,
              height: config.iconSize,
              border: `2px solid #ddd`,
              borderTop: `2px solid #3498db`,
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }} />
          ) : (
            '🔍'
          )}
        </div>

        {/* Input Field */}
        <input
          ref={searchInputRef}
          type="text"
          value={searchTerm}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          style={{
            width: '100%',
            height: config.height,
            padding: config.padding,
            paddingLeft: `calc(${config.padding.split(' ')[1]} + ${config.iconSize} + 10px)`,
            paddingRight: showVoiceSearch || searchTerm ? 'calc(60px + 10px)' : config.padding.split(' ')[1],
            border: 'none',
            outline: 'none',
            fontSize: config.fontSize,
            backgroundColor: 'transparent',
            fontFamily: 'inherit'
          }}
        />

        {/* Right Actions */}
        <div style={{
          position: 'absolute',
          right: config.padding.split(' ')[1],
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          {/* Clear Button */}
          {searchTerm && (
            <button
              onClick={clearSearch}
              style={{
                background: 'none',
                border: 'none',
                color: '#95a5a6',
                cursor: 'pointer',
                fontSize: config.iconSize,
                padding: '2px',
                display: 'flex',
                alignItems: 'center'
              }}
              title="Clear search"
            >
              ✕
            </button>
          )}

          {/* Voice Search */}
          {showVoiceSearch && (
            <button
              onClick={handleVoiceSearch}
              disabled={isListening}
              style={{
                background: 'none',
                border: 'none',
                color: isListening ? '#e74c3c' : '#95a5a6',
                cursor: 'pointer',
                fontSize: config.iconSize,
                padding: '2px',
                display: 'flex',
                alignItems: 'center'
              }}
              title="Voice search"
            >
              🎤
            </button>
          )}

          {/* Search Button */}
          <button
            onClick={() => handleSearch()}
            disabled={!searchTerm.trim() || isLoading}
            style={{
              background: searchTerm.trim() ? '#3498db' : '#bdc3c7',
              border: 'none',
              color: 'white',
              cursor: searchTerm.trim() ? 'pointer' : 'not-allowed',
              fontSize: '12px',
              padding: '6px 12px',
              borderRadius: '4px',
              fontWeight: '600'
            }}
          >
            Search
          </button>
        </div>
      </div>

      {/* Suggestions Dropdown */}
      {showSuggestionsList && (
        <div
          ref={suggestionListRef}
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            backgroundColor: 'white',
            border: '1px solid #e9ecef',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            zIndex: 1000,
            marginTop: '4px',
            maxHeight: '300px',
            overflowY: 'auto'
          }}
        >
          {/* Recent Searches */}
          {!searchTerm.trim() && recentSearches.length > 0 && (
            <div>
              <div style={{
                padding: '12px 16px 8px',
                fontSize: '12px',
                color: '#95a5a6',
                fontWeight: '600',
                borderBottom: '1px solid #f1f3f4'
              }}>
                Recent Searches
              </div>
              {recentSearches.map((recent, index) => (
                <div
                  key={`recent-${index}`}
                  onClick={() => handleSearch(recent)}
                  style={{
                    padding: '12px 16px',
                    cursor: 'pointer',
                    borderBottom: index < recentSearches.length - 1 ? '1px solid #f8f9fa' : 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    transition: 'background-color 0.2s ease'
                  }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = '#f8f9fa'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = 'white'}
                >
                  <span style={{ color: '#95a5a6', fontSize: '14px' }}>🕒</span>
                  <span style={{ fontSize: '14px', color: '#495057' }}>{recent}</span>
                </div>
              ))}
            </div>
          )}

          {/* Search Suggestions */}
          {suggestions.length > 0 && (
            <div>
              {!searchTerm.trim() && recentSearches.length > 0 && (
                <div style={{
                  padding: '8px 16px 8px',
                  fontSize: '12px',
                  color: '#95a5a6',
                  fontWeight: '600',
                  borderBottom: '1px solid #f1f3f4'
                }}>
                  Suggestions
                </div>
              )}
              {suggestions.map((suggestion, index) => (
                <div
                  key={suggestion.id}
                  onClick={() => handleSuggestionSelect(suggestion)}
                  style={{
                    padding: '12px 16px',
                    cursor: 'pointer',
                    backgroundColor: selectedSuggestionIndex === index ? '#f8f9fa' : 'white',
                    borderBottom: index < suggestions.length - 1 ? '1px solid #f8f9fa' : 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    transition: 'background-color 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    if (selectedSuggestionIndex !== index) {
                      e.target.style.backgroundColor = '#f8f9fa';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (selectedSuggestionIndex !== index) {
                      e.target.style.backgroundColor = 'white';
                    }
                  }}
                >
                  {getSuggestionIcon(suggestion)}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ 
                      fontSize: '14px', 
                      color: '#2c3e50',
                      fontWeight: '500',
                      marginBottom: '2px'
                    }}>
                      {suggestion.title}
                    </div>
                    <div style={{ 
                      fontSize: '12px', 
                      color: '#7f8c8d',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}>
                      {suggestion.subtitle}
                      {suggestion.rating && (
                        <span style={{ color: '#f39c12' }}>
                          ⭐ {suggestion.rating}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* No Results */}
          {searchTerm.trim() && suggestions.length === 0 && !isSearching && (
            <div style={{
              padding: '20px',
              textAlign: 'center',
              color: '#95a5a6',
              fontSize: '14px'
            }}>
              No suggestions found for "{searchTerm}"
            </div>
          )}
        </div>
      )}

      {/* CSS for loading animation */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default SearchBar;