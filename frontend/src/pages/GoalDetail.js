import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { toast, ToastContainer } from 'react-toastify';
import { 
  ArrowLeft, 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  Target, 
  Calendar,
  Zap,
  Edit,
  Trash2,
  Plus,
  Filter,
  BarChart3
} from 'lucide-react';
import 'react-toastify/dist/ReactToastify.css';

// Register ChartJS components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const GoalDetail = () => {
  const { id } = useParams();
  const [goal, setGoal] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [editingTask, setEditingTask] = useState(null);

  useEffect(() => {
    fetchGoalWithTasks();
  }, [id]);

  const fetchGoalWithTasks = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`http://localhost:5000/api/tasks/goals/${id}`);
      setGoal(response.data.goal);
      setTasks(response.data.tasks);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching goal details:', error);
      setError('Failed to fetch goal details. Please try again.');
      setLoading(false);
    }
  };

  const updateTaskStatus = async (taskId, newStatus) => {
    try {
      await axios.patch(`http://localhost:5000/api/tasks/${taskId}/status`, { status: newStatus });
      
      // Update the task status in the local state
      setTasks(tasks.map(task => 
        task._id === taskId ? { ...task, status: newStatus } : task
      ));
      
      toast.success(`Task status updated to ${newStatus}`, {
        position: "top-right",
        autoClose: 2000,
      });
    } catch (error) {
      console.error('Error updating task status:', error);
      toast.error('Failed to update task status. Please try again.');
    }
  };

  const deleteTask = async (taskId) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    
    try {
      await axios.delete(`http://localhost:5000/api/tasks/${taskId}`);
      setTasks(tasks.filter(task => task._id !== taskId));
      toast.success('Task deleted successfully');
    } catch (error) {
      console.error('Error deleting task:', error);
      toast.error('Failed to delete task');
    }
  };

  // Filter tasks based on selected filters
  const filteredTasks = tasks.filter(task => {
    if (filterStatus !== 'all' && task.status !== filterStatus) return false;
    if (filterPriority !== 'all' && task.priority !== filterPriority) return false;
    return true;
  });

  // Helper functions
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent': return 'danger';
      case 'high': return 'warning';
      case 'medium': return 'info';
      case 'low': return 'secondary';
      default: return 'secondary';
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'business': return '💼';
      case 'personal': return '👤';
      case 'project': return '📁';
      case 'learning': return '📚';
      case 'health': return '🏥';
      default: return '📋';
    }
  };

  const getTaskStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'success';
      case 'in-progress': return 'warning';
      case 'pending': return 'secondary';
      default: return 'secondary';
    }
  };

  const getTaskStatusIcon = (status) => {
    switch (status) {
      case 'completed': return <CheckCircle size={24} className="text-success" />;
      case 'in-progress': return <Clock size={24} className="text-warning" />;
      case 'pending': return <AlertTriangle size={24} className="text-secondary" />;
      default: return <Clock size={24} className="text-secondary" />;
    }
  };

  const getCompletionPercentage = () => {
    if (!tasks || tasks.length === 0) return 0;
    const completed = tasks.filter(task => task.status === 'completed').length;
    return Math.round((completed / tasks.length) * 100);
  };

  // Prepare data for simple task progress chart
  const prepareChartData = () => {
    if (!tasks.length) return null;

    const statusCounts = {
      pending: 0,
      'in-progress': 0,
      completed: 0
    };

    tasks.forEach(task => {
      statusCounts[task.status] = (statusCounts[task.status] || 0) + 1;
    });
    
    return {
      labels: ['Pending', 'In Progress', 'Completed'],
      datasets: [
        {
          label: 'Task Status',
          data: [statusCounts.pending, statusCounts['in-progress'], statusCounts.completed],
          backgroundColor: [
            'rgba(255, 193, 7, 0.8)',   // Yellow for pending
            'rgba(54, 162, 235, 0.8)',  // Blue for in-progress  
            'rgba(40, 167, 69, 0.8)'    // Green for completed
          ],
          borderColor: [
            'rgba(255, 193, 7, 1)',
            'rgba(54, 162, 235, 1)',
            'rgba(40, 167, 69, 1)'
          ],
          borderWidth: 2
        }
      ]
    };
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Task Progress Overview'
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1
        }
      }
    }
  };

  // Find task dependencies
  const getTaskDependencies = (task) => {
    if (!task.dependencies || task.dependencies.length === 0) return [];
    
    return task.dependencies.map(depId => {
      const dependencyTask = tasks.find(t => t._id === depId);
      return dependencyTask ? dependencyTask.title : 'Unknown Task';
    });
  };

  if (loading) {
    return (
      <div className="loading-spinner">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return <div className="alert alert-danger">{error}</div>;
  }

  if (!goal) {
    return <div className="alert alert-warning">Goal not found</div>;
  }

  const chartData = prepareChartData();

  return (
    <div className="container-fluid px-4">
      <ToastContainer position="top-right" autoClose={3000} />
      
      {/* Header */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center">
            <div className="d-flex align-items-center">
              <Link to="/" className="btn btn-outline-primary me-3">
                <ArrowLeft size={20} className="me-2" />
                Back to Goals
              </Link>
              <div>
                <h1 className="mb-1">{goal.title}</h1>
                <p className="text-muted mb-0">{getCategoryIcon(goal.category)} {goal.category}</p>
              </div>
            </div>
            <span className={`badge bg-${getPriorityColor(goal.priority)} fs-6`}>
              {goal.priority} Priority
            </span>
          </div>
        </div>
      </div>

      {/* Goal Details Card */}
      <div className="row mb-4">
        <div className="col-lg-8">
          <div className="card shadow-lg border-0">
            <div className="card-header bg-primary text-white">
              <h5 className="mb-0">
                <Target className="me-2" />
                Goal Details
              </h5>
            </div>
            <div className="card-body">
              <p className="card-text mb-3">{goal.description}</p>
              <div className="row">
                {goal.deadline && (
                  <div className="col-md-6 mb-3">
                    <div className="d-flex align-items-center">
                      <Calendar size={16} className="me-2 text-warning" />
                      <strong>Deadline:</strong>
                      <span className="ms-2">{new Date(goal.deadline).toLocaleDateString()}</span>
                    </div>
                  </div>
                )}
                <div className="col-md-6 mb-3">
                  <div className="d-flex align-items-center">
                    <CheckCircle size={16} className="me-2 text-success" />
                    <strong>Status:</strong>
                    <span className={`badge bg-${goal.status === 'completed' ? 'success' : 'primary'} ms-2`}>
                      {goal.status}
                    </span>
                  </div>
                </div>
              </div>
              {goal.aiGenerated && (
                <div className="alert alert-info border-0">
                  <Zap size={16} className="me-2" />
                  This goal was enhanced with AI-powered task generation
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Progress Stats */}
        <div className="col-lg-4">
          <div className="card shadow-lg border-0 h-100">
            <div className="card-header bg-success text-white">
              <h5 className="mb-0">
                <BarChart3 className="me-2" />
                Progress Overview
              </h5>
            </div>
            <div className="card-body">
              <div className="text-center mb-3">
                <div className="progress mb-2" style={{ height: '10px' }}>
                  <div 
                    className="progress-bar bg-success" 
                    style={{ width: `${getCompletionPercentage()}%` }}
                  ></div>
                </div>
                <h4 className="text-success">{getCompletionPercentage()}% Complete</h4>
              </div>
              
              <div className="row text-center">
                <div className="col-6">
                  <h5 className="text-primary">{tasks.filter(t => t.status === 'completed').length}</h5>
                  <small className="text-muted">Completed</small>
                </div>
                <div className="col-6">
                  <h5 className="text-warning">{tasks.filter(t => t.status === 'in-progress').length}</h5>
                  <small className="text-muted">In Progress</small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Chart */}
      {chartData && (
        <div className="row mb-4">
          <div className="col-12">
            <div className="card shadow-lg border-0">
              <div className="card-header bg-info text-white">
                <h5 className="mb-0">
                  <BarChart3 className="me-2" />
                  Task Progress Analytics
                </h5>
              </div>
              <div className="card-body">
                <Bar data={chartData} options={chartOptions} />
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Tasks Section */}
      <div className="row">
        <div className="col-12">
          <div className="card shadow-lg border-0">
            <div className="card-header bg-warning text-white">
              <div className="row align-items-center">
                <div className="col">
                  <h5 className="mb-0">
                    <CheckCircle className="me-2" />
                    Tasks ({filteredTasks.length} of {tasks.length})
                  </h5>
                </div>
                <div className="col-auto">
                  <button className="btn btn-light btn-sm">
                    <Plus size={16} className="me-1" />
                    Add Task
                  </button>
                </div>
              </div>
            </div>
            <div className="card-body">
              {/* Filters */}
              <div className="row mb-4">
                <div className="col-md-4">
                  <select
                    className="form-select"
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                  >
                    <option value="all">All Statuses</option>
                    <option value="pending">Pending</option>
                    <option value="in-progress">In Progress</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
                <div className="col-md-4">
                  <select
                    className="form-select"
                    value={filterPriority}
                    onChange={(e) => setFilterPriority(e.target.value)}
                  >
                    <option value="all">All Priorities</option>
                    <option value="urgent">Urgent</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
                <div className="col-md-4">
                  <div className="btn-group w-100" role="group">
                    <button type="button" className="btn btn-outline-primary btn-sm">
                      <Filter size={14} />
                    </button>
                    <button type="button" className="btn btn-outline-success btn-sm">
                      Sort by Priority
                    </button>
                  </div>
                </div>
              </div>

              {filteredTasks.length > 0 ? (
                <div className="tasks-container">
                  {filteredTasks.map((task) => (
                    <div key={task._id} className="card mb-3 task-modern-card border-start border-4" 
                         style={{ borderColor: `var(--bs-${getTaskStatusColor(task.status)})` }}>
                      <div className="card-body">
                        <div className="row align-items-center">
                          <div className="col-lg-8">
                            <div className="d-flex align-items-center mb-2">
                              <div className="me-3">
                                {getTaskStatusIcon(task.status)}
                              </div>
                              <div>
                                <h5 className="mb-1">{task.title}</h5>
                                <p className="text-muted mb-0">{task.description}</p>
                              </div>
                            </div>
                            
                            <div className="d-flex flex-wrap gap-2 mb-2">
                              <span className={`badge bg-${getPriorityColor(task.priority)}`}>
                                {task.priority}
                              </span>
                              <span className={`badge bg-${getTaskStatusColor(task.status)}`}>
                                {task.status}
                              </span>
                              {task.category && (
                                <span className="badge bg-secondary">{task.category}</span>
                              )}
                              {task.estimatedHours && (
                                <span className="badge bg-info">
                                  <Clock size={12} className="me-1" />
                                  {task.estimatedHours}h
                                </span>
                              )}
                            </div>
                            
                            <div className="row text-muted small">
                              <div className="col-md-6">
                                <Calendar size={12} className="me-1" />
                                Start: {new Date(task.startDate).toLocaleDateString()}
                              </div>
                              <div className="col-md-6">
                                <Calendar size={12} className="me-1" />
                                End: {new Date(task.endDate).toLocaleDateString()}
                              </div>
                            </div>
                            
                            {getTaskDependencies(task).length > 0 && (
                              <div className="mt-2">
                                <small className="text-muted">
                                  <strong>Dependencies:</strong> {getTaskDependencies(task).join(', ')}
                                </small>
                              </div>
                            )}
                          </div>
                          
                          <div className="col-lg-4">
                            <div className="d-flex flex-column gap-2">
                              <div className="dropdown">
                                <button className={`btn btn-${getTaskStatusColor(task.status)} dropdown-toggle w-100`} 
                                        type="button" data-bs-toggle="dropdown">
                                  Update Status
                                </button>
                                <ul className="dropdown-menu w-100">
                                  <li>
                                    <button className="dropdown-item" onClick={() => updateTaskStatus(task._id, 'pending')}>
                                      <Clock size={14} className="me-2" />Pending
                                    </button>
                                  </li>
                                  <li>
                                    <button className="dropdown-item" onClick={() => updateTaskStatus(task._id, 'in-progress')}>
                                      <AlertTriangle size={14} className="me-2" />In Progress
                                    </button>
                                  </li>
                                  <li>
                                    <button className="dropdown-item" onClick={() => updateTaskStatus(task._id, 'completed')}>
                                      <CheckCircle size={14} className="me-2" />Completed
                                    </button>
                                  </li>
                                </ul>
                              </div>
                              
                              <div className="btn-group" role="group">
                                <button className="btn btn-outline-primary btn-sm" onClick={() => setEditingTask(task)}>
                                  <Edit size={14} />
                                </button>
                                <button className="btn btn-outline-danger btn-sm" onClick={() => deleteTask(task._id)}>
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-5">
                  <CheckCircle size={64} className="text-muted mb-3" />
                  <h5>No tasks found</h5>
                  <p className="text-muted">
                    {tasks.length === 0 
                      ? "No tasks have been created for this goal yet."
                      : "No tasks match the current filters."
                    }
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GoalDetail;