import { useState, useEffect } from 'react';
import { Task } from '@/utils/mockData';

export const useTaskManager = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Fetch tasks from storage
    const fetchTasks = async () => {
      try {
        // Try to load from localStorage first
        const storedTasks = localStorage.getItem('simpletrack-tasks');
        
        if (storedTasks) {
          // Parse stored tasks and convert date strings back to Date objects
          const parsedTasks = JSON.parse(storedTasks).map((task: any) => ({
            ...task,
            createdAt: new Date(task.createdAt),
          }));
          setTasks(parsedTasks);
        } else {
          // Use empty array as fallback
          setTasks([]);
        }
      } catch (error) {
        console.error('Error loading tasks:', error);
        setTasks([]); // Fallback to empty array
      } finally {
        setIsLoading(false);
      }
    };

    fetchTasks();
  }, []);

  // Save tasks to localStorage
  const saveTasks = (updatedTasks: Task[]) => {
    localStorage.setItem('simpletrack-tasks', JSON.stringify(updatedTasks));
  };

  // Add a new task
  const addTask = (title: string) => {
    const newTask: Task = {
      id: Date.now().toString(),
      title,
      completed: false,
      createdAt: new Date(),
      priority: 'medium',
    };
    
    const updatedTasks = [...tasks, newTask];
    setTasks(updatedTasks);
    saveTasks(updatedTasks);
    
    // Update today's tasks completed count in Chrome storage
    const updateTasksCompleted = () => {
      if (window.chrome?.storage?.local) {
        window.chrome.storage.local.get(['simpletrack-data'], function(result) {
          if (result['simpletrack-data']) {
            const today = new Date().toISOString().split('T')[0];
            if (result['simpletrack-data'][today]) {
              result['simpletrack-data'][today].tasksCompleted = 
                (result['simpletrack-data'][today].tasksCompleted || 0);
              window.chrome.storage.local.set({'simpletrack-data': result['simpletrack-data']});
            }
          }
        });
      }
    };
    
    updateTasksCompleted();
  };

  // Toggle task completion
  const toggleTaskCompletion = (id: string) => {
    const updatedTasks = tasks.map(task => {
      if (task.id === id) {
        const wasCompleted = task.completed;
        
        // Update today's tasks completed count in Chrome storage
        const updateTasksCompleted = (increment: boolean) => {
          if (window.chrome?.storage?.local) {
            window.chrome.storage.local.get(['simpletrack-data'], function(result) {
              if (result['simpletrack-data']) {
                const today = new Date().toISOString().split('T')[0];
                if (result['simpletrack-data'][today]) {
                  result['simpletrack-data'][today].tasksCompleted = 
                    (result['simpletrack-data'][today].tasksCompleted || 0) + (increment ? 1 : -1);
                  window.chrome.storage.local.set({'simpletrack-data': result['simpletrack-data']});
                }
              }
            });
          }
        };
        
        // Only update the count if the task is being completed or uncompleted
        if (!wasCompleted) {
          updateTasksCompleted(true);
        } else {
          updateTasksCompleted(false);
        }
        
        return { ...task, completed: !task.completed };
      }
      return task;
    });
    
    setTasks(updatedTasks);
    saveTasks(updatedTasks);
  };

  // Delete a task
  const deleteTask = (id: string) => {
    const taskToDelete = tasks.find(task => task.id === id);
    const updatedTasks = tasks.filter(task => task.id !== id);
    
    setTasks(updatedTasks);
    saveTasks(updatedTasks);
    
    // If deleting a completed task, decrement the completed count
    if (taskToDelete?.completed && window.chrome?.storage?.local) {
      window.chrome.storage.local.get(['simpletrack-data'], function(result) {
        if (result['simpletrack-data']) {
          const today = new Date().toISOString().split('T')[0];
          if (result['simpletrack-data'][today] && result['simpletrack-data'][today].tasksCompleted > 0) {
            result['simpletrack-data'][today].tasksCompleted--;
            window.chrome.storage.local.set({'simpletrack-data': result['simpletrack-data']});
          }
        }
      });
    }
  };

  return {
    tasks,
    isLoading,
    addTask,
    toggleTaskCompletion,
    deleteTask
  };
};
