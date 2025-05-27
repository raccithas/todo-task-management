"use client"

import { useState, useEffect } from "react"
import { ref, push, set, get, remove, update, onValue, off } from "firebase/database"
import TaskModal from "./TaskModal"
// import ProfileModal from "./ProfileModal"
import { database } from "../firebase"
import "./Dashboard.css"

const Dashboard = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState("My Day")
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [showTaskModal, setShowTaskModal] = useState(false)
  
  const [editingTask, setEditingTask] = useState(null)

  const tabs = ["My Day", "Important", "Planner"]

 

  // Fetch tasks from Firebase Realtime Database
  const fetchTasks = async () => {
    try {
      setLoading(true)
      const userId = user?.uid
      console.log(userId)
      const tasksRef = ref(database, `users/${userId}/tasks`)
      
      const snapshot = await get(tasksRef)
      
      if (snapshot.exists()) {
        const tasksData = snapshot.val()
        const fetchedTasks = Object.keys(tasksData).map(key => ({
          id: key,
          ...tasksData[key]
        }))
        
        // Sort by creation date (newest first)
        fetchedTasks.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))
        setTasks(fetchedTasks)
      } else {
        // If no tasks exist, initialize with sample data
        // await initializeSampleData()
        // Fetch again after initialization
        // const newSnapshot = await get(tasksRef)
        // if (newSnapshot.exists()) {
        //   const newTasksData = newSnapshot.val()
        //   const newTasks = Object.keys(newTasksData).map(key => ({
        //     id: key,
        //     ...newTasksData[key]
        //   }))
        //   newTasks.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))
        //   setTasks(newTasks)
        // } else {
        //   setTasks([])
        // }
      }
    } catch (error) {
      console.error("Error fetching tasks:", error)
      setTasks([])
    } finally {
      setLoading(false)
    }
  }

  // Set up real-time listener for tasks
  const setupTasksListener = () => {
    const userId = user?.uid
    const tasksRef = ref(database, `users/${userId}/tasks`)
    
    const unsubscribe = onValue(tasksRef, (snapshot) => {
      if (snapshot.exists()) {
        const tasksData = snapshot.val()
        const fetchedTasks = Object.keys(tasksData).map(key => ({
          id: key,
          ...tasksData[key]
        }))
        
        // Sort by creation date (newest first)
        fetchedTasks.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))
        setTasks(fetchedTasks)
      } else {
        setTasks([])
      }
      setLoading(false)
    }, (error) => {
      console.error("Error listening to tasks:", error)
      setLoading(false)
    })

    return unsubscribe
  }

  // Load tasks when component mounts or user changes
  useEffect(() => {
    console.log(user);
    let unsubscribe = null
    
    if (user?.uid) {
      // Set up real-time listener
      unsubscribe = setupTasksListener()
      
      // Also fetch initially in case listener doesn't fire immediately
      fetchTasks()
    }

    // Cleanup listener on unmount or user change
    return () => {
      if (unsubscribe) {
        unsubscribe()
      }
    }
  }, [user?.uid],[])

  const isTaskDelayed = (task) => {
    if (task.completed) return false
    const today = new Date()
    const dueDate = new Date(task.dueDate)
    today.setHours(0, 0, 0, 0)
    dueDate.setHours(0, 0, 0, 0)
    return dueDate < today
  }

  const filteredTasks = tasks.filter((task) => {
    if (activeTab === "Important") return task.type === "important"
    if (activeTab === "Planner") return task.type === "planned"
    
    return true // My Day shows all tasks
  })

  const pendingTasks = filteredTasks.filter((task) => !task.completed && !isTaskDelayed(task))
  const completedTasks = filteredTasks.filter((task) => task.completed)
  const delayedTasks = filteredTasks.filter((task) => isTaskDelayed(task))

  // Create new task in Firebase Realtime Database
  const handleCreateTask = async (taskData) => {
    try {
      const userId = user?.uid
      const tasksRef = ref(database, `users/${userId}/tasks`)
      
      const newTask = {
        ...taskData,
        createdAt: Date.now(),
      }
      
      // Use push to generate a unique key
      const newTaskRef = push(tasksRef)
      await set(newTaskRef, newTask)
      
      setShowTaskModal(false)
    } catch (error) {
      console.error("Error creating task:", error)
      alert("Failed to create task. Please try again.")
    }
  }

  // Update existing task in Firebase Realtime Database
  const handleEditTask = async (taskData) => {
    if (!editingTask) return

    try {
      const userId = user?.uid
      const taskRef = ref(database, `users/${userId}/tasks/${editingTask.id}`)
      
      const updatedData = {
        ...taskData,
        updatedAt: Date.now(),
        createdAt: editingTask.createdAt, // Preserve original creation time
      }
      
      await set(taskRef, updatedData)
      
      setEditingTask(null)
      setShowTaskModal(false)
    } catch (error) {
      console.error("Error updating task:", error)
      alert("Failed to update task. Please try again.")
    }
  }

  // Delete task from Firebase Realtime Database
  const handleDeleteTask = async (taskId) => {
    if (!window.confirm("Are you sure you want to delete this task?")) return

    try {
      const userId = user?.uid
      const taskRef = ref(database, `users/${userId}/tasks/${taskId}`)
      await remove(taskRef)
    } catch (error) {
      console.error("Error deleting task:", error)
      alert("Failed to delete task. Please try again.")
    }
  }

  // Toggle task completion status in Firebase Realtime Database
  const toggleTaskCompletion = async (taskId) => {
    try {
      const task = tasks.find((t) => t.id === taskId)
      if (!task) return

      const userId = user?.uid
      const taskRef = ref(database, `users/${userId}/tasks/${taskId}`)
      
      const updatedData = {
        ...task,
        completed: !task.completed,
        updatedAt: Date.now(),
      }
      
      await set(taskRef, updatedData)
    } catch (error) {
      console.error("Error toggling task completion:", error)
      alert("Failed to update task status. Please try again.")
    }
  }

  const openEditModal = (task) => {
    setEditingTask(task)
    setShowTaskModal(true)
  }

  const handleTabClick = (tab) => {
    setActiveTab(tab)
   
  }

  const renderContent = () => {
    if (activeTab === "Profile") {
      return (
        <div className="profile-content">
          <div className="profile-card">
            <div className="profile-avatar-large">{user?.avatar || "👤"}</div>
            <h2>{user?.name || "User"}</h2>
            <p className="profile-email">{user?.email}</p>
            {/* <button className="edit-profile-btn" onClick={() => setShowProfileModal(true)}>
              Edit Profile
            </button> */}
          </div>
        </div>
      )
    }

    if (loading) {
      return (
        <div className="loading-container">
          <div className="loading-spinner">Loading tasks...</div>
        </div>
      )
    }

    return (
      <div className="tasks-section">
        <div className="tasks-header">
          <h3>Tasks</h3>
          <button
            className="add-task-btn"
            onClick={() => {
              setEditingTask(null)
              setShowTaskModal(true)
            }}
          >
            ➕ Add Task
          </button>
        </div>

        {filteredTasks.length === 0 ? (
          <div className="empty-state">
            <p>No tasks found. Create your first task!</p>
          </div>
        ) : (
          <>
            <div className="tasks-list">
              {pendingTasks.map((task) => (
                <div key={task.id} className="task-card">
                  <div className="task-content">
                    <h4>{task.title}</h4>
                    {task.description && <p className="task-description">{task.description}</p>}
                    <div className="task-meta">
                      <span className={`task-type ${task.type}`}>{task.type}</span>
                      <span className="due-date">Due: {new Date(task.dueDate).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="task-actions">
                    <button className="task-complete" onClick={() => toggleTaskCompletion(task.id)}>
                      ⭕
                    </button>
                    <button className="task-edit" onClick={() => openEditModal(task)}>
                      ✏️
                    </button>
                    <button className="task-delete" onClick={() => handleDeleteTask(task.id)}>
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {completedTasks.length > 0 && (
              <div className="completed-section">
                <h3>Completed</h3>
                <div className="tasks-list">
                  {completedTasks.map((task) => (
                    <div key={task.id} className="task-card completed">
                      <div className="task-content">
                        <h4>{task.title}</h4>
                        {task.description && <p className="task-description">{task.description}</p>}
                        <div className="task-meta">
                          <span className={`task-type ${task.type}`}>{task.type}</span>
                        </div>
                      </div>
                      <div className="task-actions">
                        <button className="task-complete completed" onClick={() => toggleTaskCompletion(task.id)}>
                          ✅
                        </button>
                        <button className="task-delete" onClick={() => handleDeleteTask(task.id)}>
                          🗑️
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {delayedTasks.length > 0 && (
              <div className="delayed-section">
                <h3>Delayed Tasks</h3>
                <div className="tasks-list">
                  {delayedTasks.map((task) => (
                    <div key={task.id} className="task-card delayed">
                      <div className="task-content">
                        <h4>{task.title}</h4>
                        {task.description && <p className="task-description">{task.description}</p>}
                        <div className="task-meta">
                          <span className={`task-type ${task.type}`}>{task.type}</span>
                          <span className="due-date delayed">Due: {new Date(task.dueDate).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <div className="task-actions">
                        <button className="task-complete" onClick={() => toggleTaskCompletion(task.id)}>
                          ⭕
                        </button>
                        <button className="task-edit" onClick={() => openEditModal(task)}>
                          ✏️
                        </button>
                        <button className="task-delete" onClick={() => handleDeleteTask(task.id)}>
                          🗑️
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    )
  }

  return (
    <div className="dashboard">
      <div className="dashboard-container">
        {/* Desktop Sidebar */}
        <aside className="desktop-sidebar">
          <div className="sidebar-header">
            <div className="app-branding">
              <h1 className="app-name">Katomaran</h1>
              <p className="app-subtitle">ToDo App</p>
            </div>
            <div className="user-info">
              <div className="user-avatar">{"👤"}</div>
              <div className="user-details">
                <h2>{user?.name || "User"}</h2>
                <p>{user?.email}</p>
              </div>
            </div>
            <button className="logout-button" onClick={onLogout}>
              Logout
            </button>
          </div>

          <nav className="sidebar-nav">
            {tabs.map((tab) => (
              <button
                key={tab}
                className={`nav-item ${activeTab === tab ? "active" : ""}`}
                onClick={() => handleTabClick(tab)}
              >
                <span className="nav-icon">
                  {tab === "My Day" && "🏠"}
                  {tab === "Important" && "⭐"}
                  {tab === "Planner" && "📅"}
                  {/* {tab === "Profile" && "👤"} */}
                </span>
                {tab}
              </button>
            ))}
          </nav>

          <button
            className="sidebar-add-btn"
            onClick={() => {
              setEditingTask(null)
              setShowTaskModal(true)
            }}
          >
            ➕ Add New Task
          </button>
        </aside>

        {/* Mobile Header */}
        <header className="mobile-header">
          <div className="mobile-branding">
            <h1 className="app-name-mobile">Katomaran</h1>
            <div className="user-greeting">
              <span>Hello, {user?.name || "User"}</span>
            </div>
          </div>
          <div className="header-actions">
            <div className="user-avatar">{ "👤"}</div>
            <button className="logout-button" onClick={onLogout}>
              Logout
            </button>
          </div>
        </header>

        {/* Mobile Tabs */}
        <nav className="mobile-tabs">
          {tabs.map((tab) => (
            <button
              key={tab}
              className={`tab ${activeTab === tab ? "active" : ""}`}
              onClick={() => handleTabClick(tab)}
            >
              {tab}
            </button>
          ))}
        </nav>

        {/* Main Content */}
        <main className="dashboard-content">{renderContent()}</main>
      </div>

      {showTaskModal && (
        <TaskModal
          task={editingTask}
          onSave={editingTask ? handleEditTask : handleCreateTask}
          onClose={() => {
            setShowTaskModal(false)
            setEditingTask(null)
          }}
        />
      )}

      {/* {showProfileModal && (
        <ProfileModal user={user} onSave={onUpdateProfile} onClose={() => setShowProfileModal(false)} />
      )} */}
    </div>
  )
}

export default Dashboard