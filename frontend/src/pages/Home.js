import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { 
  Target, 
  Plus, 
  Calendar, 
  Clock, 
  TrendingUp, 
  CheckCircle, 
  AlertCircle,
  Filter,
  Search,
  BarChart3,
  Zap
} from 'lucide-react';

const Home = () => {
  const [goals, setGoals] = useState([]);
  const [filteredGoals, setFilteredGoals] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [goalText, setGoalText] = useState('');
  const [deadline, setDeadline] = useState(null);
  const [category, setCategory] = useState('other');
  const [priority, setPriority] = useState('medium');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');

  useEffect(() => {
    fetchGoals();
    fetchAnalytics();
  }, []);

  useEffect(() => {
    filterGoals();
  }, [goals, searchTerm, filterStatus, filterCategory]);

  const fetchGoals = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5000/api/tasks/goals');
      setGoals(response.data.data || response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching goals:', error);
      toast.error('Failed to fetch goals. Please try again.');
      setLoading(false);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/tasks/dashboard/analytics');
      setAnalytics(response.data.data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    }
  };

  const filterGoals = () => {
    let filtered = goals;

    if (searchTerm) {
      filtered = filtered.filter(goal => 
        goal.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        goal.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterStatus !== 'all') {
      filtered = filtered.filter(goal => goal.status === filterStatus);
    }

    if (filterCategory !== 'all') {
      filtered = filtered.filter(goal => goal.category === filterCategory);
    }

    setFilteredGoals(filtered);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!goalText.trim()) {
      toast.error('Please enter a goal');
      return;
    }
    
    try {
      setSubmitting(true);
      setError('');
      
      const response = await axios.post('http://localhost:5000/api/tasks/generate', {
        goalText,
        deadline: deadline ? deadline.toISOString() : null,
        category,
        priority
      });
      
      if (response.data.success) {
        toast.success(`🎉 Generated ${response.data.data.statistics.totalTasks} AI-powered tasks!`);
        setGoals([response.data.data.goal, ...goals]);
        
        // Reset form
        setGoalText('');
        setDeadline(null);
        setCategory('other');
        setPriority('medium');
      }
      
      setSubmitting(false);
      fetchAnalytics(); // Refresh analytics
      
    } catch (error) {
      console.error('Error generating tasks:', error);
      toast.error(error.response?.data?.message || 'Failed to generate tasks. Please try again.');
      setSubmitting(false);
    }
  };

  const deleteGoal = async (goalId) => {
    if (!window.confirm('Are you sure you want to delete this goal and all its tasks?')) {
      return;
    }

    try {
      await axios.delete(`http://localhost:5000/api/tasks/goals/${goalId}`);
      setGoals(goals.filter(goal => goal._id !== goalId));
      toast.success('Goal deleted successfully');
      fetchAnalytics(); // Refresh analytics
    } catch (error) {
      console.error('Error deleting goal:', error);
      toast.error('Failed to delete goal');
    }
  };

  const getPriorityColor = (priority) => {
    const colors = {
      low: 'success',
      medium: 'primary', 
      high: 'warning',
      urgent: 'danger'
    };
    return colors[priority] || 'secondary';
  };

  const getCategoryIcon = (category) => {
    const icons = {
      business: '💼',
      personal: '👤',
      project: '🚀',
      learning: '📚',
      health: '💪',
      other: '📋'
    };
    return icons[category] || '📋';
  };

  return (
    <div className="container-fluid px-4">
      <ToastContainer position="top-right" autoClose={3000} />
      
      {/* Hero Section */}
      <div className="row mb-5">
        <div className="col-12">
          <div className="bg-gradient-primary text-white rounded-4 p-5 text-center">
            <h1 className="display-4 fw-bold mb-3">
              <Zap className="me-3" size={48} />
              AI-Powered Task Planner
            </h1>
            <p className="lead mb-0">Transform your goals into actionable tasks with intelligent AI assistance</p>
          </div>
        </div>
      </div>

      {/* Analytics Dashboard */}
      {analytics && (
        <div className="row mb-5">
          <div className="col-12">
            <h3 className="mb-4">
              <BarChart3 className="me-2" />
              Dashboard Overview
            </h3>
          </div>
          <div className="col-md-3 mb-3">
            <div className="card bg-primary text-white h-100">
              <div className="card-body text-center">
                <Target size={32} className="mb-2" />
                <h4 className="mb-1">{analytics.overview.totalGoals}</h4>
                <small>Total Goals</small>
              </div>
            </div>
          </div>
          <div className="col-md-3 mb-3">
            <div className="card bg-success text-white h-100">
              <div className="card-body text-center">
                <CheckCircle size={32} className="mb-2" />
                <h4 className="mb-1">{analytics.overview.completedTasks}</h4>
                <small>Completed Tasks</small>
              </div>
            </div>
          </div>
          <div className="col-md-3 mb-3">
            <div className="card bg-warning text-white h-100">
              <div className="card-body text-center">
                <Clock size={32} className="mb-2" />
                <h4 className="mb-1">{analytics.overview.overdueTasks}</h4>
                <small>Overdue Tasks</small>
              </div>
            </div>
          </div>
          <div className="col-md-3 mb-3">
            <div className="card bg-info text-white h-100">
              <div className="card-body text-center">
                <TrendingUp size={32} className="mb-2" />
                <h4 className="mb-1">{analytics.overview.completionRate}%</h4>
                <small>Completion Rate</small>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="row">
        {/* Create Goal Form */}
        <div className="col-lg-5 mb-4">
          <div className="card shadow-lg border-0 h-100">
            <div className="card-header bg-primary text-white">
              <h4 className="mb-0">
                <Plus className="me-2" />
                Create New Goal
              </h4>
            </div>
            <div className="card-body p-4">
              {error && <div className="alert alert-danger">{error}</div>}
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label htmlFor="goalText" className="form-label fw-bold">Goal Description</label>
                  <textarea
                    id="goalText"
                    className="form-control form-control-lg"
                    rows="4"
                    value={goalText}
                    onChange={(e) => setGoalText(e.target.value)}
                    placeholder="E.g., Launch a mobile app marketplace in 3 months..."
                    required
                  ></textarea>
                </div>
                
                <div className="row mb-3">
                  <div className="col-md-6">
                    <label htmlFor="category" className="form-label fw-bold">Category</label>
                    <select
                      id="category"
                      className="form-select"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                    >
                      <option value="other">Other</option>
                      <option value="business">Business</option>
                      <option value="personal">Personal</option>
                      <option value="project">Project</option>
                      <option value="learning">Learning</option>
                      <option value="health">Health</option>
                    </select>
                  </div>
                  <div className="col-md-6">
                    <label htmlFor="priority" className="form-label fw-bold">Priority</label>
                    <select
                      id="priority"
                      className="form-select"
                      value={priority}
                      onChange={(e) => setPriority(e.target.value)}
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>
                </div>
                
                <div className="mb-4">
                  <label htmlFor="deadline" className="form-label fw-bold">
                    <Calendar className="me-1" size={16} />
                    Deadline (Optional)
                  </label>
                  <DatePicker
                    id="deadline"
                    className="form-control"
                    selected={deadline}
                    onChange={(date) => setDeadline(date)}
                    dateFormat="MMMM d, yyyy"
                    minDate={new Date()}
                    placeholderText="Select a deadline"
                  />
                </div>
                
                <button 
                  type="submit" 
                  className="btn btn-primary btn-lg w-100 fw-bold"
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <div className="spinner-border spinner-border-sm me-2" role="status"></div>
                      Generating AI Tasks...
                    </>
                  ) : (
                    <>
                      <Zap className="me-2" size={20} />
                      Generate AI-Powered Tasks
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
        
        {/* Goals List */}
        <div className="col-lg-7">
          <div className="card shadow-lg border-0">
            <div className="card-header bg-success text-white">
              <div className="row align-items-center">
                <div className="col">
                  <h4 className="mb-0">
                    <Target className="me-2" />
                    Your Goals ({filteredGoals.length})
                  </h4>
                </div>
                <div className="col-auto">
                  <button className="btn btn-light btn-sm" onClick={fetchGoals}>
                    <TrendingUp size={16} />
                  </button>
                </div>
              </div>
            </div>
            <div className="card-body">
              {/* Filters */}
              <div className="row mb-4">
                <div className="col-md-4">
                  <div className="input-group">
                    <span className="input-group-text">
                      <Search size={16} />
                    </span>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Search goals..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
                <div className="col-md-4">
                  <select
                    className="form-select"
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                  >
                    <option value="all">All Statuses</option>
                    <option value="active">Active</option>
                    <option value="completed">Completed</option>
                    <option value="on-hold">On Hold</option>
                  </select>
                </div>
                <div className="col-md-4">
                  <select
                    className="form-select"
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                  >
                    <option value="all">All Categories</option>
                    <option value="business">Business</option>
                    <option value="personal">Personal</option>
                    <option value="project">Project</option>
                    <option value="learning">Learning</option>
                    <option value="health">Health</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              {loading ? (
                <div className="text-center py-5">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  <p className="mt-2">Loading your goals...</p>
                </div>
              ) : filteredGoals.length > 0 ? (
                <div className="goal-list" style={{ maxHeight: '600px', overflowY: 'auto' }}>
                  {filteredGoals.map((goal) => (
                    <div key={goal._id} className="card mb-3 border-start border-4" 
                         style={{ borderColor: `var(--bs-${getPriorityColor(goal.priority)})` }}>
                      <div className="card-body">
                        <div className="row align-items-start">
                          <div className="col">
                            <div className="d-flex align-items-center mb-2">
                              <span className="me-2 fs-4">{getCategoryIcon(goal.category)}</span>
                              <h5 className="card-title mb-0">{goal.title}</h5>
                              <span className={`badge bg-${getPriorityColor(goal.priority)} ms-auto`}>
                                {goal.priority}
                              </span>
                            </div>
                            <p className="card-text text-muted">{goal.description}</p>
                            <div className="d-flex flex-wrap gap-2 mb-3">
                              <span className="badge bg-secondary">{goal.category}</span>
                              <span className="badge bg-info">{goal.taskCount || 0} tasks</span>
                              {goal.deadline && (
                                <span className="badge bg-warning">
                                  <Calendar size={12} className="me-1" />
                                  {new Date(goal.deadline).toLocaleDateString()}
                                </span>
                              )}
                              {goal.aiGenerated && (
                                <span className="badge bg-primary">
                                  <Zap size={12} className="me-1" />
                                  AI Generated
                                </span>
                              )}
                            </div>
                            <div className="btn-group" role="group">
                              <Link 
                                to={`/goals/${goal._id}`} 
                                className="btn btn-primary btn-sm"
                              >
                                <Target size={14} className="me-1" />
                                View Tasks
                              </Link>
                              <button 
                                className="btn btn-outline-danger btn-sm"
                                onClick={() => deleteGoal(goal._id)}
                              >
                                <AlertCircle size={14} className="me-1" />
                                Delete
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-5">
                  <Target size={64} className="text-muted mb-3" />
                  <h5>No goals found</h5>
                  <p className="text-muted">Create your first goal to get started with AI-powered task planning!</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

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

export default Home;