import { useState } from 'react';
import Dashboard from './pages/Dashboard';
import ProjectsList from './pages/ProjectsList';
import InactiveProjects from './pages/InactiveProjects';
import ProjectForm from './components/ProjectForm';
import PaymentManagement from './components/PaymentManagement';
import { Project } from './context/FirebaseContext';
import { LayoutDashboard, FileText, Archive, Plus } from 'lucide-react';
import './index.css';

type Tab = 'dashboard' | 'projects' | 'completed';

function App() {
  const [currentTab, setCurrentTab] = useState<Tab>('dashboard');
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | undefined>();
  const [selectedProject, setSelectedProject] = useState<Project | undefined>();

  const handleCreateProject = () => {
    setEditingProject(undefined);
    setShowProjectForm(true);
  };

  const handleEditProject = (project: Project) => {
    setEditingProject(project);
    setShowProjectForm(true);
  };

  const handleCloseForm = () => {
    setShowProjectForm(false);
    setEditingProject(undefined);
  };

  const handleViewPayments = (project: Project) => {
    setSelectedProject(project);
  };

  const handleClosePayments = () => {
    setSelectedProject(undefined);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Bar */}
      <nav className="bg-white shadow-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-2xl font-bold text-blue-600">Project Manager</h1>
            <button
              onClick={handleCreateProject}
              className="btn btn-primary flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              New Project
            </button>
          </div>
        </div>
      </nav>

      {/* Tab Navigation */}
      <div className="bg-white border-b sticky top-16 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-8">
            <button
              onClick={() => setCurrentTab('dashboard')}
              className={`py-4 px-2 border-b-2 font-medium transition-colors flex items-center gap-2 ${
                currentTab === 'dashboard'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <LayoutDashboard className="w-5 h-5" />
              Dashboard
            </button>
            <button
              onClick={() => setCurrentTab('projects')}
              className={`py-4 px-2 border-b-2 font-medium transition-colors flex items-center gap-2 ${
                currentTab === 'projects'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <FileText className="w-5 h-5" />
              All Projects
            </button>
            <button
              onClick={() => setCurrentTab('completed')}
              className={`py-4 px-2 border-b-2 font-medium transition-colors flex items-center gap-2 ${
                currentTab === 'completed'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <Archive className="w-5 h-5" />
              Completed
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentTab === 'dashboard' && <Dashboard />}
        {currentTab === 'projects' && (
          <ProjectsList onEdit={handleEditProject} onViewPayments={handleViewPayments} />
        )}
        {currentTab === 'completed' && (
          <InactiveProjects onEdit={handleEditProject} onViewPayments={handleViewPayments} />
        )}
      </div>

      {/* Modals */}
      {showProjectForm && <ProjectForm project={editingProject} onClose={handleCloseForm} />}
      {selectedProject && <PaymentManagement project={selectedProject} onClose={handleClosePayments} />}
    </div>
  );
}

export default App;
