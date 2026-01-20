import React, { useEffect, useState } from 'react';
import { useFirebase, Project } from '../context/FirebaseContext';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ArrowRight, DollarSign, AlertCircle, Download } from 'lucide-react';

const Dashboard: React.FC = () => {
  const { projects, payments, getProjects, getPayments } = useFirebase();
  const [activeProjects, setActiveProjects] = useState<Project[]>([]);
  const [dashboardData, setDashboardData] = useState<any[]>([]);
  const [totalCost, setTotalCost] = useState(0);
  const [totalPaid, setTotalPaid] = useState(0);
  const [filterYear, setFilterYear] = useState<string>('');
  const [filterType, setFilterType] = useState<string>('');

  useEffect(() => {
    const loadData = async () => {
      await getProjects();
    };
    loadData();
  }, [getProjects]);

  useEffect(() => {
    const filtered = projects.filter(p => p.active);
    setActiveProjects(filtered);
  }, [projects]);

  useEffect(() => {
    const loadPaymentsAndCalculate = async () => {
      for (const project of activeProjects) {
        await getPayments(project.id!);
      }
    };

    loadPaymentsAndCalculate();
  }, [activeProjects, getPayments]);

  useEffect(() => {
    let totalCostSum = 0;
    let totalPaidSum = 0;
    const chartData: any[] = [];

    activeProjects.forEach(project => {
      const cost = typeof project.cost === 'string' ? parseFloat(project.cost) : project.cost;
      totalCostSum += cost;
      
      const projectPayments = payments.get(project.id!) || [];
      const paidAmount = projectPayments.reduce((sum, p) => sum + p.amount, 0);
      totalPaidSum += paidAmount;

      chartData.push({
        name: project.name,
        total: cost,
        paid: paidAmount,
        remaining: Math.max(0, cost - paidAmount),
      });
    });

    setTotalCost(totalCostSum);
    setTotalPaid(totalPaidSum);
    setDashboardData(chartData);
  }, [activeProjects, payments]);

  const pieData = [
    { name: 'Paid', value: totalPaid },
    { name: 'Remaining', value: Math.max(0, totalCost - totalPaid) },
  ];

  const handleExportProjects = () => {
    let filteredProjects = projects;

    if (filterYear) {
      filteredProjects = filteredProjects.filter(p => 
        new Date(p.createdDate).getFullYear().toString() === filterYear
      );
    }

    if (filterType) {
      filteredProjects = filteredProjects.filter(p => p.type === filterType);
    }

    let csv = 'Projects Export\n';
    csv += `Export Date,${new Date().toLocaleDateString()}\n`;
    if (filterYear) csv += `Filter - Year,${filterYear}\n`;
    if (filterType) csv += `Filter - Type,${filterType.replace(/_/g, ' ')}\n`;
    csv += `\n`;
    csv += 'Name,Type,Created Date,Started Date,Delivery Date,Total Cost,Paid,Remaining,Status\n';

    filteredProjects.forEach(project => {
      const cost = typeof project.cost === 'string' ? parseFloat(project.cost) : project.cost;
      const projectPayments = payments.get(project.id!) || [];
      const paidAmount = projectPayments.reduce((sum, p) => sum + p.amount, 0);
      const remaining = Math.max(0, cost - paidAmount);
      
      csv += `"${project.name}","${project.type.replace(/_/g, ' ')}","${project.createdDate}","${project.startedDate}","${project.deliveryDate}","${cost.toFixed(2)}","${paidAmount.toFixed(2)}","${remaining.toFixed(2)}","${project.active ? 'Active' : 'Inactive'}"\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `projects-export-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const projectTypes = Array.from(new Set(projects.map(p => p.type)));
  const projectYears = Array.from(new Set(projects.map(p => new Date(p.createdDate).getFullYear().toString()))).sort().reverse();

  return (
    <div className="space-y-6">
      {/* Export Section */}
      <div className="card bg-gray-50 border border-gray-200">
        <div className="flex flex-col gap-4">
          <h3 className="text-lg font-semibold">Export Projects</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Year</label>
              <select
                value={filterYear}
                onChange={(e) => setFilterYear(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Years</option>
                {projectYears.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Type</label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Types</option>
                {projectTypes.map(type => (
                  <option key={type} value={type}>{type.replace(/_/g, ' ')}</option>
                ))}
              </select>
            </div>
            <div className="flex items-end gap-2">
              <button
                onClick={handleExportProjects}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                Export CSV
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card bg-gradient-to-br from-blue-50 to-blue-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Cost</p>
              <p className="text-2xl font-bold text-blue-600">${totalCost.toFixed(2)}</p>
            </div>
            <DollarSign className="w-10 h-10 text-blue-300" />
          </div>
        </div>

        <div className="card bg-gradient-to-br from-green-50 to-green-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Paid</p>
              <p className="text-2xl font-bold text-green-600">${totalPaid.toFixed(2)}</p>
            </div>
            <ArrowRight className="w-10 h-10 text-green-300" />
          </div>
        </div>

        <div className="card bg-gradient-to-br from-orange-50 to-orange-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Remaining</p>
              <p className="text-2xl font-bold text-orange-600">${Math.max(0, totalCost - totalPaid).toFixed(2)}</p>
            </div>
            <AlertCircle className="w-10 h-10 text-orange-300" />
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bar Chart */}
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Payment Status by Project</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={dashboardData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="paid" fill="#10b981" name="Paid" />
              <Bar dataKey="remaining" fill="#f59e0b" name="Remaining" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Pie Chart */}
        <div className="card flex flex-col items-center">
          <h3 className="text-lg font-semibold mb-4">Overall Payment Status</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value, percent }) => `${name}: $${value.toFixed(2)} (${(percent * 100).toFixed(0)}%)`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                <Cell fill="#10b981" />
                <Cell fill="#f59e0b" />
              </Pie>
              <Tooltip formatter={(value) => `$${typeof value === 'number' ? value.toFixed(2) : value}`} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Active Projects List */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4">Active Projects</h3>
        {activeProjects.length === 0 ? (
          <p className="text-gray-500">No active projects</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-2 text-left">Name</th>
                  <th className="px-4 py-2 text-left">Type</th>
                  <th className="px-4 py-2 text-right">Total Cost</th>
                  <th className="px-4 py-2 text-right">Paid</th>
                  <th className="px-4 py-2 text-right">Remaining</th>
                </tr>
              </thead>
              <tbody>
                {activeProjects.map(project => {
                  const cost = typeof project.cost === 'string' ? parseFloat(project.cost) : project.cost;
                  const projectPayments = payments.get(project.id!) || [];
                  const paidAmount = projectPayments.reduce((sum, p) => sum + p.amount, 0);
                  const remaining = Math.max(0, cost - paidAmount);
                  const percentage = ((paidAmount / cost) * 100).toFixed(0);

                  return (
                    <tr key={project.id} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-2 font-medium">{project.name}</td>
                      <td className="px-4 py-2 text-gray-600">{project.type.replace(/_/g, ' ')}</td>
                      <td className="px-4 py-2 text-right">${cost.toFixed(2)}</td>
                      <td className="px-4 py-2 text-right text-green-600 font-medium">${paidAmount.toFixed(2)}</td>
                      <td className="px-4 py-2 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <div className="w-24 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-green-500 h-2 rounded-full" 
                              style={{ width: `${Math.min(100, parseFloat(percentage))}%` }}
                            ></div>
                          </div>
                          <span className="text-xs text-gray-600">${remaining.toFixed(2)}</span>
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

export default Dashboard;
