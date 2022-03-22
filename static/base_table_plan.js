var nav = document.getElementById("nav")
var menuBtn = document.querySelector(".hamburgerMenu")
var hamburgerMenuDisplay = document.getElementById("hamburgerMenuDisplay")
var hamburgerMenu = document.querySelector(".hamburgerMenu")
var menuOpen = false;
var buttonUnorderedList = document.querySelector(".buttonUnorderedList")
var main = document.getElementById("main")

buttonsArray = new Array()

var buttonNameList = new Array()
buttonNameList = ["Home"]
buttonLinkList = ["/","/","/","/learn"]

var lastButtonLength = 0;
var previousButtonsLengths = new Array()

// document.addEventListener("resize",windowSizeChanged)
// windowSizeChanged()
// windowScrolled()
createButtons()

// window.onscroll = function() {windowScrolled()};
var sticky = nav.offsetTop;

function windowScrolled(){
  if (window.pageYOffset >= sticky){
    nav.classList.add("sticky")
    var content = document.querySelector(".content")
    content.classList.add("sticky")
  }else{
    nav.classList.remove("sticky")
    var content = document.querySelector(".content")
    content.classList.remove("sticky")
  }
}

// menuBtn.addEventListener("click", () =>{
//   if (!menuOpen){
//     menuBtn.classList.add("open")
//     menuOpen = true;
//     openHamburgerMenu()
//   } else {
//     menuBtn.classList.remove("open")
//     menuOpen = false;
//     closeHamburgerMenu()
//   }
// })

function openHamburgerMenu(){
  hamburgerMenuDisplay.classList.remove("hide")
  var noButtons = buttonNameList.length;
  for (var i=0;i<noButtons;i++){
    var newHamburgerDisplay = document.createElement("div")
    var hrTag = document.createElement("hr")
    newHamburgerDisplay.classList.add("hamburgerMenuDisplayItem")
    // newHamburgerDisplay.innerHTML = "test"
    hamburgerMenuDisplay.appendChild(hrTag)
    createHamburgerButton(i,buttonNameList[i],buttonLinkList[i])
    newHamburgerDisplay.style.setProperty("--animationDelay",(i)*0.2+"s")
    // hamburgerMenuDisplay.appendChild(newHamburgerDisplay)
    main.style.setProperty("--height","120vh")
  }
}
// function closeHamburgerMenu(){
//   hamburgerMenuDisplay.classList.add("hide")
//   hamburgerMenuDisplay.querySelectorAll("*").forEach(n => n.remove())
//   menuBtn.classList.remove("open")
//   main.style.setProperty("--height","80vh")
// }

// function windowSizeChanged(){
//   // console.log(window.innerWidth)
//   // console.log(window.innerHeight)
//   document.querySelectorAll(".link").forEach(n => n.remove())
//   document.querySelectorAll(".buttonListItem").forEach(n => n.remove())
//   closeHamburgerMenu()
//   hamburgerMenu.classList.add("hide")
//   if (window.innerWidth > 600){
//     nav.style.setProperty("--displayType","flex")
//     createButtons()
//   }else{
//     hamburgerMenu.classList.remove("hide")
//     nav.style.setProperty("--displayType","block")
//   }
// }

function createButtons(){
  previousButtonsLengths = new Array()
  for (var i=0;i<buttonNameList.length;i++){
    createButton2(i,buttonNameList[i],buttonLinkList[i],false)   //FINISH ME
  }
  // createButton(0,"Login","https://google.co.uk",true)
  // createButton(1,"Amazon","https://amazon.co.uk")
  // createButton(2,"Ebay","https://ebay.co.uk")
  // createButton(3,"lastButtonLengthTHATISLONG","https://ebay.co.uk")
}

function createButton2(buttonNumber,buttonText,link,openInNewTab){
  var newListItem = document.createElement("li")
  var newLink = document.createElement("a")
  newListItem.classList.add("buttonListItem")
  newLink.innerHTML = buttonText;
  newLink.classList.add("link")
  if (openInNewTab==true){
    newLink.setAttribute("target","_blank")
  }
  newLink.setAttribute("href",link)
  newLink.setAttribute("padding-left","100px")
  newListItem.appendChild(newLink)
  buttonUnorderedList.appendChild(newListItem)
}


// function createButton(buttonNumber,buttonText,link,openInNewTab=false){
//   var newLink = document.createElement("a")
//   var newButton = document.createElement("p")
//   var buttonTextLength = buttonText.length
//   newButton.classList.add("button")
//   // console.log(18+buttonNumber*(lastButtonLength+buttonTextLength/15))
//   // console.log(lastButtonLength)
//   var marginIncrease = 0;
//   for (var i=0;i<previousButtonsLengths.length;i++){
//     marginIncrease = marginIncrease + previousButtonsLengths[i]*1.1
//   }
//   newButton.style.setProperty("--margin-left",(80+marginIncrease*7 + buttonNumber*25+"px"))
//   newButton.setAttribute("id","navButton")
//   newButton.innerHTML = buttonText;
//   newLink.setAttribute("href",link)
//   newLink.classList.add("link")
//   if (openInNewTab==true){
//     newLink.setAttribute("target","_blank")
//   }
//   newLink.appendChild(newButton)
//   nav.appendChild(newLink);
//   buttonsArray[buttonNumber] = newButton
//   // lastButtonLength = buttonText.length
//   previousButtonsLengths[buttonNumber] = buttonText.length
// }

// function createHamburgerButton(buttonNumber,buttonText,link,openInNewTab=false){
//   var newLink = document.createElement("a")
//   var newButton = document.createElement("p")
//   var buttonTextLength = buttonText.length
//   newButton.classList.add("button")
//   // console.log(18+buttonNumber*(lastButtonLength+buttonTextLength/15))
//   // console.log(lastButtonLength)
//
//   newButton.classList.add("hamburgerMenuDisplayItem")
//   newButton.style.setProperty("--animationDelay",(buttonNumber)*0.2+"s")
//   // newButton.setAttribute("id","navButton")
//   newButton.innerHTML = buttonText;
//   newLink.setAttribute("href",link)
//   newLink.classList.add("link")
//   if (openInNewTab==true){
//     newLink.setAttribute("target","_blank")
//   }
//   newLink.appendChild(newButton)
//   hamburgerMenuDisplay.appendChild(newLink);
//   buttonsArray[buttonNumber] = newButton
// }
