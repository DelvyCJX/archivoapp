import React, { useEffect, useState } from 'react';
import { useFirebase, Project } from '../context/FirebaseContext';
import { X } from 'lucide-react';
import { format } from 'date-fns';

interface ProjectFormProps {
  project?: Project;
  onClose: () => void;
}

const ProjectForm: React.FC<ProjectFormProps> = ({ project, onClose }) => {
  const { addProject, updateProject } = useFirebase();
  const [formData, setFormData] = useState<Project>({
    name: '',
    description: '',
    type: 'commercial',
    createdDate: format(new Date(), 'yyyy-MM-dd'),
    startedDate: format(new Date(), 'yyyy-MM-dd'),
    revisionDate: format(new Date(), 'yyyy-MM-dd'),
    deliveryDate: format(new Date(), 'yyyy-MM-dd'),
    cost: 0,
    active: true,
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (project) {
      setFormData(project);
    }
  }, [project]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      if (project?.id) {
        await updateProject(project.id, formData);
      } else {
        await addProject(formData);
      }
      onClose();
    } catch (error) {
      console.error('Error saving project:', error);
      alert('Error saving project');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b flex items-center justify-between p-6">
          <h2 className="text-2xl font-bold">{project ? 'Edit Project' : 'Create New Project'}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Name */}
          <div>
            <label className="label">Project Name *</label>
            <input
              type="text"
              name="name"
              className="input-field"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="Enter project name"
            />
          </div>

          {/* Description */}
          <div>
            <label className="label">Description</label>
            <textarea
              name="description"
              className="input-field"
              rows={3}
              value={formData.description}
              onChange={handleChange}
              placeholder="Enter project description"
            ></textarea>
          </div>

          {/* Type */}
          <div>
            <label className="label">Project Type *</label>
            <select
              name="type"
              className="input-field"
              value={formData.type}
              onChange={handleChange}
              required
            >
              <option value="commercial">Commercial</option>
              <option value="house_additions">House Additions</option>
              <option value="buildings">Buildings</option>
              <option value="new_constructions">New Constructions</option>
              <option value="attics_renovations">Attics Renovations</option>
              <option value="basement_addition">Basement Addition</option>
            </select>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">Created Date</label>
              <input
                type="date"
                name="createdDate"
                className="input-field"
                value={formData.createdDate}
                onChange={handleChange}
              />
            </div>
            <div>
              <label className="label">Started Date *</label>
              <input
                type="date"
                name="startedDate"
                className="input-field"
                value={formData.startedDate}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">Revision Date</label>
              <input
                type="date"
                name="revisionDate"
                className="input-field"
                value={formData.revisionDate}
                onChange={handleChange}
              />
            </div>
            <div>
              <label className="label">Delivery Date *</label>
              <input
                type="date"
                name="deliveryDate"
                className="input-field"
                value={formData.deliveryDate}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {/* Cost */}
          <div>
            <label className="label">Total Cost *</label>
            <input
              type="number"
              name="cost"
              step="0.01"
              className="input-field"
              value={formData.cost}
              onChange={handleChange}
              required
              placeholder="0.00"
            />
          </div>

          {/* Active */}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              name="active"
              id="active"
              className="w-4 h-4 rounded"
              checked={formData.active}
              onChange={handleChange}
            />
            <label htmlFor="active" className="text-sm font-medium text-gray-700">
              Active Project
            </label>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 justify-end pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary"
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={submitting}
            >
              {submitting ? 'Saving...' : 'Save Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProjectForm;
