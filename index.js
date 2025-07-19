
    // Theme toggle
    const toggleTheme = document.querySelector('.theme-controller');
    toggleTheme.addEventListener('change', function () {
      const isDark = toggleTheme.checked;
      document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
      localStorage.setItem('theme', isDark ? 'dark' : 'light');
    });
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    toggleTheme.checked = savedTheme === 'dark';

    const taskForm = document.getElementById('task-form');
    const searchInput = document.getElementById('search');
    const filterStatus = document.getElementById('filter-status');
    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    let editTaskId = null;

    function saveTasks() {
      localStorage.setItem('tasks', JSON.stringify(tasks));
      renderTasks();
    }

    function renderTasks() {
      const searchText = searchInput.value.toLowerCase();
      const statusFilter = filterStatus.value;
      ['pending', 'in-progress', 'done'].forEach(status => {
        const taskContainer = document.getElementById(`${status}-tasks`);
        taskContainer.innerHTML = '';
        tasks.filter(task =>
          task.status === status &&
          (statusFilter === 'all' || statusFilter === task.status) &&
          (task.title.toLowerCase().includes(searchText) || task.desc.toLowerCase().includes(searchText))
        ).forEach(task => {
          const taskCard = document.createElement('div');
          taskCard.className = "bg-base-100 p-2 mb-2 rounded shadow cursor-move";
          taskCard.draggable = true;
          taskCard.innerHTML = `
            <h3 class="font-bold">${task.title}</h3>
            <p class="text-sm">${task.desc}</p>
            <p class="text-xs italic">${task.category}</p>
            <div class="flex justify-end gap-2 mt-2">
              <button onclick="editTask('${task.id}')" class="text-blue-600">Edit</button>
              <button onclick="deleteTask('${task.id}')" class="text-red-600">Delete</button>
            </div>
          `;
          taskCard.addEventListener('dragstart', e => {
            e.dataTransfer.setData('text/plain', task.id);
          });
          taskContainer.appendChild(taskCard);
        });
      });
    }

    taskForm.addEventListener('submit', e => {
      e.preventDefault();
      const title = document.getElementById('task-title').value.trim();
      const desc = document.getElementById('task-desc').value.trim();
      const category = document.getElementById('task-category').value;
      if (!title) return;
      tasks.push({ id: Date.now().toString(), title, desc, category, status: 'pending' });
      saveTasks();
      taskForm.reset();
    });

    function deleteTask(id) {
      tasks = tasks.filter(task => task.id !== id);
      saveTasks();
      const modal = document.getElementById('delete_modal');
      if (modal && typeof modal.showModal === 'function') {
        modal.showModal();
      }
    }

    function editTask(id) {
      const task = tasks.find(t => t.id === id);
      if (!task) return;
      editTaskId = id;
      document.getElementById('edit-title').value = task.title;
      document.getElementById('edit-desc').value = task.desc;
      const modal = document.getElementById('edit_modal');
      if (modal && typeof modal.showModal === 'function') {
        modal.showModal();
      }
    }

    document.getElementById('edit-form').addEventListener('submit', function (e) {
      e.preventDefault();
      const updatedTitle = document.getElementById('edit-title').value.trim();
      const updatedDesc = document.getElementById('edit-desc').value.trim();
      const task = tasks.find(t => t.id === editTaskId);
      if (!task) return;
      task.title = updatedTitle;
      task.desc = updatedDesc;
      saveTasks();
      document.getElementById('edit_modal').close();
    });

    document.querySelectorAll('.task-list').forEach(container => {
      container.addEventListener('dragover', e => e.preventDefault());
      container.addEventListener('drop', e => {
        e.preventDefault();
        const id = e.dataTransfer.getData('text/plain');
        const task = tasks.find(t => t.id === id);
        task.status = container.parentElement.dataset.status;
        saveTasks();
      });
    });

    searchInput.addEventListener('input', renderTasks);
    filterStatus.addEventListener('change', renderTasks);
    renderTasks();
  
