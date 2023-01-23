//  Graphs

const sales = document.getElementById("sales");
const earning = document.getElementById("earning");
const products = document.getElementById("products");
Chart.defaults.color = "#927685";
Chart.defaults.borderColor = "#33202c";

new Chart(sales, {
  type: "bar",
  data: {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "June", "July"],
    datasets: [
      {
        label: "My Revenue",
        data: [380, 200, 500, 300, 150, 400, 100],
        backgroundColor: ["rgba(155,128,151,1)"],
        hoverBackgroundColor: "#FF90B8",
      },
    ],
  },
  options: {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
    },
  },
});

new Chart(earning, {
  type: "line",
  data: {
    labels: ["Jan", "Feb", "Mar", "Apr", "May"],
    datasets: [
      {
        label: "My Revenue",
        data: [380, 200, 500, 300, 150],
        backgroundColor: ["rgba(155,128,151,1)"],
        hoverBackgroundColor: "#FF90B8",
      },
    ],
  },
  options: {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
    },
  },
});

new Chart(products, {
  type: "doughnut",
  data: {
    labels: ["Kits", "Items", "Other"],
    datasets: [
      {
        label: "My Revenue",
        data: [380, 200, 500],
        backgroundColor: [
          "rgba(155,128,151,1)",
          "rgba(254,111,162,1)",
          "rgba(244,164,111, 1)",
        ],
        hoverBackgroundColor: "#FF90B8",
      },
    ],
  },
  options: {
    responsive: true,
  },
});

//Time

const TimeElements = document.getElementsByClassName("time");

formatAMPM()

function formatAMPM() {
    var date = new Date();
    var hours = date.getHours();
    var minutes = date.getMinutes();
    let s = date.getSeconds();


    var ampm = hours >= 12 ? 'pm' : 'am';
    hours = hours % 12;
    hours = hours || 12;
    minutes = minutes < 10 ? '0'+minutes : minutes;
    var strTime = hours + ':' + minutes + ' ' + ampm;


    for (let i = 0; i < TimeElements.length; i++) {
        TimeElements[i].innerHTML  = strTime;
    }
    

    setTimeout(formatAMPM, parseInt(5000) );
    return strTime;
};


//Tabs

const DashBoardbutton = document.getElementsByClassName("dashboardbutton")[0];
DashBoardbutton.onclick = function(event){
  event.preventDefault();
  if (window.location.pathname == '/') {
    return
  } else {
    window.location.href = "/"
  }
  return false
  //window.location.href = "index.html"
}

const ActivityButton = document.getElementById("activityviewall")

ActivityButton.onclick = function() {
  console.log("wasd")
  if (window.location.pathname == '/') {
    window.location.href = "./Pages/Activity.html"
  }
}


//Pop

PopConfig = {
	"SetTimeout": 10000, 
	"Servers": [
        {
      "ServerName": "US 3x Pvp",
      "CurrentPop": "Loading"
		}
	]
}
const BaseUrl = 'http://localhost:8000'

PopUpdate()



async function PopUpdate() {
  const res = await fetch(BaseUrl+'/popinfo', {
     method: 'GET'
  })
  const data = await res.json()
  data.forEach((serverdata, index)=> {
    if (data.length === PopConfig.Servers.length) {
      document.getElementsByClassName('pop')[index].innerHTML = serverdata
    }

  })
  setTimeout(PopUpdate, PopConfig.SetTimeout)
}

PopConfig.Servers.forEach((server, index) => {
  const frame = document.createElement('div')
  frame.setAttribute('class', "activity flex")
  document.getElementsByClassName('profile')[0].append(frame)
  
  const icon = document.createElement('div')
  icon.setAttribute('class', "icon")
  frame.append(icon)
  
  const ionimage = document.createElement('ion-img')
  ionimage.setAttribute('src', '/img/ServerLogo.png')
  icon.append(ionimage)
  
  const task = document.createElement('div')
  task.setAttribute('class', "task")
  frame.append(task)
  
  const h2 = document.createElement('h2')
  h2.textContent = server.ServerName
  task.append(h2)
  
  const p = document.createElement('p')
  p.textContent = 'loading'
  p.setAttribute('class', "pop")
  task.append(p)
  
  const time = document.createElement('div')
  time.setAttribute('class', "time")
  frame.append(time)
})

//<div class="icon">
//              <ion-img src="./img/ServerLogo.png" alt="ServerLogo"></ion-img>
//            </div>
//            <div class="task">
//              <h2>5x Pvp</h2>
//              <p>Pop: 2</p>
//            </div>
//            <div class="time">Time</div>





