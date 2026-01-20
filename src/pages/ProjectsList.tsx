import React, { useEffect, useState } from 'react';
import { useFirebase, Project } from '../context/FirebaseContext';
import { format, parseISO } from 'date-fns';
import { Trash2, Edit2, Eye, CheckCircle } from 'lucide-react';

interface ProjectsListProps {
  onEdit: (project: Project) => void;
  onViewPayments: (project: Project) => void;
}

const ProjectsList: React.FC<ProjectsListProps> = ({ onEdit, onViewPayments }) => {
  const { projects, payments, getProjects, deleteProject, getPayments, updateProject } = useFirebase();
  const [sortedProjects, setSortedProjects] = useState<Project[]>([]);

  useEffect(() => {
    const loadData = async () => {
      await getProjects();
    };
    loadData();
  }, [getProjects]);

  useEffect(() => {
    const loadPayments = async () => {
      for (const project of projects) {
        await getPayments(project.id!);
      }
    };
    loadPayments();
  }, [projects, getPayments]);

  useEffect(() => {
    const sorted = [...projects].sort((a, b) => {
      const dateA = new Date(a.startedDate).getTime();
      const dateB = new Date(b.startedDate).getTime();
      return dateB - dateA; // Most recent first
    });
    setSortedProjects(sorted);
  }, [projects]);

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      await deleteProject(id);
    }
  };

  const handleToggleStatus = async (id: string, currentActive: boolean) => {
    const action = currentActive ? 'deactivate' : 'activate';
    if (window.confirm(`Are you sure you want to ${action} this project?`)) {
      try {
        await updateProject(id, { active: !currentActive });
        await getProjects();
      } catch (err) {
        console.error(`Error toggling project status:`, err);
        alert(`Error ${action}ing project`);
      }
    }
  };

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      commercial: 'bg-blue-100 text-blue-800',
      house_additions: 'bg-green-100 text-green-800',
      buildings: 'bg-purple-100 text-purple-800',
      new_constructions: 'bg-orange-100 text-orange-800',
      attics_renovations: 'bg-yellow-100 text-yellow-800',
      basement_addition: 'bg-red-100 text-red-800',
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-4">
      <div className="card">
        <h2 className="text-2xl font-bold mb-6">All Projects</h2>
        
        {sortedProjects.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No projects yet. Create your first project!</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-100 sticky top-0">
                <tr>
                  <th className="px-4 py-3 text-left">Name</th>
                  <th className="px-4 py-3 text-left">Type</th>
                  <th className="px-4 py-3 text-left">Started Date</th>
                  <th className="px-4 py-3 text-left">Delivery Date</th>
                  <th className="px-4 py-3 text-right">Cost</th>
                  <th className="px-4 py-3 text-right">Paid</th>
                  <th className="px-4 py-3 text-right">Remaining</th>
                  <th className="px-4 py-3 text-center">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {sortedProjects.map(project => {
                  const cost = typeof project.cost === 'string' ? parseFloat(project.cost) : project.cost;
                  const projectPayments = payments.get(project.id!) || [];
                  const paidAmount = projectPayments.reduce((sum, p) => sum + p.amount, 0);
                  const remaining = Math.max(0, cost - paidAmount);

                  return (
                    <tr key={project.id} className="border-b hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 font-medium">{project.name}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${getTypeColor(project.type)}`}>
                          {project.type.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {format(parseISO(project.startedDate), 'MMM dd, yyyy')}
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {format(parseISO(project.deliveryDate), 'MMM dd, yyyy')}
                      </td>
                      <td className="px-4 py-3 text-right font-semibold">${cost.toFixed(2)}</td>
                      <td className="px-4 py-3 text-right text-green-600 font-medium">${paidAmount.toFixed(2)}</td>
                      <td className="px-4 py-3 text-right text-orange-600 font-medium">${remaining.toFixed(2)}</td>
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${project.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                          {project.active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex gap-2 justify-end">
                          <button
                            onClick={() => onViewPayments(project)}
                            className="btn btn-secondary p-2"
                            title="View Payments"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onEdit(project)}
                            className="btn btn-secondary p-2"
                            title="Edit"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleToggleStatus(project.id!, project.active)}
                            className={`btn p-2 ${project.active ? 'btn-secondary' : 'btn-primary'}`}
                            title={project.active ? 'Deactivate' : 'Activate'}
                          >
                            {project.active ? (
                              <CheckCircle className="w-4 h-4" />
                            ) : (
                              <CheckCircle className="w-4 h-4" />
                            )}
                          </button>
                          <button
                            onClick={() => handleDelete(project.id!)}
                            className="btn btn-danger p-2"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectsList;
