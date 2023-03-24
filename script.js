// checking whether the key pressed is letter or not
function isLetter(letter){
    return /^[a-zA-Z]$/.test(letter);
}

// add event listener when key is pressed
async function init(){

    document.addEventListener('keydown' , function handleKeyPress(event){
        let key = event.key;
        if(key=== 'Enter'){
            // checking the word
            checkWord();
        }else if(key=== 'Backspace'){
            // delete the letter
            deleteLetter();
        }else if(isLetter(key)){
            addLetter(key.toUpperCase());
        }else{
            // do nothing
        }

    } )

}
// row and box number to keep track of the word entered
let row_num = 1;
let box_num = 1;


// add letter to the box when inputted by the user
function addLetter(letter){
    
    if(box_num==6){
        let box = getBox(5);
    
        box.value = letter;

        return ;
    }
    // get box to which the letter is added
    let box = getBox(box_num);
    
    box.value = letter;
    // go to the next box
    box_num++;
}

function deleteLetter(){
    if(box_num==1){
        return ;
    }
    
    box_num -= 1;
    let box = getBox(box_num);

    box.value="";
}

// get the row element 
function getRow(){
    let row_query = "div[row-num='"+row_num+"']";
    let rows = document.querySelectorAll(row_query);

    return rows[0];
}

// get the current box
function getBox(box_num){

    let rows = getRow();
    let box_query = "input[box-num='"+box_num+"']";
    if(box_num===6){
        box_query = "input[box-num='5']";
    }
    let box = rows.querySelectorAll(box_query);
    return box[0];
}

// get all boxes corresponding to the current row
function getBoxes(){
    let row = getRow();
    let boxes = row.querySelectorAll('input');
    console.log(boxes);
    return boxes;
}

// get and validate the word
async function checkWord(){
    if(box_num!==6){
        return ;
    }
    let boxes = getBoxes();
    let word = "";
    boxes.forEach(box => {
        word += box.value;
    })
    console.log(word);

    let isValidWord = await checkValidWord(word);
    if(isValidWord==false ){
        console.log("not valid word")
        changeBorderRed();
        return ;
    }

    let wordOfDay = await getWordOfDay();
    let validation = word===wordOfDay;
    if(validation==true){
        // if the word is true -> you win
        celebrateWin();
    }else{
        // highlight letters
        highLightLetters(wordOfDay);
        row_num += 1;
        box_num = 1;
        if(row_num === 7){
            celebrateLoose();
        }
    }
}

function changeBorderRed(){
    let boxes = getBoxes();
    console.log("changing to red")

    let opacity = 1;
    setInterval(function(){
        console.log('inside set interval')
        boxes.forEach(box => {
            box.style.borderColor = "rgba(255, 0, 0,"+opacity+")";
        })
        opacity = opacity/2;
    } , 100);
    

    // setTimeout(function(){
    //     boxes.forEach(box => {
    //         box.style.borderColor = 'rgb(207, 199, 207)';
    //     })
    // } , 2000);
    
}

async function checkValidWord(word){
    let response = await fetch('https://words.dev-apis.com/validate-word', {
        method: 'POST',
        body: JSON.stringify({ "word": word })
    });
    if(response.ok===true){
        let jsonResponse = await response.json();
        if(jsonResponse.validWord){
            return true;
        }
    }
    return false;
}

function highLightLetters(wordOfDay){
    let boxes = getBoxes();
    let wordOfDayFreq = getWordOfDayFreq(wordOfDay);
    boxes.forEach( (box , index) => {
        let letter = box.value.toLowerCase();
        if(letter in wordOfDayFreq && wordOfDayFreq[letter]>0 ){
            if(letter===wordOfDay[index]){
                changeColour(box , 'green');
            }else{
                changeColour(box , 'yellow');
            }

            wordOfDayFreq[letter] -= 1;
        }else{
            changeColour(box , 'grey');
        }
    })
}

function getWordOfDayFreq(word){
    let wordDict = {};
    for(let i=0;i<word.length;i++){
        if(word[i] in wordDict){
            word[i] += 1;
        }else{
            wordDict[word[i]] = 1;
        }
    }

    return wordDict;
}

function changeColour(box , color){
    console.log('changing box color');
    box.style.background = color;
    box.style.color = 'white';
}

async function getWordOfDay(){
    let response = await fetch('https://words.dev-apis.com/word-of-the-day');
    let jsonResponse = await response.json();
    let wordOfDay = jsonResponse.word;
    // console.log(wordOfDay);

    return wordOfDay;
}

init();

