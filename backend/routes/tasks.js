const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');

/**
 * @swagger
 * components:
 *   schemas:
 *     Task:
 *       type: object
 *       required:
 *         - title
 *         - goal
 *       properties:
 *         title:
 *           type: string
 *           description: Task title
 *         description:
 *           type: string
 *           description: Task description
 *         priority:
 *           type: string
 *           enum: [low, medium, high, urgent]
 *         status:
 *           type: string
 *           enum: [pending, in-progress, completed, blocked, cancelled]
 *         category:
 *           type: string
 *           enum: [planning, design, development, testing, deployment, marketing, other]
 *     Goal:
 *       type: object
 *       required:
 *         - title
 *         - description
 *       properties:
 *         title:
 *           type: string
 *           description: Goal title
 *         description:
 *           type: string
 *           description: Goal description
 *         category:
 *           type: string
 *           enum: [business, personal, project, learning, health, other]
 *         priority:
 *           type: string
 *           enum: [low, medium, high, urgent]
 */

// AI Task Generation
router.post('/generate', taskController.generateTasks);

// Goals Management
router.get('/goals', taskController.getGoals);
router.get('/goals/:id', taskController.getGoalWithTasks);
router.delete('/goals/:id', taskController.deleteGoal);

// Tasks Management  
router.patch('/:id/status', taskController.updateTaskStatus);
router.put('/:id', taskController.updateTask);
router.delete('/:id', taskController.deleteTask);

// Analytics
router.get('/dashboard/analytics', taskController.getDashboardAnalytics);

module.exports = router;