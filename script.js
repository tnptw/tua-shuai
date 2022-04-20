import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js";

const firebaseConfig = {
  apiKey: "AIzaSyAEdbPO3YXkfcz29LiJPssZ7sLaxC8a57c",
  authDomain: "tua-shuai-33f59.firebaseapp.com",
  projectId: "tua-shuai-33f59",
  storageBucket: "tua-shuai-33f59.appspot.com",
  messagingSenderId: "380237340821",
  appId: "1:380237340821:web:b6bb76fe2ea6f9314dbb9c",
};

const app = initializeApp(firebaseConfig);

import {
  setDoc,
  addDoc,
  deleteDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  getFirestore,
  query,
  where,
  orderBy,
} from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";

const db = getFirestore();
const subjectRef = collection(db, "subjects");
const todoRef = collection(db, "todos");

var currentUser;
var editScheduleModal = document.getElementById("edit-schedule");
var loginWarningModal = document.getElementById("login-warning");
var addAssignmentModal = document.getElementById("add-assignment");

document.getElementById("username-form").addEventListener(
  "submit",
  async function (event) {
    event.preventDefault();
    let uid = document.getElementById("username").value;
    if (uid) {
      const user = await getDoc(doc(db, "users", uid));
      if (!user.exists()) {
        await setDoc(doc(db, "users", uid), { uid });
        console.log("create user");
      }
      currentUser = uid;
      console.log("current user " + currentUser);
      alert("You are login as " + currentUser);
      redrawSubjectList();
      redrawLoginForm(true);
    } else {
      currentUser = null;
      alert("Invalid ID or username");
    }
    drawSchedule();
    drawTodo();
  },
  false
);

function redrawLoginForm(isLogin) {
  if (isLogin) {
    document.getElementById("user-login-info").style.display = "block";
    document.getElementById("user-login").innerHTML = currentUser;
    document.getElementById("username-form").style.display = "none";
  } else {
    document.getElementById("user-login-info").style.display = "none";
    document.getElementById("username").value = "";
    document.getElementById("username-form").style.display = "block";
  }
}

window.logout = logout;
function logout() {
  currentUser = null;
  drawSchedule();
  drawTodo();
  redrawLoginForm(false);
  console.log("logout");
}

document.getElementById("edit-schedule-button").onclick = function () {
  if (currentUser) {
    editScheduleModal.style.display = "block";
  } else {
    loginWarningModal.style.display = "block";
  }
};

document.getElementById("close-schedule-modal-button").onclick = function () {
  editScheduleModal.style.display = "none";
};

document.getElementById("add-assignment-button").onclick = function () {
  if (currentUser) {
    addAssignmentModal.style.display = "block";
  } else {
    loginWarningModal.style.display = "block";
  }
};

document.getElementById("close-assignment-modal").onclick = function () {
  addAssignmentModal.style.display = "none";
};

window.onclick = function (event) {
  if (event.target == editScheduleModal) {
    editScheduleModal.style.display = "none";
  } else if (event.target == loginWarningModal) {
    loginWarningModal.style.display = "none";
  } else if (event.target == addAssignmentModal) {
    addAssignmentModal.style.display = "none";
  }
};

document
  .getElementById("subject-form")
  .addEventListener("submit", async function (event) {
    event.preventDefault();
    let uid = currentUser;
    let subject = document.getElementById("subject").value;
    let day = document.getElementById("day").value;
    let startTime = document.getElementById("starting-time").value;
    let endTime = document.getElementById("ending-time").value;
    await addDoc(subjectRef, {
      uid,
      subject,
      day,
      startTime,
      endTime,
    });
    redrawSubjectList();
    drawSchedule();
  });

