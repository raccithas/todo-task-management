"use client"

import { useState } from "react"
import "./ProfileModal.css"

const ProfileModal = ({ user, onSave, onClose }) => {
  const [name, setName] = useState(user?.name || "")
  const [email, setEmail] = useState(user?.email || "")
  const [phone, setPhone] = useState(user?.phone || "")
  const [bio, setBio] = useState(user?.bio || "")

  const handleSubmit = (e) => {
    e.preventDefault()

    if (!name.trim() || !email.trim()) {
      alert("Please fill in all required fields")
      return
    }

    const updatedUser = {
      ...user,
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      bio: bio.trim(),
    }

    onSave(updatedUser)
    onClose()
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Edit Profile</h2>
          <button className="close-button" onClick={onClose}>
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="profile-form">
          <div className="profile-avatar-section">
            <div className="profile-avatar-large">{user?.avatar || "👤"}</div>
            <button type="button" className="change-avatar-btn">
              Change Avatar
            </button>
          </div>

          <div className="profile-form-content">
            <div className="form-group">
              <label>Full Name</label>
              <input
                type="text"
                placeholder="Enter your full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label>Email Address</label>
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label>Phone Number</label>
              <input
                type="tel"
                placeholder="Enter your phone number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label>Bio</label>
              <textarea
                placeholder="Tell us about yourself"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="form-textarea"
                rows={4}
              />
            </div>
          </div>

          <div className="form-buttons">
            <button type="button" className="cancel-button" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="save-button">
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ProfileModal
