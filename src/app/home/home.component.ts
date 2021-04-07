import { Component, OnInit } from '@angular/core';
import { forkJoin } from 'rxjs';
import { ApiService } from '../../services/api.service';
@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent implements OnInit {
  users: any = [];
  tasks: any = [];
  tasksClone: any = [];
  highPriorityTasks: any = [];
  mediumPriorityTasks: any = [];
  lowPriorityTasks: any = [];
  userTestImg: any;
  firstChild: any = false;
  currentDate: any = new Date();
  addOrUpdate: any = {
    tasks: '',
    highPriority: '',
    mediumPriority: '',
    lowPriority: ''
  }; //either 'add' or 'update
  keys: any = {
    tasks: {
      sortKey: '',
      filterKey: ''
    },
    high: {
      sortKey: ''
    },
    medium: {
      sortKey: ''
    },
    low: {
      sortKey: ''
    }
  }
  sortKey: any;
  filterKey: any;
  searchKey: any;
  sortArr: any = [
    {
      name: 'Latest First',
      order: 'desc'
    },
    {
      name: 'Oldest First',
      order: 'asc',
    }
  ];
  filterArr: any = [
    {
      name: 'High',
      key: '3'
    },
    {
      name: 'Medium',
      key: '2',
    },
    {
      name: 'Low',
      key: '1'
    }
  ];
  taskActionArr: any = [
    {
      name: 'Assign Task',
      key: 'assign'
    },
    {
      name: 'Update Task',
      key: 'update'
    },
    {
      name: 'Delete Task',
      key: 'delete'
    }
  ];
  priorityArr: any = [
    {
      name: 'Low',
      id: '1'
    },
    {
      name: 'Medium',
      id: '2'
    },
    {
      name: 'High',
      id: '3'
    }
  ];
  overlay: any = <HTMLInputElement>document.createElement('div');
  activeCard: any;
  activeCardAction: any;
  taskForm: any = {
    message: '',
    assigned_to: '',
    priority: '',
    due_date: ''
  };
  highPriorityForm: any = {
    message: '',
    assigned_to: '',
    priority: '3',
    due_date: ''
  };
  mediumPriorityForm: any = {
    message: '',
    assigned_to: '',
    priority: '2',
    due_date: ''
  };
  lowPriorityForm: any = {
    message: '',
    assigned_to: '',
    priority: '2',
    due_date: ''
  };


  constructor(private api: ApiService) { }

  /**Init function for the bootstrap data */
  ngOnInit(): void {
    let usersApi = this.api.listUsers();
    let tasksApi = this.api.listTasks();
    this.startSpinner();
    forkJoin([usersApi, tasksApi]).subscribe((results: Array<any>) => {
      results[0].status === 'success' ? this.users = results[0].users : this.showNotification(results[0].status, results[0].error);
      if (results[1].status === 'success') {
        this.tasks = results[1].tasks
        this.tasksClone = results[1].tasks.map(function (item: any) {
          return item;
        })
        this.updateCards();
      } else {
        this.showNotification(results[1].status, results[1].error)
      }
      this.stopSpinner();
    })
  }

  /**======================Header functionalities and functions====================== */

  /**Search Api based on message, priority and member's name (min 3 character is required.) */
  search(): void {
    const self = this;
    if (this.searchKey.length > 2) {
      this.tasks = this.tasksClone.filter(function (item: any) {
        if (item.message.toLowerCase().includes(self.searchKey.toLowerCase())
          || item.assigned_name.toLowerCase().includes(self.searchKey.toLowerCase())
          || self.searchPriority(self.searchKey.toLowerCase(), item) === true) {
          return item;
        }
      })
    } else {
      this.tasks = this.tasksClone.map((item: any) => item)
    }
  }

  /**Helper function to search priority and decide for the corresponded id */
  searchPriority(searchKey: any, instance: any): Boolean {
    if ('high priority'.includes(searchKey) && instance.priority === '3') {
      return true;
    } else if ('medium priority'.includes(searchKey) && instance.priority === '2') {
      return true;
    } else if ('low priority'.includes(searchKey) && instance.priority === '1') {
      return true;
    }
    return false;
  }

  /**Open prodile card for the lis of team member */
  openProfileCard(event: any): void {
    (<HTMLInputElement>document.getElementById("profile-card-modal")).style.left = (event.pageX - 100) + 'px';
    (<HTMLInputElement>document.getElementById("profile-card-modal")).style.top = event.pageY + 'px';
    (<HTMLInputElement>document.getElementById("profile-card-modal")).style.display = "block";
  }

  /**Close profile card */
  closeProfileCard() {
    (<HTMLInputElement>document.getElementById("profile-card-modal")).style.display = "none";
  }

  /**================Header function Ends ========================================= */

  /**================Card Functions=================================================*/

  /**Function to open parent card action modal for sorting and filter */
  openCardActionModal(event: any, type: any): void {
    this.activeCardAction = type;
    this.openModal();
    (<HTMLInputElement>document.getElementById("card-action-modal")).style.left = (event.pageX - 150) + 'px';
    (<HTMLInputElement>document.getElementById("card-action-modal")).style.top = event.pageY + 'px';
    (<HTMLInputElement>document.getElementById("card-action-modal")).style.display = "block";
  }

  /**function to close the modal */
  closeCardActionoModal(modalId: any): void {
    (<HTMLInputElement>document.getElementById(modalId)).style.display = "none";
    this.closeModal();
    this.activeCardAction = '';
  }

  /**Sorting of array based on different order */
  sort(arr: any, order: any) {
    console.log('arr: ', arr);
    if (order === 'asc') {
      arr = arr.sort(function (a: any, b: any) {
        return a.due_date < b.due_date ? -1 : (a > b ? 1 : 0);
      });
      console.log('latest : ', arr);
    } else {
      arr = arr.sort(function (a: any, b: any) {
        return a.due_date > b.due_date ? -1 : (a < b ? 1 : 0);
      });
      console.log('oldest : ', arr);
    }
  }

  /**Function to sort based on segment */
  sortTask(arrName: any, key: any) {
    if (this.keys[arrName].sortKey === key) {
      this.keys[arrName].sortKey = ''
    } else {
      this.keys[arrName].sortKey = key;
    }
    this.sort(arrName === 'tasks' ? this.tasks : arrName === 'high' ? this.highPriorityTasks : arrName === 'medium' ? this.mediumPriorityTasks : this.lowPriorityTasks, key);

  }

  /**function to filter base on different segment */
  filterTask(arrName: any, key: any) {
    if (this.keys[arrName].filterKey === key) {
      this.keys[arrName].filterKey = '';
      this.tasks = this.tasksClone.map((task: any) => task)
      this.sort(arrName === 'tasks' ? this.tasks : arrName === 'high' ? this.highPriorityTasks : arrName === 'medium' ? this.mediumPriorityTasks : this.lowPriorityTasks, this.keys[arrName].sortKey);

    } else {
      this.keys[arrName].filterKey = key;
      this.tasks = this.tasksClone.filter((task: any) => task.priority === key)
    }
  }

  /**Function to get member name base on assigned id */
  getMemberName(assignedTo: any) {
    let member = this.users.find((user: any) => user.id === assignedTo);
    return member ? member.name : ''
  }

  /**function to get member picture base on assigned id */
  getMemberPicture(assignedTo: any) {
    let member = this.users.find((user: any) => user.id === assignedTo);
    return member ? member.picture : ''
  }
  
  /**Function to open the action list of each card task based on the position where clicked. */
  openListCardActionModal(event: any, type: any, taskInstance: any, index: any) {
    const self = this;
    this.closeAddSection(type);
    this.activeCard = {
      type: type,
      index: index,
      value: taskInstance
    }
    self.openModal();
    (<HTMLInputElement>document.getElementById("list-card-action-modal")).style.left = (event.pageX - 200) + 'px';
    (<HTMLInputElement>document.getElementById("list-card-action-modal")).style.top = event.pageY + 'px';
    (<HTMLInputElement>document.getElementById(type + "-card-" + index)).style.background = "var(--list-card-background-color)";
    (<HTMLInputElement>document.getElementById("list-card-action-modal")).style.display = "block";

  }

  /**Function to close the action list of task card. */
  closeListCardActionModal(index: any, update: any = false) {
    (<HTMLInputElement>document.getElementById("list-card-action-modal")).style.display = "none";
    (<HTMLInputElement>document.getElementById(this.activeCard.type + "-card-" + index)).style.background = "var(--white)";
    (<HTMLInputElement>document.getElementById("member-card-modal")).style.display = "none";
    this.closeModal();
    if (!update) {
      this.activeCard = undefined;
    }

  }

  /**General modal to add backdrop behind modal */
  openModal(): void {
    this.overlay.className = 'overlay';
    (<HTMLBodyElement>document.querySelector('body')).appendChild(this.overlay);
  }

  /**General modal to remove backdrop behind modal */
  closeModal(): void {
    this.overlay.className = 'overlay';
    (<HTMLBodyElement>document.querySelector('body')).removeChild(this.overlay);
  }

  /**Function to open update modal for task */
  openUpdateModal(type: any): void {
    this.taskForm = { ...this.activeCard.value }
    this.taskForm['taskid'] = this.activeCard.value.id;
    delete this.taskForm.id;
    this.addOrUpdate[type] = 'update';
    this.closeListCardActionModal(this.activeCard.index, true);

  }

  /**Function to set the priority in the task */
  setPriority(priorityId: any): void {
    const formData = new FormData()
    for (var key in this.activeCard.value) {
      if (key === 'id') {
        formData.append('taskid', this.activeCard.value['id']);
      } else if (key === 'priority') {
        formData.append(key, priorityId);
      }
      else {
        formData.append(key, this.activeCard.value[key]);
      }
    }
    this.updateTask(formData, false, this.activeCard.type)
  }

  /**Function to delete the task. */
  deleteTask(): void {
    const formData = new FormData();
    formData.append('taskid', this.activeCard.value.id)
    this.startSpinner();
    this.api.deleteTask(formData).subscribe((res: any) => {
      if (res.status === 'error') {
        this.stopSpinner();
        this.showNotification(res.status, res.error)
      } else {
        this.stopSpinner();
        this.showNotification(res.status, 'Task has been deleted.')
        this.tasks = this.tasks.filter((task: any) => task.id !== this.activeCard.value.id)
        this.closeListCardActionModal(this.activeCard.index);

      }
    })
  }

  /**Function to enable which action need to be performed based on the action clicked. */
  taskAction(event: any, action: any, type: any): void {
    (<HTMLInputElement>document.getElementById("member-card-modal")).style.display = "none";
    switch (action) {
      case 'assign':
        this.openMemberCardModal(event, false);
        break;
      case 'update':
        this.openUpdateModal(type);
        break;
      case 'delete':
        this.deleteTask();
        break;
      default:
        break;
    }
  }

  /**API function to update the task */
  updateTask(formData: any, formUpdate: any = false, type: any): void {
    this.startSpinner();
    this.api.updateTask(formData).subscribe((res: any) => {
      if (res.status === 'error') {
        this.stopSpinner();
        this.showNotification(res.status, res.error)
      } else {
        //this.stopSpinner();
        this.showNotification(res.status, 'Task has been updated.')
        if (formUpdate) {
          this.closeAddSection(type);
        }
        location.reload();
      }
    })
  }

  /**Function to assign a task to the team member */
  assignUserToTask(event: any, userId: any, type: any = 'tasks'): void {
    if (this.firstChild) {
      this.taskForm.assigned_to = userId
      this.closeMemberCardModal();
    } else {
      const formData = new FormData()
      for (var key in this.activeCard.value) {
        if (key === 'assigned_to') {
          formData.append(key, userId);
        } else if (key === 'id') {
          formData.append('taskid', this.activeCard.value[key]);
        }
        else {
          formData.append(key, this.activeCard.value[key]);
        }
      }
      this.updateTask(formData, false, type)
      this.closeMemberCardModal();

    }

  }

  /**Function to open the team member modal based on the layer*/
  openMemberCardModal(event: any, firstChild: any): void {
    this.openModal();
    (<HTMLInputElement>document.getElementById("member-card-modal")).style.left = (event.pageX - 150) + 'px';
    (<HTMLInputElement>document.getElementById("member-card-modal")).style.top = event.pageY + 'px';
    (<HTMLInputElement>document.getElementById("member-card-modal")).style.display = "block";
    console.log('event member:', event)
    if (firstChild) {
      this.firstChild = true;
    }
  }

  /**Function to close member modal */
  closeMemberCardModal(): void {
    if (!this.firstChild) {
      (<HTMLInputElement>document.getElementById("member-card-modal")).style.display = "none";
    } else {
      (<HTMLInputElement>document.getElementById("member-card-modal")).style.display = "none";
      this.closeModal();
      this.firstChild = false;
    }

  }

  /**Function to enable the event such as add task */
  enableAddTask(event: any, type: any): void {
    this.addOrUpdate[type] = 'add';
  }

  /**API Function to save the task */
  saveTask(event: any, type: any, method: any): void {
    const formData = new FormData();
    for (var key in this.taskForm) {
      formData.append(key, this.taskForm[key]);
    }
    if (method === 'add') {
      this.startSpinner();
      this.api.createTask(formData).subscribe((res: any) => {
        if (res.status === 'error') {
          this.stopSpinner();
          this.showNotification(res.status, res.error);
        } else {
          this.showNotification(res.status, 'Task has been added.')
          /*  this.closeAddSection(type); */
          this.stopSpinner();
          location.reload();

        }
      })
    } else {
      this.updateTask(formData, true, type)
    }

  }

  /**Function to open member list for add or update */
  openMemberList(event: any): void {
    let eventCopy = {
      pageX: event.pageX,
      pageY: event.pageY - 100
    }
    this.openMemberCardModal(eventCopy, true);
  }

  /**Function to open priority list for add or update */
  openPriorityList(event: any): void {
    let eventCopy = {
      pageX: event.pageX,
      pageY: event.pageY - 100
    }
    this.openPriorityModal(eventCopy);
  }

  /**Functin to open priority modal near the postion of clicked. */
  openPriorityModal(event: any): void {
    this.openModal();
    (<HTMLInputElement>document.getElementById("priority-card-modal")).style.left = event.pageX + 'px';
    (<HTMLInputElement>document.getElementById("priority-card-modal")).style.top = event.pageY + 'px';
    (<HTMLInputElement>document.getElementById("priority-card-modal")).style.display = "block";
  }

  /**Function to close the priority card modal */
  closePriorityCardModal(): void {
    (<HTMLInputElement>document.getElementById("priority-card-modal")).style.display = "none";
    this.closeModal();
  }

  /**Function to set priority to task */
  setPriorityToTask(event: any, priorityId: any): void {
    this.taskForm.priority = priorityId
    this.closePriorityCardModal();
  }

  /**Open date modal */
  openDateModal(event: any): void {
    this.openModal();
    (<HTMLInputElement>document.getElementById("date-modal")).style.left = event.pageX + 'px';
    (<HTMLInputElement>document.getElementById("date-modal")).style.top = (event.pageY - 100) + 'px';
    (<HTMLInputElement>document.getElementById("date-modal")).style.display = "block";
  }
  
  /**Close the date modal */
  closeDateModal(): void {
    (<HTMLInputElement>document.getElementById("date-modal")).style.display = "none";
    this.closeModal();
  }

  /**Function to get the date and for date type input */
  getDateTime(d: any) {
    let dateObj = new Date(d);
    let year = dateObj.getFullYear() + '';
    let month = dateObj.getMonth() + '';
    let date = dateObj.getDate() + '';
    let hours = dateObj.getHours() + '';
    let min = dateObj.getMinutes() + '';
    let sec = dateObj.getSeconds() + '';

    month = month.length === 1 ? '0' + month : month
    date = date.length === 1 ? '0' + date : date
    hours = hours.length === 1 ? '0' + hours : hours
    min = min.length === 1 ? '0' + min : min
    sec = sec.length === 1 ? '0' + sec : sec
    return year + '-' + month + '-' + date + ' ' + hours + ':' + min + ':' + sec;
  }

  /**Setting due date for the task */
  setDueDate(event: any): void {
    this.taskForm.due_date = this.getDateTime(this.taskForm.due_date);
    console.log('event :', event);
    this.closeDateModal();
  }

  /**Function to close the add section in the card container */
  closeAddSection(type: any): void {
    this.taskForm = {
      message: '',
      assigned_to: '',
      priority: '',
      due_date: ''
    }
    this.addOrUpdate[type] = '';
  }

  /**Update Function to update the card data based on different priority */
  updateCards() {
    this.highPriorityTasks = this.tasksClone.filter((task: any) => task.priority === '3');
    this.mediumPriorityTasks = this.tasksClone.filter((task: any) => task.priority === '2');
    this.lowPriorityTasks = this.tasksClone.filter((task: any) => task.priority === '1');
  }

  /**Notification function */
  showNotification(status: any, message: any): void {
    if (status === 'success') {
      (<HTMLInputElement>document.getElementById("toast")).style.backgroundColor = 'var(--green)';
      (<HTMLInputElement>document.getElementById("toast-img")).innerHTML = 'Success';
      (<HTMLInputElement>document.getElementById("toast-desc")).innerHTML = message;
    }
    else if (status === 'error') {
      (<HTMLInputElement>document.getElementById("toast")).style.backgroundColor = 'var(--red)';
      (<HTMLInputElement>document.getElementById("toast-img")).innerHTML = 'Error';
      (<HTMLInputElement>document.getElementById("toast-desc")).innerHTML = message;
    }

    var notification = <HTMLInputElement>document.getElementById("toast")
    notification.className = "visible";
    setTimeout(function () { notification.className = notification.className.replace("visible", ""); }, 2000);
  }

  /**Function to start the spinner */
  startSpinner(): void {
    (<HTMLCollection>document.getElementsByClassName('dz-spinner'))[0].classList.add('loading');
  }

  /**Function to stop the spinner */
  stopSpinner(): void {
    (<HTMLCollection>document.getElementsByClassName('dz-spinner'))[0].classList.remove('loading');
  }

  
  /**Draggable JS function started */
  /**Set Draggable priority */
  setDraggablePriority(taskData: any): void {
    const formData = new FormData()
    for (var key in taskData) {
      if (key === 'id') {
        formData.append('taskid', taskData['id']);
      }
      else {
        formData.append(key, taskData[key]);
      }
    }
    this.updateTask(formData, false, 'update')
  }

  drag(event:any) {
    var dataId = event.target.id.split('-');
    event.dataTransfer.setData("priority", dataId[0]);
    event.dataTransfer.setData("taskIndex", dataId[2]);
  }
  
  dropData(event:any, priority:any) {
    event.preventDefault();
    var dragPriority = event.dataTransfer.getData("priority");
    var taskIndex = parseInt(event.dataTransfer.getData("taskIndex"));
    if(dragPriority !== priority) {
      var getDragObject = dragPriority === 'all' ? this.tasks[taskIndex] 
      : dragPriority === 'high' ? this.highPriorityTasks[taskIndex]
      : dragPriority === 'medium' ? this.mediumPriorityTasks[taskIndex]
      : this.lowPriorityTasks[taskIndex];
      /**Priority will only update if we drop the element into priority segment not the All task segment. */
      if (priority !== 'all'){
        console.log('getDragObject : ', getDragObject);
        getDragObject['priority'] = priority === 'high' ? '3' : priority === 'medium'? '2': '1';
        this.setDraggablePriority(getDragObject);
      }
    }
  }

  allowDrop(event:any) {
    event.preventDefault();
  }

  

}
