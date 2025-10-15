const Goal = require('../models/Goal');
const Task = require('../models/Task');
const OpenAI = require('openai');
const logger = require('../utils/logger');

// Dynamic import for uuid (ES Module)
const generateId = async () => {
  const { v4: uuidv4 } = await import('uuid');
  return uuidv4();
};

// Initialize Groq API client
const groqClient = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1"
});

/**
 * @swagger
 * /api/tasks/generate:
 *   post:
 *     summary: Generate tasks for a goal using AI
 *     tags: [Tasks]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - goalText
 *             properties:
 *               goalText:
 *                 type: string
 *                 description: The goal description
 *               deadline:
 *                 type: string
 *                 format: date-time
 *                 description: Optional deadline
 *               category:
 *                 type: string
 *                 enum: [business, personal, project, learning, health, other]
 *               priority:
 *                 type: string
 *                 enum: [low, medium, high, urgent]
 *     responses:
 *       201:
 *         description: Tasks generated successfully
 */
exports.generateTasks = async (req, res) => {
  const startTime = Date.now();
  const requestId = await generateId();
  
  try {
    const { 
      goalText, 
      deadline, 
      category = 'other', 
      priority = 'medium',
      estimatedDuration = 7,
      budget = 0
    } = req.body;
    
    logger.info('Starting task generation', { requestId, goalText, category, priority });
    
    if (!goalText || goalText.trim().length < 5) {
      logger.warn('Invalid goal text provided', { requestId, goalText });
      return res.status(400).json({ 
        success: false,
        message: 'Goal text is required and must be at least 5 characters long',
        requestId 
      });
    }

    // Create a new goal with enhanced fields
    const goal = new Goal({
      title: goalText.length > 50 
        ? goalText.substring(0, 47) + '...' 
        : goalText,
      description: goalText,
      deadline: deadline || null,
      category,
      priority,
      estimatedDuration,
      budget,
      aiGenerated: true
    });
    
    const savedGoal = await goal.save();
    logger.info('Goal saved successfully', { requestId, goalId: savedGoal._id });

    try {
      // Generate tasks using Groq API
      const aiStartTime = Date.now();
      const tasks = await generateTasksWithGroq(goalText, deadline, category, priority);
      
      // Save tasks to database with enhanced fields
      const savedTasks = [];
      const taskMap = {};
      
      logger.info('Saving AI-generated tasks', { requestId, taskCount: tasks.length });
      
      // First pass: Create all tasks without dependencies
      for (let i = 0; i < tasks.length; i++) {
        const task = tasks[i];
        const newTask = new Task({
          title: task.title,
          description: task.description,
          startDate: task.startDate,
          endDate: task.endDate,
          priority: task.priority || 'medium',
          category: task.category || 'other',
          estimatedHours: task.estimatedHours || Math.ceil(Math.random() * 8) + 1,
          status: 'pending',
          goal: savedGoal._id,
          tags: task.tags || []
        });
        
        const savedTask = await newTask.save();
        savedTasks.push(savedTask);
        taskMap[task.title] = savedTask._id;
      }
      
      // Second pass: Update tasks with dependencies
      for (let i = 0; i < tasks.length; i++) {
        const task = tasks[i];
        const savedTask = savedTasks[i];
        
        if (task.dependencies && task.dependencies.length > 0) {
          const dependencyIds = task.dependencies
            .map(depTitle => taskMap[depTitle])
            .filter(id => id); // Filter out any undefined dependencies
          
          savedTask.dependencies = dependencyIds;
          await savedTask.save();
        }
      }
      
      // Update goal with task count
      savedGoal.taskCount = savedTasks.length;
      await savedGoal.save();
      
      const duration = Date.now() - startTime;
      const aiDuration = Date.now() - aiStartTime;
      
      logger.logAIGeneration(goalText, savedTasks.length, aiDuration, true);
      logger.info('Task generation completed successfully', { 
        requestId, 
        goalId: savedGoal._id, 
        taskCount: savedTasks.length,
        totalDuration: `${duration}ms`
      });

      return res.status(201).json({
        success: true,
        message: 'Tasks generated successfully using AI',
        requestId,
        data: {
          goal: savedGoal,
          tasks: savedTasks,
          statistics: {
            totalTasks: savedTasks.length,
            aiGenerationTime: `${aiDuration}ms`,
            totalProcessingTime: `${duration}ms`
          }
        }
      });
    } catch (aiError) {
      console.error('❌ Error generating tasks with Groq:', aiError.message);
      console.error('📄 Full error:', aiError);
      
      // Fallback to local task generation if Groq fails
      console.log('🔄 Falling back to local task generation...');
      const tasks = generateLocalTasks(goalText, deadline);
      
      // Save tasks to database (same code as above)
      const savedTasks = [];
      const taskMap = {};
      
      // First pass: Create all tasks without dependencies
      for (const task of tasks) {
        const newTask = new Task({
          title: task.title,
          description: task.description,
          startDate: task.startDate,
          endDate: task.endDate,
          status: 'pending',
          goal: goal._id
        });
        
        const savedTask = await newTask.save();
        savedTasks.push(savedTask);
        taskMap[task.title] = savedTask._id;
      }
      
      // Second pass: Update tasks with dependencies
      for (let i = 0; i < tasks.length; i++) {
        const task = tasks[i];
        const savedTask = savedTasks[i];
        
        if (task.dependencies && task.dependencies.length > 0) {
          const dependencyIds = task.dependencies
            .map(depTitle => taskMap[depTitle])
            .filter(id => id); // Filter out any undefined dependencies
          
          savedTask.dependencies = dependencyIds;
          await savedTask.save();
        }
      }
      
      return res.status(201).json({
        message: 'Tasks generated successfully (using fallback)',
        goal: goal,
        tasks: savedTasks
      });
    }
    
  } catch (error) {
    console.error('Error generating tasks:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Function to generate tasks using Groq API with enhanced features
async function generateTasksWithGroq(goalText, deadline, category = 'other', priority = 'medium') {
  logger.info('🚀 Calling Groq API for enhanced task generation', { goalText, category, priority });
  
  // Check if API key exists
  if (!process.env.GROQ_API_KEY) {
    throw new Error('Groq API key not found in environment variables');
  }

  // Create an enhanced prompt for better task generation
  const prompt = `You are an expert project manager. Break down the following goal into comprehensive, actionable tasks with priorities and categories.

GOAL: ${goalText}
CATEGORY: ${category}
PRIORITY: ${priority}
${deadline ? `DEADLINE: ${deadline}` : 'DEADLINE: No specific deadline'}

Generate 5-8 detailed tasks in the following JSON format. Be comprehensive and realistic:

[
  {
    "title": "Specific, actionable task title",
    "description": "Detailed description with clear deliverables and acceptance criteria",
    "startDate": "ISO date string (start from today or logical sequence)",
    "endDate": "ISO date string (realistic timeline based on task complexity)",
    "priority": "low|medium|high|urgent (distribute logically)",
    "category": "planning|design|development|testing|deployment|marketing|other",
    "estimatedHours": "realistic hour estimate (1-40)",
    "dependencies": ["Exact titles of prerequisite tasks from this list"],
    "tags": ["relevant", "keyword", "tags"]
  }
]

Guidelines:
1. Create realistic timelines with proper task sequencing
2. Assign appropriate priorities (not all tasks should be high priority)
3. Include diverse categories relevant to the goal
4. Make dependencies logical (a task can only depend on tasks that appear before it in the list)
5. Estimate realistic hours (simple tasks: 1-4h, medium: 4-16h, complex: 16-40h)
6. Add relevant tags for better organization

Return ONLY the JSON array, no additional text or formatting.`;

  logger.info('📝 Sending enhanced prompt to Groq API');
  
  // Generate content with Groq
  const response = await groqClient.chat.completions.create({
    model: "llama-3.1-8b-instant",
    messages: [
      {
        role: "system",
        content: "You are an expert project manager and task breakdown specialist. Always respond with valid JSON arrays only. Be thorough and realistic in your task planning."
      },
      {
        role: "user",
        content: prompt
      }
    ],
    temperature: 0.8, // Slightly higher for more creative task breakdown
    max_tokens: 3000 // More tokens for detailed descriptions
  });
  
  const text = response.choices[0].message.content;
  logger.info('✅ Received enhanced response from Groq API', { 
    responseLength: text.length,
    preview: text.substring(0, 200) + '...' 
  });
  
  // Extract JSON from the response
  let jsonMatch = text.match(/\[\s*\{.*\}\s*\]/s);
  if (!jsonMatch) {
    throw new Error('Failed to parse JSON from Gemini response');
  }
  
  try {
    // Parse the JSON array of tasks
    const tasks = JSON.parse(jsonMatch[0]);
    
    // Validate and enhance task data
    const enhancedTasks = tasks.map((task, index) => {
      // Ensure all required fields exist with defaults
      return {
        title: task.title || `Task ${index + 1}`,
        description: task.description || 'No description provided',
        startDate: task.startDate || new Date().toISOString(),
        endDate: task.endDate || new Date(Date.now() + 7*24*60*60*1000).toISOString(),
        priority: ['low', 'medium', 'high', 'urgent'].includes(task.priority) ? task.priority : 'medium',
        category: ['planning', 'design', 'development', 'testing', 'deployment', 'marketing', 'other'].includes(task.category) ? task.category : 'other',
        estimatedHours: Math.max(1, Math.min(40, task.estimatedHours || 4)),
        dependencies: Array.isArray(task.dependencies) ? task.dependencies : [],
        tags: Array.isArray(task.tags) ? task.tags : []
      };
    });
    
    logger.info('🎯 Successfully parsed and enhanced tasks from Groq API', { 
      taskCount: enhancedTasks.length,
      priorities: enhancedTasks.reduce((acc, task) => {
        acc[task.priority] = (acc[task.priority] || 0) + 1;
        return acc;
      }, {}),
      categories: enhancedTasks.reduce((acc, task) => {
        acc[task.category] = (acc[task.category] || 0) + 1;
        return acc;
      }, {})
    });
    
    return enhancedTasks;
  } catch (error) {
    logger.error('❌ Error parsing Groq response:', error);
    logger.error('📄 Raw response text:', text);
    throw new Error(`Failed to parse tasks from Groq response: ${error.message}`);
  }
}

// Function to generate tasks locally based on common patterns
function generateLocalTasks(goalText, deadline) {
  // Default dates
  const today = new Date();
  const oneWeekLater = new Date(today);
  oneWeekLater.setDate(today.getDate() + 7);
  
  const twoWeeksLater = new Date(today);
  twoWeeksLater.setDate(today.getDate() + 14);
  
  const threeWeeksLater = new Date(today);
  threeWeeksLater.setDate(today.getDate() + 21);
  
  // If deadline is provided, adjust dates accordingly
  let endDate = threeWeeksLater;
  if (deadline) {
    endDate = new Date(deadline);
  }
  
  // Generate tasks based on common project patterns
  const lowerGoal = goalText.toLowerCase();
  
  if (lowerGoal.includes('app') || lowerGoal.includes('application') || lowerGoal.includes('software')) {
    return [
      {
        title: "Requirements Analysis",
        description: "Define the requirements and specifications for the application",
        startDate: today.toISOString(),
        endDate: new Date(today.getTime() + 3*24*60*60*1000).toISOString(),
        dependencies: []
      },
      {
        title: "Design UI/UX",
        description: "Create wireframes and design the user interface",
        startDate: new Date(today.getTime() + 3*24*60*60*1000).toISOString(),
        endDate: new Date(today.getTime() + 7*24*60*60*1000).toISOString(),
        dependencies: ["Requirements Analysis"]
      },
      {
        title: "Develop Backend",
        description: "Implement server-side logic and database",
        startDate: new Date(today.getTime() + 7*24*60*60*1000).toISOString(),
        endDate: new Date(today.getTime() + 14*24*60*60*1000).toISOString(),
        dependencies: ["Requirements Analysis"]
      },
      {
        title: "Develop Frontend",
        description: "Implement client-side features and UI components",
        startDate: new Date(today.getTime() + 7*24*60*60*1000).toISOString(),
        endDate: new Date(today.getTime() + 14*24*60*60*1000).toISOString(),
        dependencies: ["Design UI/UX"]
      },
      {
        title: "Integration",
        description: "Connect frontend and backend components",
        startDate: new Date(today.getTime() + 14*24*60*60*1000).toISOString(),
        endDate: new Date(today.getTime() + 17*24*60*60*1000).toISOString(),
        dependencies: ["Develop Backend", "Develop Frontend"]
      },
      {
        title: "Testing",
        description: "Perform unit and integration testing",
        startDate: new Date(today.getTime() + 17*24*60*60*1000).toISOString(),
        endDate: new Date(today.getTime() + 20*24*60*60*1000).toISOString(),
        dependencies: ["Integration"]
      },
      {
        title: "Deployment",
        description: "Deploy the application to production",
        startDate: new Date(today.getTime() + 20*24*60*60*1000).toISOString(),
        endDate: new Date(today.getTime() + 21*24*60*60*1000).toISOString(),
        dependencies: ["Testing"]
      }
    ];
  } else if (lowerGoal.includes('website') || lowerGoal.includes('web')) {
    return [
      {
        title: "Content Planning",
        description: "Plan the content and structure of the website",
        startDate: today.toISOString(),
        endDate: new Date(today.getTime() + 3*24*60*60*1000).toISOString(),
        dependencies: []
      },
      {
        title: "Design Mockups",
        description: "Create visual designs and mockups",
        startDate: new Date(today.getTime() + 3*24*60*60*1000).toISOString(),
        endDate: new Date(today.getTime() + 7*24*60*60*1000).toISOString(),
        dependencies: ["Content Planning"]
      },
      {
        title: "HTML/CSS Development",
        description: "Implement the frontend structure and styling",
        startDate: new Date(today.getTime() + 7*24*60*60*1000).toISOString(),
        endDate: new Date(today.getTime() + 12*24*60*60*1000).toISOString(),
        dependencies: ["Design Mockups"]
      },
      {
        title: "JavaScript Functionality",
        description: "Add interactive features and functionality",
        startDate: new Date(today.getTime() + 12*24*60*60*1000).toISOString(),
        endDate: new Date(today.getTime() + 16*24*60*60*1000).toISOString(),
        dependencies: ["HTML/CSS Development"]
      },
      {
        title: "Testing",
        description: "Test the website on different browsers and devices",
        startDate: new Date(today.getTime() + 16*24*60*60*1000).toISOString(),
        endDate: new Date(today.getTime() + 19*24*60*60*1000).toISOString(),
        dependencies: ["JavaScript Functionality"]
      },
      {
        title: "Deployment",
        description: "Launch the website on a hosting platform",
        startDate: new Date(today.getTime() + 19*24*60*60*1000).toISOString(),
        endDate: new Date(today.getTime() + 21*24*60*60*1000).toISOString(),
        dependencies: ["Testing"]
      }
    ];
  } else {
    // Default generic project tasks
    return [
      {
        title: "Research",
        description: "Research and gather information about the project",
        startDate: today.toISOString(),
        endDate: new Date(today.getTime() + 5*24*60*60*1000).toISOString(),
        dependencies: []
      },
      {
        title: "Planning",
        description: "Create a detailed plan with milestones",
        startDate: new Date(today.getTime() + 5*24*60*60*1000).toISOString(),
        endDate: new Date(today.getTime() + 8*24*60*60*1000).toISOString(),
        dependencies: ["Research"]
      },
      {
        title: "Implementation Phase 1",
        description: "Begin implementing the core components",
        startDate: new Date(today.getTime() + 8*24*60*60*1000).toISOString(),
        endDate: new Date(today.getTime() + 13*24*60*60*1000).toISOString(),
        dependencies: ["Planning"]
      },
      {
        title: "Implementation Phase 2",
        description: "Continue implementation with additional features",
        startDate: new Date(today.getTime() + 13*24*60*60*1000).toISOString(),
        endDate: new Date(today.getTime() + 18*24*60*60*1000).toISOString(),
        dependencies: ["Implementation Phase 1"]
      },
      {
        title: "Review and Testing",
        description: "Review the work and test for quality",
        startDate: new Date(today.getTime() + 18*24*60*60*1000).toISOString(),
        endDate: new Date(today.getTime() + 20*24*60*60*1000).toISOString(),
        dependencies: ["Implementation Phase 2"]
      },
      {
        title: "Finalization",
        description: "Finalize the project and prepare for delivery",
        startDate: new Date(today.getTime() + 20*24*60*60*1000).toISOString(),
        endDate: new Date(today.getTime() + 21*24*60*60*1000).toISOString(),
        dependencies: ["Review and Testing"]
      }
    ];
  }
}

// Get all goals
exports.getGoals = async (req, res) => {
  try {
    const goals = await Goal.find().sort({ createdAt: -1 });
    res.json(goals);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get a goal with its tasks
exports.getGoalWithTasks = async (req, res) => {
  try {
    const goal = await Goal.findById(req.params.id);
    if (!goal) {
      return res.status(404).json({ message: 'Goal not found' });
    }

    const tasks = await Task.find({ goal: goal._id });
    res.json({ goal, tasks });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * @swagger
 * /api/tasks/{id}/status:
 *   patch:
 *     summary: Update task status
 *     tags: [Tasks]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [pending, in-progress, completed, blocked, cancelled]
 *               progress:
 *                 type: number
 *                 minimum: 0
 *                 maximum: 100
 */
exports.updateTaskStatus = async (req, res) => {
  const requestId = await generateId();
  
  try {
    const { status, progress } = req.body;
    const { id } = req.params;
    
    logger.info('Updating task status', { requestId, taskId: id, status, progress });
    
    if (!status) {
      return res.status(400).json({ 
        success: false,
        message: 'Status is required',
        requestId 
      });
    }

    const updateData = { status };
    if (progress !== undefined) {
      updateData.progress = Math.min(Math.max(progress, 0), 100);
    }
    
    // Auto-set progress based on status
    if (status === 'completed' && progress === undefined) {
      updateData.progress = 100;
    }

    const task = await Task.findByIdAndUpdate(id, updateData, { new: true })
      .populate('goal', 'title category priority');

    if (!task) {
      logger.warn('Task not found for status update', { requestId, taskId: id });
      return res.status(404).json({ 
        success: false,
        message: 'Task not found',
        requestId 
      });
    }

    logger.info('Task status updated successfully', { requestId, taskId: id });

    res.json({
      success: true,
      message: 'Task status updated successfully',
      requestId,
      data: task
    });
  } catch (error) {
    logger.logError(error, { requestId, taskId: req.params.id });
    res.status(500).json({ 
      success: false,
      message: 'Server error', 
      requestId,
      error: error.message 
    });
  }
};

/**
 * @swagger
 * /api/tasks/{id}:
 *   put:
 *     summary: Update a task
 *     tags: [Tasks]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Task'
 */
exports.updateTask = async (req, res) => {
  const requestId = await generateId();
  
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    logger.info('Updating task', { requestId, taskId: id, updates: Object.keys(updateData) });
    
    // Remove fields that shouldn't be updated directly
    delete updateData.goal;
    delete updateData._id;
    delete updateData.createdAt;
    delete updateData.updatedAt;

    const task = await Task.findByIdAndUpdate(id, updateData, { 
      new: true, 
      runValidators: true 
    }).populate('goal', 'title category priority');

    if (!task) {
      return res.status(404).json({ 
        success: false,
        message: 'Task not found',
        requestId 
      });
    }

    logger.info('Task updated successfully', { requestId, taskId: id });

    res.json({
      success: true,
      message: 'Task updated successfully',
      requestId,
      data: task
    });
  } catch (error) {
    logger.logError(error, { requestId, taskId: req.params.id });
    res.status(500).json({ 
      success: false,
      message: 'Server error', 
      requestId,
      error: error.message 
    });
  }
};

/**
 * @swagger
 * /api/tasks/{id}:
 *   delete:
 *     summary: Delete a task
 *     tags: [Tasks]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 */
exports.deleteTask = async (req, res) => {
  const requestId = await generateId();
  
  try {
    const { id } = req.params;
    
    logger.info('Deleting task', { requestId, taskId: id });

    const task = await Task.findById(id);
    if (!task) {
      return res.status(404).json({ 
        success: false,
        message: 'Task not found',
        requestId 
      });
    }

    // Remove this task from dependencies of other tasks
    await Task.updateMany(
      { dependencies: id },
      { $pull: { dependencies: id } }
    );

    await Task.findByIdAndDelete(id);

    // Update goal task count
    const goal = await Goal.findById(task.goal);
    if (goal) {
      goal.taskCount = Math.max(0, goal.taskCount - 1);
      await goal.save();
    }

    logger.info('Task deleted successfully', { requestId, taskId: id });

    res.json({
      success: true,
      message: 'Task deleted successfully',
      requestId
    });
  } catch (error) {
    logger.logError(error, { requestId, taskId: req.params.id });
    res.status(500).json({ 
      success: false,
      message: 'Server error', 
      requestId,
      error: error.message 
    });
  }
};

/**
 * @swagger
 * /api/goals/{id}:
 *   delete:
 *     summary: Delete a goal and all its tasks
 *     tags: [Goals]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 */
exports.deleteGoal = async (req, res) => {
  const requestId = await generateId();
  
  try {
    const { id } = req.params;
    
    logger.info('Deleting goal and all tasks', { requestId, goalId: id });

    const goal = await Goal.findById(id);
    if (!goal) {
      return res.status(404).json({ 
        success: false,
        message: 'Goal not found',
        requestId 
      });
    }

    // Delete all tasks associated with this goal
    const taskDeleteResult = await Task.deleteMany({ goal: id });
    
    // Delete the goal
    await Goal.findByIdAndDelete(id);

    logger.info('Goal and tasks deleted successfully', { 
      requestId, 
      goalId: id, 
      deletedTasks: taskDeleteResult.deletedCount 
    });

    res.json({
      success: true,
      message: 'Goal and all associated tasks deleted successfully',
      requestId,
      data: {
        deletedTasks: taskDeleteResult.deletedCount
      }
    });
  } catch (error) {
    logger.logError(error, { requestId, goalId: req.params.id });
    res.status(500).json({ 
      success: false,
      message: 'Server error', 
      requestId,
      error: error.message 
    });
  }
};

/**
 * @swagger
 * /api/dashboard/analytics:
 *   get:
 *     summary: Get dashboard analytics
 *     tags: [Dashboard]
 */
exports.getDashboardAnalytics = async (req, res) => {
  const requestId = await generateId();
  
  try {
    logger.info('Fetching dashboard analytics', { requestId });

    const [
      totalGoals,
      activeGoals,
      completedGoals,
      totalTasks,
      completedTasks,
      overdueTasks,
      tasksByPriority,
      tasksByStatus,
      goalsByCategory
    ] = await Promise.all([
      Goal.countDocuments(),
      Goal.countDocuments({ status: 'active' }),
      Goal.countDocuments({ status: 'completed' }),
      Task.countDocuments(),
      Task.countDocuments({ status: 'completed' }),
      Task.countDocuments({ 
        endDate: { $lt: new Date() }, 
        status: { $nin: ['completed', 'cancelled'] } 
      }),
      Task.aggregate([
        { $group: { _id: '$priority', count: { $sum: 1 } } }
      ]),
      Task.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]),
      Goal.aggregate([
        { $group: { _id: '$category', count: { $sum: 1 } } }
      ])
    ]);

    const analytics = {
      overview: {
        totalGoals,
        activeGoals,
        completedGoals,
        totalTasks,
        completedTasks,
        overdueTasks,
        completionRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0
      },
      tasksByPriority: tasksByPriority.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {}),
      tasksByStatus: tasksByStatus.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {}),
      goalsByCategory: goalsByCategory.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {})
    };

    logger.info('Dashboard analytics fetched successfully', { requestId });

    res.json({
      success: true,
      requestId,
      data: analytics
    });
  } catch (error) {
    logger.logError(error, { requestId });
    res.status(500).json({ 
      success: false,
      message: 'Server error', 
      requestId,
      error: error.message 
    });
  }
};