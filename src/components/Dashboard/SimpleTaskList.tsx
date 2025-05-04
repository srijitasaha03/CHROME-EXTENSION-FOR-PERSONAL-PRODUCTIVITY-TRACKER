import React, { useState } from 'react';
import { useTaskManager } from '@/hooks/useSimpleTaskManager';

const TaskList = () => {
  const { tasks, isLoading, addTask, toggleTaskCompletion, deleteTask } = useTaskManager();
  const [newTaskTitle, setNewTaskTitle] = useState('');

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTaskTitle.trim()) {
      addTask(newTaskTitle.trim());
      setNewTaskTitle('');
    }
  };

  if (isLoading) {
    return <div>Loading tasks...</div>;
  }

  return (
    <div>
      <form onSubmit={handleAddTask} className="flex mb-3">
        <input
          type="text"
          value={newTaskTitle}
          onChange={(e) => setNewTaskTitle(e.target.value)}
          placeholder="Add a new task"
          className="border rounded p-1 flex-1 mr-2"
        />
        <button 
          type="submit" 
          disabled={!newTaskTitle.trim()}
          className="bg-blue-500 text-white px-2 py-1 rounded"
        >
          Add
        </button>
      </form>

      <div className="space-y-2">
        {tasks.length === 0 ? (
          <div className="text-gray-500 text-center py-2">No tasks yet. Add one above!</div>
        ) : (
          <ul className="space-y-2">
            {tasks.map((task) => (
              <li key={task.id} className="flex items-center border p-2 rounded">
                <input
                  type="checkbox"
                  checked={task.completed}
                  onChange={() => toggleTaskCompletion(task.id)}
                  className="mr-3"
                />
                <span 
                  className={task.completed ? "line-through text-gray-500 flex-1" : "flex-1"}
                >
                  {task.title}
                </span>
                <button 
                  onClick={() => deleteTask(task.id)}
                  className="text-red-500 ml-2"
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default TaskList;