async function redrawSubjectList() {
  const subjectList = document.getElementById("subject-list");
  subjectList.innerHTML = "";
  const q = await getDocs(query(subjectRef, where("uid", "==", currentUser)));
  q.forEach((sub) => {
    console.log(sub.id, "=>", sub.data());
    subjectList.innerHTML += `
    <tr id="${sub.id}">
      <td>${sub.data().subject}</td>
      <td>${sub.data().day}</td>
      <td>${sub.data().startTime} - ${sub.data().endTime}</td>
      <td><button class="remove" id="remove-subject" onclick="deleteSubject('${
        sub.id
      }')">&minus;</button></td>
    </tr>`;
  });
  document.getElementById("subject").value = "";
  document.getElementById("day").value = "";
  document.getElementById("starting-time").value = "";
  document.getElementById("ending-time").value = "";
}

window.deleteSubject = async (subId) => {
  const docRef = doc(db, "subjects/" + subId);
  await deleteDoc(docRef);
  redrawSubjectList();
  drawSchedule();
};

async function drawSchedule() {
  const d = new Date();
  let days = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
  let today = days[d.getDay()];
  let tomorrow = days[(d.getDay() + 1) % 7];
  const q = await getDocs(query(subjectRef, where("uid", "==", currentUser)));
  if (!q.empty) {
    document.getElementById("schedule-inform").style.display = "none";
    document.getElementById("schedule").style.visibility = "visible";
  } else {
    document.getElementById("schedule-inform").style.display = "block";
    document.getElementById("schedule").style.visibility = "hidden";
  }
  const todaySubs = await getDocs(
    query(
      subjectRef,
      where("uid", "==", currentUser),
      where("day", "==", today),
      orderBy("startTime")
    )
  );
  const todaySubList = document.getElementById("today-subject");
  todaySubList.innerHTML = "";
  todaySubs.forEach((sub) => {
    console.log(sub.id, "=>", sub.data());
    todaySubList.innerHTML += `<li style="margin-bottom:5px">${
      sub.data().startTime
    } - ${sub.data().endTime}<span style="margin-left:20px">${
      sub.data().subject
    }</span></li>`;
  });
  const tomrrSubs = await getDocs(
    query(
      subjectRef,
      where("uid", "==", currentUser),
      where("day", "==", tomorrow)
    )
  );
  const tomrrSubList = document.getElementById("tomorrow-subject");
  tomrrSubList.innerHTML = "";
  tomrrSubs.forEach((sub) => {
    console.log(sub.id, "=>", sub.data());
    tomrrSubList.innerHTML += `<li style="margin-bottom:5px">${
      sub.data().startTime
    } - ${sub.data().endTime}<span style="margin-left:20px">${
      sub.data().subject
    }</span></li>`;
  });
}

// window.mark_done = mark_done;
// async function mark_done(name) {
//   const table = document.getElementsByName(name)[0];
//   table.remove();
//   console.log("test");
// }

document.getElementById("add-todo-form").addEventListener("submit", async function (event) {
    event.preventDefault();
    let uid = currentUser;
    let title = document.getElementById("title").value;
    let subject = document.getElementById("todo-subject").value;
    let due = document.getElementById("due-date").value;
    let description = document.getElementById("todo-description").value;
    await addDoc(todoRef, {
      uid,
      title,
      subject,
      due,
      description,
    });
    addAssignmentModal.style.display = "none";
    drawTodo();
});

async function drawTodo() {
  const q = await getDocs(query(todoRef, where("uid", "==", currentUser)));
  if (!q.empty) {
    document.getElementById("todo-inform").style.display = "none";
    document.getElementById("todo").style.visibility = "visible";
  } else {
    document.getElementById("todo-inform").style.display = "block";
    document.getElementById("todo").style.visibility = "hidden";
  }
  const todoList = document.getElementById("todo-list");
  todoList.innerHTML = "";
  q.forEach((task) => {
    console.log(task.id, "=>", task.data());
    todoList.innerHTML += `
    <tr id="${task.id}">
      <td>${task.data().due}</td>
      <td>${task.data().title}</td>
      <td>${task.data().subject}</td>
      <td><button class="mark-done-button" onclick="">Mark as done</button></td>
    </tr>`;
  });
  document.getElementById("title").value = "";
  document.getElementById("todo-subject").value = "-";
  document.getElementById("due-date").value = "";
  document.getElementById("todo-description").value = "";
}