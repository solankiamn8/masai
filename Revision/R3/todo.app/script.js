const taskInput = document.getElementById("taskInput");
const addTaskBtn = document.getElementById("addTaskBtn");
const taskList = document.getElementById("taskList");
const clearCompletedBtn = document.getElementById("clearCompletedBtn");

addTaskBtn.addEventListener("click", addTask);
taskInput.addEventListener("keypress", function(e) {
  if (e.key === "Enter") {
    addTask();
  }
});

function addTask() {
  const taskText = taskInput.value.trim();
  if (taskText === "") return;

  const li = document.createElement("li");

  // Task text
  const span = document.createElement("span");
  span.textContent = taskText;
  span.addEventListener("click", () => {
    li.classList.toggle("completed");
    toggleClearBtn();
  });

  // Delete button
  const delBtn = document.createElement("button");
  delBtn.textContent = "Delete";
  delBtn.classList.add("delete-btn");
  delBtn.addEventListener("click", () => {
    li.remove();
    toggleClearBtn();
  });

  li.appendChild(span);
  li.appendChild(delBtn);
  taskList.appendChild(li);

  taskInput.value = "";
  toggleClearBtn();
}

// Bonus: Clear all completed tasks
clearCompletedBtn.addEventListener("click", () => {
  const completedTasks = document.querySelectorAll("li.completed");
  completedTasks.forEach(task => task.remove());
  toggleClearBtn();
});

function toggleClearBtn() {
  const anyCompleted = document.querySelectorAll("li.completed").length > 0;
  clearCompletedBtn.classList.toggle("hidden", !anyCompleted);
}
