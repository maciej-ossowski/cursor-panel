"use client";
import { useState, useRef, useEffect } from "react";
import { Responsive, WidthProvider } from "react-grid-layout";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import { toast, Toaster } from 'react-hot-toast';

const ResponsiveGridLayout = WidthProvider(Responsive);

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

// Dummy data mimicking the screenshot's time series data
const generateDummyData = () => {
  const timestamps = [];
  const datasets = [
    { label: 'FulfillmentWebhookController', data: [], backgroundColor: '#8884d8' },
    { label: 'AuthenticationController1', data: [], backgroundColor: '#82ca9d' },
    { label: 'AuthenticationController2', data: [], backgroundColor: '#ffc658' },
    { label: 'PaymentChannelController', data: [], backgroundColor: '#ff7300' },
    { label: 'CustomerController', data: [], backgroundColor: '#a4de6c' },
    { label: 'CustomerPaymentCredit', data: [], backgroundColor: '#d0ed57' }
  ];

  for (let i = 0; i < 12; i++) {
    const timestamp = new Date(2024, 1, 13, 12, i * 5).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
    timestamps.push(timestamp);
    
    datasets.forEach(dataset => {
      dataset.data.push(Math.floor(Math.random() * 10));
    });
  }

  return {
    labels: timestamps,
    datasets: datasets
  };
};

