"use client"

import { useState, useEffect } from "react"
import "./TaskModal.css"

const TaskModal = ({ task, onSave, onClose }) => {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [type, setType] = useState("important")
  const [dueDate, setDueDate] = useState("")

  useEffect(() => {
    if (task) {
      setTitle(task.title)
      setDescription(task.description || "")
      setType(task.type)
      setDueDate(task.dueDate)
    } else {
      // Set default due date to today
      setDueDate(new Date().toISOString().split("T")[0])
    }
  }, [task])

  const handleSubmit = (e) => {
    e.preventDefault()

    if (!title.trim() || !dueDate) {
      alert("Please fill in all required fields")
      return
    }

    const taskData = {
      title: title.trim(),
      description: description.trim(),
      type,
      dueDate,
      completed: false,
    }

    onSave(taskData)
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{task ? "Edit Task" : "Create a Task"}</h2>
          <button className="close-button" onClick={onClose}>
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="task-form">
          <div className="form-group">
            <label>Title</label>
            <input
              type="text"
              placeholder="Task Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label>Description (Optional)</label>
            <textarea
              placeholder="Task Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="form-textarea"
              rows={3}
            />
          </div>

          <div className="form-group">
            <label>Task Type</label>
            <div className="type-buttons">
              <button
                type="button"
                className={`type-button ${type === "important" ? "active" : ""}`}
                onClick={() => setType("important")}
              >
                ⭐ Important
              </button>
              <button
                type="button"
                className={`type-button ${type === "planned" ? "active" : ""}`}
                onClick={() => setType("planned")}
              >
                📅 Planned
              </button>
            </div>
          </div>

          <div className="form-group">
            <label>Due Date</label>
            <div className="date-input-wrapper">
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                required
                className="form-input"
              />
              <span className="input-icon">📅</span>
            </div>
          </div>

          <button type="submit" className="create-button">
            {task ? "Update" : "Create"}
          </button>
        </form>
      </div>
    </div>
  )
}

export default TaskModal
