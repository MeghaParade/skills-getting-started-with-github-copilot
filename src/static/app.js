document.addEventListener("DOMContentLoaded", () => {
  const activitiesList = document.getElementById("activities-list");
  const activitySelect = document.getElementById("activity");
  const signupForm = document.getElementById("signup-form");
  const messageDiv = document.getElementById("message");

  // Function to fetch activities from API
  async function fetchActivities() {
    try {
      const response = await fetch("/activities");
      const activities = await response.json();

      // Clear loading message
      activitiesList.innerHTML = "";

      // Populate activities list
      Object.entries(activities).forEach(([name, details]) => {
        const activityCard = document.createElement("div");
        activityCard.className = "activity-card";

        const spotsLeft = details.max_participants - details.participants.length;

        // Create participants section
        let participantsSection = `
          <div class="participants-section">
            <strong>Participants:</strong>
            ${
              details.participants.length > 0
                ? `<ul class="participants-list" style="list-style-type: none; margin-left: 0; padding-left: 0;">
                    ${details.participants
                      .map(
                        (participant) =>
                          `<li class="participant-item" style="display: flex; align-items: center;">
                            <span>${participant}</span>
                            <span class="delete-participant" title="Remove participant" data-activity="${name}" data-email="${participant}" style="cursor:pointer; color:#d32f2f; margin-left:8px; font-size:1.1em;">&#128465;</span>
                          </li>`
                      )
                      .join("")}
                  </ul>`
                : `<span class="no-participants">No participants yet.</span>`
            }
          </div>
        `;

        activityCard.innerHTML = `
          <h4>${name}</h4>
          <p>${details.description}</p>
          <p><strong>Schedule:</strong> ${details.schedule}</p>
          <p><strong>Availability:</strong> ${spotsLeft} spots left</p>
          ${participantsSection}
        `;

        activitiesList.appendChild(activityCard);

        // Add option to select dropdown
        const option = document.createElement("option");
        option.value = name;
        option.textContent = name;
        activitySelect.appendChild(option);
      });

      // Add some quick inline styles for prettiness
      const style = document.createElement("style");
      style.textContent = `
        .participants-section {
          margin-top: 1em;
          padding: 0.5em 0.8em;
          background: #f6f8fa;
          border-radius: 6px;
          border: 1px solid #e3e6ea;
        }
        .participants-section strong {
          display: block;
          margin-bottom: 0.3em;
          color: #1a237e;
        }
        .participants-list {
          margin: 0.5em 0 0 0;
          padding: 0;
          list-style-type: none;
        }
        .participant-item {
          margin-bottom: 0.2em;
          color: #2d4a6a;
          font-size: 0.97em;
        }
        .delete-participant {
          margin-left: 8px;
          cursor: pointer;
          color: #d32f2f;
          transition: color 0.2s;
        }
        .delete-participant:hover {
          color: #b71c1c;
        }
        .no-participants {
          color: #888;
          font-style: italic;
        }
      `;
      document.head.appendChild(style);
    } catch (error) {
      activitiesList.innerHTML = "<p>Failed to load activities. Please try again later.</p>";
      console.error("Error fetching activities:", error);
    }
  }

  // Handle participant delete (event delegation)
  activitiesList.addEventListener("click", async (event) => {
    if (event.target.classList.contains("delete-participant")) {
      const activity = event.target.getAttribute("data-activity");
      const email = event.target.getAttribute("data-email");
      if (confirm(`Remove ${email} from ${activity}?`)) {
        try {
          const response = await fetch(`/activities/${encodeURIComponent(activity)}/unregister?email=${encodeURIComponent(email)}`, {
            method: "POST"
          });
          const result = await response.json();
          if (response.ok) {
            messageDiv.textContent = result.message;
            messageDiv.className = "success";
            fetchActivities();
          } else {
            messageDiv.textContent = result.detail || "An error occurred";
            messageDiv.className = "error";
          }
          messageDiv.classList.remove("hidden");
          setTimeout(() => { messageDiv.classList.add("hidden"); }, 5000);
        } catch (error) {
          messageDiv.textContent = "Failed to remove participant. Please try again.";
          messageDiv.className = "error";
          messageDiv.classList.remove("hidden");
          console.error("Error removing participant:", error);
        }
      }
    }
  });

  // Handle form submission
  signupForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const activity = document.getElementById("activity").value;

    try {
      const response = await fetch(
        `/activities/${encodeURIComponent(activity)}/signup?email=${encodeURIComponent(email)}`,
        {
          method: "POST",
        }
      );

      const result = await response.json();

      if (response.ok) {
        messageDiv.textContent = result.message;
        messageDiv.className = "success";
        signupForm.reset();
        fetchActivities(); // Refresh activities list after signup
      } else {
        messageDiv.textContent = result.detail || "An error occurred";
        messageDiv.className = "error";
      }

      messageDiv.classList.remove("hidden");

      // Hide message after 5 seconds
      setTimeout(() => {
        messageDiv.classList.add("hidden");
      }, 5000);
    } catch (error) {
      messageDiv.textContent = "Failed to sign up. Please try again.";
      messageDiv.className = "error";
      messageDiv.classList.remove("hidden");
      console.error("Error signing up:", error);
    }
  });

  // Initialize app
  fetchActivities();
});
