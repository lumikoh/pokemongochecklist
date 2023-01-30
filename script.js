let pogoData;
let checkList;

const getCheckData = () => {
    if(localStorage.getItem("checkList") == null) {
        const map = createCheckList(pogoData)
        localStorage.checkList = JSON.stringify(Array.from(map.entries()));
        return map;
    }
    return new Map(JSON.parse(localStorage.checkList))

}
createCheckList = (data) => {
    const list = new Map();
    for (const key in data) {
        list.set(data[key].id, 0);
    }
    return list;
}

const fetchData = async (url) => {
    let obj = fetch(url)
    .then(response => {
    return response.json();
    })
    .then(data => {return data });
    return obj;
}

const main = async () => {
    pogoData = await fetchData("pogodata.json");
    checkList =  getCheckData();

    localStorage.setItem("version", "1.0");

    const tbody = document.getElementById("pokemonList");   
    for (const key in pogoData) {
        tbody.appendChild(makeRow(pogoData[key], key));
    }
    buttonHandling();

}

const saveData = () => {
    const fileHandle = await;
    window.showSaveFilePicker();

    var data = new FormData()
    data.append("upfile", new Blob(["abscos"], {type: "text/plain"}));
    fetch()
}

const buttonHandling = () => {
    const hideObtained = localStorage.getItem("hideObtained");
    const hideUnavailable = localStorage.getItem("hideUnavailable");
    if(parseInt(hideObtained)) document.getElementById("hideObtained").checked = true;
    if(parseInt(hideUnavailable)) document.getElementById("hideUnavailable").checked = true;
    
    const hideObButton = document.getElementById("hideObtained");
    const hideUnavButton = document.getElementById("hideUnavailable");
    hideObButton.addEventListener("click", headerButtonOnClick, false)
    hideUnavButton.addEventListener("click", headerButtonOnClick, false)
    hideElements(hideObButton, "checked");
    hideElements(hideUnavButton, "unavailable");
}

const makeRow = (data, index) => {
    let row = document.createElement("tr");
    if(!data.isReleased) row.setAttribute("class", "unavailable");
    row.setAttribute("id", data.id);

    const cells = [];
    for (let i = 0; i < 6 ; i++) {
        cells.push(document.createElement("td"));
    }
    
    let checkbox = document.createElement("input");
    checkbox.setAttribute("type", "checkbox");
    checkbox.addEventListener('click', checkboxHanding, false)
    if(checkList.get(data.id)) { 
        row.classList.add("checked");
        checkbox.checked = true;
    }
    

    cells[0].appendChild(checkbox);
    cells[0].setAttribute("class", "checkbox");

    cells[1].innerHTML = data.number;
    cells[1].setAttribute("class", "number");

    let image = document.createElement("img");
    image.setAttribute("src", imagePath(data.slug));
    cells[2].appendChild(image);
    cells[2].setAttribute("class", "image");
    if(data.shinyReleased) cells[2].classList.add("shiny") ;
    
    let name = "";
    if (data.form != "$") name += regionalForms(data.form) + " ";
    name += data.name;
    cells[3].innerHTML = name;
    cells[3].setAttribute("class", "name");
    let gameImg = document.createElement("img");
    gameImg.setAttribute("src", determineGameIcon(data.switchGame))
    cells[4].setAttribute("class", "switch")
    cells[4].appendChild(gameImg);
    
    const boxDiv = document.createElement("div");
    boxDiv.setAttribute("class", "boxdiv");

    boxDiv.addEventListener("mouseover", onHoverBox);
    boxDiv.addEventListener("mouseout", onHoverExitBox);
    let div = document.createElement("div");
    boxDiv.setAttribute("pokemonId", parseInt(index)+1)
    boxDiv.appendChild(div);
    boxDiv.setAttribute("class", "boxdiv");
    
    let boxImage = document.createElement("img");
    boxImage.setAttribute("src", "img/openbox.png")
    boxDiv.appendChild(boxImage);

    cells[5].setAttribute("class", "boxlocation");
    cells[5].appendChild(boxDiv)

    for (let i = 0; i < cells.length; i++) {
        row.appendChild(cells[i]);
        
    }
    return row;
    
}

const capitalizeFirstLetter = (string) => {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

const imagePath = (slug) => {
    return "img/pokemon/regular/" + slug + ".png";
}

const regionalForms = (string) => {
    switch(string) {
        case "alola":
            return "Alolan ";
        case "galar":
            return "Galarian ";
        case "hisui":
            return "Hisuian ";
        case "white-striped":
            return "White-Striped ";
    }
} 

const determineGameIcon = (game) => {
    if(game == "PLA") return "img/pla.png";
    if(game == "BDSP") return "img/bdsp.png";
    if(game == "SWSH") return "img/swsh.png";
    return "img/unknown.png";
}

const checkboxHanding = async (evt) => {
    const el = evt.currentTarget
    const cell = el.parentNode;
    if(el.checked == true) {
        cell.parentNode.classList.add("checked");
        checkList.set(cell.parentNode.id, 1)
        localStorage.checkList = JSON.stringify(Array.from(checkList.entries()));
        const hideButton = document.getElementById("hideObtained");
        hideElements(hideButton, "checked");
        return;
    }
    cell.parentNode.classList.remove("checked");
    checkList.set(cell.parentNode.id, 0)
    localStorage.checkList = JSON.stringify(Array.from(checkList.entries()));
}

const hideElements = (e, cls) => {    
    e.checked ? localStorage.setItem(e.id, 1) : localStorage.setItem(e.id, 0)
    const checkedContent = document.getElementsByClassName(cls);
    let displayStyle = "table-row";
    if(e.checked == true) displayStyle = "none"
    for (const element of checkedContent) {
        element.style.display = displayStyle;
    }

}
const headerButtonOnClick = async (evt) => {
    const el = evt.currentTarget;
    if(el.id == "hideObtained") hideElements(el, "checked");
    if(el.id == "hideUnavailable") hideElements(el, "unavailable");
}

const onHoverBox = async (evt) => {
    const el = document.createElement("img");
    el.setAttribute("src", "img/boxnogrid.png");
    
    el.style.left = "30px"
    
    const ball = document.createElement("img");
    ball.setAttribute("src", "img/poke.png")
    ball.setAttribute("class", "ball");

    const index = evt.currentTarget.getAttribute("pokemonid");
    const positions = ballPosition(index);
    ball.style.left = positions[0];
    ball.style.top = positions[1];
    const div = evt.currentTarget.firstElementChild;

    const titleText = document.createElement("p");
    titleText.innerHTML= "BOX" + Math.ceil(index/30);

    div.appendChild(ball);
    div.appendChild(el);
    div.appendChild(titleText);
}

const onHoverExitBox = async (evt) => {
    const el = evt.currentTarget.firstElementChild;
    while(el.firstChild) {
        el.removeChild(el.firstChild);
    }
}

const ballPosition = (index) => {
    index = (index - 1) % 30;
    let x = index % 6;
    let y = Math.floor(index/6) + 1;
    return [(x * 32)+ 30 + "px", (y * 32)+2 + "px"];
}

const downloadClicked = () => {
    const fileName = "pogodata.json"
    const contents = JSON.stringify(Array.from(checkList.entries()));
    download(fileName, contents);
}

const download = (fileName, contents, mimeType = "text/plain") => {
    const blob = new Blob([contents], {type: mimeType});
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
}

const uploadClicked = () => {
    
}

main();