// Add Modal component
const CreatePanelModal = ({ isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    sourceUrl: '',
    type: 'chart' // Default to chart
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
    setFormData({ title: '', description: '', sourceUrl: '', type: 'chart' }); // Reset form
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg w-full max-w-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Create New Panel</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Source URL
            </label>
            <input
              type="url"
              name="sourceUrl"
              value={formData.sourceUrl}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Panel Type
            </label>
            <select
              name="type"
              value={formData.type}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="chart">Chart</option>
              <option value="count">Count</option>
            </select>
          </div>
          
          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Create Panel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default function Home() {
  const [timeRange, setTimeRange] = useState("Last 30 minutes");
  const [panelsData, setPanelsData] = useState({
    'chart_1': generateDummyData(),
    'count_1': {
      value: 468,
      increase: 12.5
    }
  });
  const [layout, setLayout] = useState({
    lg: [
      { i: 'chart_1', x: 0, y: 0, w: 6, h: 6 },
      { i: 'count_1', x: 6, y: 0, w: 6, h: 6 },
    ]
  });
  const [openMenuId, setOpenMenuId] = useState(null);
  const menuRef = useRef(null);
  const [activePanel, setActivePanel] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  // First, add panel metadata to the state
  const [panelMetadata, setPanelMetadata] = useState({
    'chart_1': {
      title: "API001: SerializationFailedException",
      description: "Last 30 minutes data"
    },
    'count_1': {
      title: "Count of Records",
      description: "Total records in the system"
    }
  });

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpenMenuId(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Function to generate unique panel ID
  const generatePanelId = (baseType) => {
    const min = 1000000;
    const max = 999999999;
    let newId;
    
    // Keep generating until we find a unique ID
    do {
      newId = Math.floor(Math.random() * (max - min + 1)) + min;
    } while (layout.lg.some(item => item.i === `${baseType}_${newId}`));
    
    return `${baseType}_${newId}`;
  };

  // Handle panel actions
  const handleClonePanel = (panelId) => {
    // Get panel type from the ID (chart or count)
    const panelType = panelId.includes('chart') ? 'chart' : 'count';
    const newPanelId = `${panelType}_${Math.floor(Math.random() * (999999999 - 1000000) + 1000000)}`;
    const existingPanel = layout.lg.find(item => item.i === panelId);
    
    if (existingPanel) {
      const maxY = Math.max(...layout.lg.map(item => item.y));
      
      // Clone the panel's data
      if (panelType === 'chart') {
        // Generate new data for chart panel
        const newChartData = generateDummyData();
        setPanelsData(prev => ({
          ...prev,
          [newPanelId]: newChartData
        }));
      } else {
        setPanelsData(prev => ({
          ...prev,
          [newPanelId]: {
            value: Math.floor(Math.random() * 1000),
            increase: +(Math.random() * 20).toFixed(1)
          }
        }));
      }
      
      // Update layout with new panel
      setLayout(prev => ({
        ...prev,
        lg: [
          ...prev.lg,
          { 
            ...existingPanel, 
            i: newPanelId, 
            y: maxY + 4,
            x: 0
          }
        ]
      }));

      // Show success toast
      toast.success('Panel cloned successfully', {
        duration: 2000,
        style: {
          background: '#10B981',
          color: '#FFFFFF',
        },
      });
    }
    setOpenMenuId(null);
  };

  const handleDeletePanel = (panelId) => {
    // Don't allow deletion of initial panels (chart_1 and count_1)
    if (panelId === 'chart_1' || panelId === 'count_1') {
      setOpenMenuId(null);
      // Show error toast for protected panels
      toast.error('Cannot delete default panels', {
        duration: 2000,
        style: {
          background: '#EF4444',
          color: '#FFFFFF',
        },
      });
      return;
    }

    // First close the menu
    setOpenMenuId(null);

    // Then update the states with a slight delay to ensure menu closing animation completes
    setTimeout(() => {
      try {
        // Remove panel from layout
        setLayout(prev => ({
          ...prev,
          lg: prev.lg.filter(item => item.i !== panelId)
        }));
        
        // Clean up panel data
        setPanelsData(prev => {
          const newData = { ...prev };
          delete newData[panelId];
          return newData;
        });

        // Show success toast
        toast.success('Panel deleted successfully', {
          duration: 2000,
          style: {
            background: '#10B981',
            color: '#FFFFFF',
          },
        });
      } catch (error) {
        // Show error toast if deletion fails
        toast.error('Failed to delete panel', {
          duration: 2000,
          style: {
            background: '#EF4444',
            color: '#FFFFFF',
          },
        });
      }
    }, 100);
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        stacked: true,
        grid: {
          display: false,
          color: darkMode ? '#374151' : '#f3f4f6'
        },
        ticks: {
          color: darkMode ? '#9CA3AF' : '#4B5563'
        }
      },
      y: {
        stacked: true,
        grid: {
          color: darkMode ? '#374151' : '#f3f4f6'
        },
        ticks: {
          color: darkMode ? '#9CA3AF' : '#4B5563'
        }
      },
    },
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 20,
          usePointStyle: true,
          boxWidth: 8,
          color: darkMode ? '#E5E7EB' : '#4B5563'
        }
      },
    },
  };

  const handleLayoutChange = (layout, layouts) => {
    setLayout(layouts);
  };

  // Add panel click handler
  const handlePanelClick = (panelId, event) => {
    // Prevent activation when clicking menu or drag handle
    if (
      event.target.closest('.panel-menu') || 
      event.target.closest('.react-grid-dragHandle')
    ) {
      return;
    }
    setActivePanel(panelId);
  };

  // Update renderPanel function
  const renderPanel = (panelId, title, subtitle, content) => {
    return (
      <div 
        className={`bg-white dark:bg-gray-800 rounded-lg transition-all duration-200 h-full relative
          ${activePanel === panelId 
            ? 'border-2 border-blue-500 dark:border-blue-400 shadow-lg ring-2 ring-blue-500/50 dark:ring-blue-400/50 z-20' 
            : 'border border-gray-200 dark:border-gray-700 hover:shadow-md z-10'
          }`}
        onClick={(e) => handlePanelClick(panelId, e)}
      >
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              {/* Drag Handle */}
              <div className="cursor-move react-grid-dragHandle">
                <svg className="w-5 h-5 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
                </svg>
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{subtitle}</p>
              </div>
            </div>
            <div className="relative panel-menu" ref={menuRef}>
              <button 
                className="p-1.5 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md transition-colors"
                onClick={() => setOpenMenuId(openMenuId === panelId ? null : panelId)}
              >
                <svg className="w-5 h-5 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                </svg>
              </button>
              
              {/* Dropdown Menu */}
              {openMenuId === panelId && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-50">
                  <div className="py-1">
                    <button
                      onClick={() => handleClonePanel(panelId)}
                      className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      Clone
                    </button>
                    <button
                      onClick={() => handleDeletePanel(panelId)}
                      className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Delete
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="p-4 overflow-auto" style={{ height: 'calc(100% - 80px)' }}>
          {content}
        </div>
      </div>
    );
  };

  // Add click handler to clear active panel when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.layout')) {
        setActivePanel(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCreatePanel = (formData) => {
    const newPanelId = `${formData.type}_${Math.floor(Math.random() * (999999999 - 1000000) + 1000000)}`;
    
    // Store panel metadata
    setPanelMetadata(prev => ({
      ...prev,
      [newPanelId]: {
        title: formData.title,
        description: formData.description
      }
    }));

    // Create new panel data
    if (formData.type === 'chart') {
      setPanelsData(prev => ({
        ...prev,
        [newPanelId]: generateDummyData()
      }));
    } else {
      setPanelsData(prev => ({
        ...prev,
        [newPanelId]: {
          value: Math.floor(Math.random() * 1000),
          increase: +(Math.random() * 20).toFixed(1)
        }
      }));
    }

    // Shift existing panels down
    setLayout(prev => {
      const shiftedLayout = prev.lg.map(item => ({
        ...item,
        y: item.y + 6
      }));

      return {
        ...prev,
        lg: [
          {
            i: newPanelId,
            x: 0,
            y: 0,
            w: 6,
            h: 6
          },
          ...shiftedLayout
        ]
      };
    });

    setIsModalOpen(false);
    toast.success('Panel created successfully', {
      duration: 2000,
      style: {
        background: '#10B981',
        color: '#FFFFFF',
      },
    });
  };

  // Add effect to handle system dark mode preference
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setDarkMode(isDark);
    }
  }, []);

  // Add effect to apply dark mode class
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex flex-col">
      {/* Add Toaster component */}
      <Toaster position="top-right" />
      
      {/* Add Modal */}
      <CreatePanelModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreatePanel}
      />
      
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-10">
        {/* Top Navigation */}
        <nav className="border-b border-gray-200 dark:border-gray-700">
          <div className="max-w-[1920px] mx-auto">
            <div className="flex items-center justify-between px-6 py-3">
              <div className="flex items-center gap-4">
                <button className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors lg:hidden">
                  <svg className="w-6 h-6 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
                <div className="flex items-center gap-3">
                  <span className="text-blue-600 dark:text-blue-400 font-bold text-2xl">Metrics</span>
                  <span className="text-gray-300 dark:text-gray-600">|</span>
                  <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Dashboard</h1>
                </div>
              </div>

              <div className="flex items-center gap-4">
                {/* Dark Mode Toggle */}
                <button
                  onClick={() => setDarkMode(!darkMode)}
                  className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  aria-label="Toggle dark mode"
                >
                  {darkMode ? (
                    <svg className="w-5 h-5 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                    </svg>
                  )}
                </button>
                <button className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md transition-colors">Settings</button>
                <button className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md transition-colors">Share</button>
                <button className="px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-md hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors">Save</button>
              </div>
            </div>
          </div>
        </nav>

        {/* Toolbar */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <div className="max-w-[1920px] mx-auto px-6 py-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-3">
                <button 
                  onClick={() => setIsModalOpen(true)}
                  className="px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-md hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
                >
                  Create visualization
                </button>
                <button 
                  onClick={() => setIsModalOpen(true)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
                >
                  Add panel
                </button>
                <button 
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
                >
                  Add from library
                </button>
              </div>

              <div className="flex items-center gap-3">
                <select 
                  value={timeRange}
                  onChange={(e) => setTimeRange(e.target.value)}
                  className="min-w-[180px] border border-gray-300 dark:border-gray-600 rounded-md px-4 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
                >
                  <option>Last 30 minutes</option>
                  <option>Last 1 hour</option>
                  <option>Last 24 hours</option>
                </select>
                <button 
                  className="p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
                >
                  <svg className="w-5 h-5 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 py-8">
        <div className="max-w-[1920px] mx-auto px-6">
          <ResponsiveGridLayout
            className="layout"
            layouts={layout}
            onLayoutChange={handleLayoutChange}
            breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
            cols={{ lg: 12, md: 12, sm: 6, xs: 4, xxs: 2 }}
            rowHeight={60}
            isDraggable={true}
            isResizable={true}
            resizeHandles={['se', 'sw', 'nw', 'ne', 'e', 'w']}
            minW={4}
            maxW={12}
            minH={4}
            maxH={12}
            margin={[16, 16]}
            draggableHandle=".react-grid-dragHandle"
            onResizeStop={(layout, oldItem, newItem) => {
              setTimeout(() => {
                window.dispatchEvent(new Event('resize'));
              }, 100);
            }}
          >
            {layout.lg.map(item => (
              <div key={item.i}>
                {renderPanel(
                  item.i,
                  panelMetadata[item.i]?.title || "Untitled Panel",
                  panelMetadata[item.i]?.description || "No description",
                  item.i.startsWith('chart_') ? (
                    <div className="h-full w-full">
                      <Bar options={options} data={panelsData[item.i] || generateDummyData()} />
                    </div>
                  ) : (
                    <div className="h-full bg-gray-50 dark:bg-gray-700/50 rounded-lg flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-6xl font-bold text-gray-900 dark:text-gray-100">
                          {panelsData[item.i]?.value || 468}
                        </div>
                        <div className="text-gray-600 dark:text-gray-300 mt-3 text-lg">Total Records</div>
                        <div className="text-sm text-green-600 dark:text-green-400 mt-2 flex items-center justify-center gap-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                          </svg>
                          <span>{panelsData[item.i]?.increase || 12.5}% increase</span>
                        </div>
                      </div>
                    </div>
                  )
                )}
              </div>
            ))}
          </ResponsiveGridLayout>
        </div>
      </main>
    </div>
  );
}
