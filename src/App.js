import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Tasks from './components/Tasks';
import AddTask from './components/AddTask';
import About from './components/About';

function App() {
  const [showAddTask, setShowAddTask] = useState(false);
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    const getTasks = async () => {
      const tasksFromServer = await fetchTasks();
      setTasks(tasksFromServer);
    }
    getTasks();
  }, [])

  // Fetch Tasks
  const fetchTasks = async () => {
    const res = await fetch('http://localhost:5000/tasks');
    const data = await res.json();
    return data;
  }

  // Fetch Task
  const fetchTask = async (id) => {
    const res = await fetch(`http://localhost:5000/tasks/${id}`);
    const data = await res.json();
    return data;
  }

  // Add Task
  const addTask = async (task) => {
    const res = await fetch('http://localhost:5000/tasks/', {
      method: 'POST',
      headers: {
        'Content-type': 'application/json'
      },
      body: JSON.stringify(task),
    })

    const newTask = await res.json();
    setTasks([...tasks, newTask])
  }

  // Delete Task
  const deleteTask = async (id) => {
    await fetch(`http://localhost:5000/tasks/${id}`, {
      method: 'DELETE'
    })

    setTasks(tasks.filter(task => task.id !== id))
  }

  // Toggle Reminder
  const toggleReminder = async (id) => {
    // receives the double-clicked task to toggle, by id
    const taskToToggle = await fetchTask(id);
    // updates task by toggling the boolean value of reminder
    const updatedTask = { ...taskToToggle, reminder: !taskToToggle.reminder };
    // sends the updated task back to the server using a PUT request
    const res = await fetch(`http://localhost:5000/tasks/${id}`, {
      method: 'PUT',
      headers: {
        'Content-type': 'application/json'
      }, // converts the JSON object response to a string
      body: JSON.stringify(updatedTask)
    });
    // awaits the response returned from json()
    const toggledTask = await res.json();

    setTasks(
      tasks.map(task => // set the reminder to the value of the updated task 
        task.id === id ? { ...task, reminder: toggledTask.reminder } : task
      )
    )
  }

  return (
    <Router>
      <div className="container">
        <Header 
          onAdd={() => setShowAddTask(!showAddTask)}
          showAdd={showAddTask} 
        />
        <Routes>
          <Route path='/' exact element={
            <>
              {showAddTask && <AddTask onAdd={addTask} />}
              {tasks.length > 0 ? 
                <Tasks tasks={tasks} onDelete={deleteTask} onToggle={toggleReminder} /> : 
                'No tasks left!'
              }
            </>
          } />
        </Routes>
        <Routes>
          <Route path='/about' element={<About/>}/>
        </Routes>
        <Footer/>
      </div>
    </Router>
  );
}

export default App;
