// ****************************** 
// *   Notes   * 
// ****************************** 
// This piece of code is revised by Dr Jian Chen based on the published code from 
// R. Gibeau (2021) The Corsi Blocks Task: Variations and coding with jsPsych. 
// The Quantitative Methods for Psychology. 10.20982/tqmp.17.3.p299

// In this version, Dr Jian Chen follows the classical Corsi task in which 9 sequences are presented
// in a fixed order. Blocks are presented in fixed positions. For each sequence has two trials. 
// Participants need to pass at least one trial to get to the next sequence. 

// This task runs in jsPsych v6.1.0. It does not work in other versions.

// 25.7.2022 add termination if two continuous errors in one sequence. 




/* url parameters*/
var id = jsPsych.data.getURLVariable("subjectid");
var debrifurl = "https://jianchen.info?subjectid=".concat(id) // simple reaction task

// ****************************** 
// *   Defining general stuff   * 
// ****************************** 
console.log('Begining of the parameter definitions')

// Experiment parameters 
var nItems              = 9       // total number of squares on the display. Fixed in this experiment
// the sequence lengths to test the participant with, with the variable "OneSequenceLength"
var sequenceLengths_prac = [{OneSequenceLength: 2}];
var sequenceLengths     = [{OneSequenceLength: 2},{OneSequenceLength: 3},{OneSequenceLength: 4},{OneSequenceLength: 5},
                            {OneSequenceLength: 6},{OneSequenceLength: 7},{OneSequenceLength: 8},{OneSequenceLength: 9}];
var sequenceRandomOrder = false   // true for "random" or false for "sequential"
var sequenceRepetition  = 2       // how many times each length is tested

// Trial parameters 
var InterTrialDuration   = 100  // e.g., REF
var FixationDuration     = 400  // e.g., REF
var MouseToBeHidden      = false 
var PreBlinkDuration     = 500  // e.g., REF
var BlinkDuration        = 400  // e.g., REF
var PostBlinkDuration    = 500  // e.g., REF
var InterBlinkDuration   = 400  // e.g., REF
var RecallSignal         = 'https://raw.githubusercontent.com/RMG2424/Dr.-Mid-Nite/master/CorsiBlockjsPsych/500hz-400ms.wav'
var RecallSignalDuration = 400
var AcknowledgeDuration  = 200  // e.g., REF

// Item parameters; assembled using makeItem
var BackgroundColor   = "white"        // accept the HTML-defined colors
var TextColor         = "black"        					// 
var OneItemShape      = "rect"             // one of the svg primitive
var OneItemShownColor = "rgb(0,0,0)"       // black
var OneItemBlinkColor = "rgb(128,128,128)" // gray
var OneItemClickColor = "rgb(0,0,255)"     // blue
var OneItemSize       = 1/10               // proportion of the item relative to minscreen 
var OneItemMargin     = 1/50               // margin to leave empty around the item, relative to minscreen 

console.log('End of the parameter definitions')

var preload = {
  type: 'preload',
  auto_preload: true} 

// set the background color
document.body.style.backgroundColor = BackgroundColor; 
document.body.style.color = TextColor; 

// these two lines convert the relative sizes into pixel sizes LEAVE UNCHANGED
var OneItemSizePX     = Math.floor(OneItemSize * Math.min(screen.width, screen.height))
var OneItemMarginPX   = Math.floor(OneItemMargin * Math.min(screen.width, screen.height))
console.log(`Item dimensions in pixels are: (size) ${OneItemSizePX}, (margins) ${OneItemMarginPX}`);

// Function that builts an HTML svg (scalable vector graphic) image
// may need to be adapted if a different shape is chosen
var makeItem = function(color) {
    return(`<svg width="${OneItemSizePX}" height="${OneItemSizePX}"><${OneItemShape} width="${OneItemSizePX}" height="${OneItemSizePX}" style="fill:${color};stroke-width:0;"></svg>`);
}

// Empty lists of items; are to be populated by PositionFunction 
var ListOfItems         = new Array(nItems); // the array is full length bcse jsPsych updates it too slow 
var ListOfBlinkingItems = new Array(nItems); // idem                                                      
var ListOfButtons       = new Array(0);
var nBlinkingItems      = null;
var nBlinkingItems      = null;
var acc_accumulation    = null;

// create items positions
// relative X position of items
ListOfItems[0] = []; ListOfItems[1] = []; ListOfItems[2] = []; ListOfItems[3] = [];
ListOfItems[4] = []; ListOfItems[5] = []; ListOfItems[6] = []; ListOfItems[7] = []; ListOfItems[8] = [];

ListOfItems[0].x = 0.5 * screen.width;  
ListOfItems[1].x = 0.27 * screen.width; 
ListOfItems[2].x = 0.64 * screen.width; 
ListOfItems[3].x = 0.31 * screen.width; 
ListOfItems[4].x = 0.55 * screen.width; 
ListOfItems[5].x = 0.70 * screen.width; 
ListOfItems[6].x = 0.23 * screen.width; 
ListOfItems[7].x = 0.38 * screen.width; 
ListOfItems[8].x = 0.52 * screen.width; 

ListOfItemsXPositions = [ListOfItems[0].x, ListOfItems[1].x, ListOfItems[2].x, ListOfItems[3].x, ListOfItems[4].x,
                        ListOfItems[5].x,ListOfItems[6].x,ListOfItems[7].x, ListOfItems[8].x]


// relative Y position of items
ListOfItems[0].y = 0.25 * screen.height;  
ListOfItems[1].y = 0.14 * screen.height;  
ListOfItems[2].y = 0.29 * screen.height;  
ListOfItems[3].y = 0.35 * screen.height;  
ListOfItems[4].y = 0.42 * screen.height;  
ListOfItems[5].y = 0.51 * screen.height;  
ListOfItems[6].y = 0.52 * screen.height;  
ListOfItems[7].y = 0.63 * screen.height;  
ListOfItems[8].y = 0.58 * screen.height;  


ListOfItems[0].ItemHTML  = `<p style = "position:absolute; margin-top: 0em; left: ${ListOfItems[0].x}px; top: ${ListOfItems[0].y}px">`+ `${makeItem(OneItemShownColor)} </p>`;
ListOfItems[0].ItemBLANK = `<p style = "position:absolute; margin-top: 0em; left: ${ListOfItems[0].x}px; top: ${ListOfItems[0].y}px">`+ `${makeItem(OneItemBlinkColor)}</p>`;
ListOfItems[0].ItemACKNW = `<p style = "position:absolute; margin-top: 0em; left: ${ListOfItems[0].x}px; top: ${ListOfItems[0].y}px">`+ `${makeItem(OneItemClickColor)}</p>`;

ListOfItems[1].ItemHTML  = `<p style = "position:absolute; margin-top: 0em; left: ${ListOfItems[1].x}px; top: ${ListOfItems[1].y}px">`+ `${makeItem(OneItemShownColor)} </p>`;
ListOfItems[1].ItemBLANK = `<p style = "position:absolute; margin-top: 0em; left: ${ListOfItems[1].x}px; top: ${ListOfItems[1].y}px">`+ `${makeItem(OneItemBlinkColor)}</p>`;
ListOfItems[1].ItemACKNW = `<p style = "position:absolute; margin-top: 0em; left: ${ListOfItems[1].x}px; top: ${ListOfItems[1].y}px">`+ `${makeItem(OneItemClickColor)}</p>`;

ListOfItems[2].ItemHTML  = `<p style = "position:absolute; margin-top: 0em; left: ${ListOfItems[2].x}px; top: ${ListOfItems[2].y}px">`+ `${makeItem(OneItemShownColor)} </p>`;
ListOfItems[2].ItemBLANK = `<p style = "position:absolute; margin-top: 0em; left: ${ListOfItems[2].x}px; top: ${ListOfItems[2].y}px">`+ `${makeItem(OneItemBlinkColor)}</p>`;
ListOfItems[2].ItemACKNW = `<p style = "position:absolute; margin-top: 0em; left: ${ListOfItems[2].x}px; top: ${ListOfItems[2].y}px">`+ `${makeItem(OneItemClickColor)}</p>`;

ListOfItems[3].ItemHTML  = `<p style = "position:absolute; margin-top: 0em; left: ${ListOfItems[3].x}px; top: ${ListOfItems[3].y}px">`+ `${makeItem(OneItemShownColor)} </p>`;
ListOfItems[3].ItemBLANK = `<p style = "position:absolute; margin-top: 0em; left: ${ListOfItems[3].x}px; top: ${ListOfItems[3].y}px">`+ `${makeItem(OneItemBlinkColor)}</p>`;
ListOfItems[3].ItemACKNW = `<p style = "position:absolute; margin-top: 0em; left: ${ListOfItems[3].x}px; top: ${ListOfItems[3].y}px">`+ `${makeItem(OneItemClickColor)}</p>`;

ListOfItems[4].ItemHTML  = `<p style = "position:absolute; margin-top: 0em; left: ${ListOfItems[4].x}px; top: ${ListOfItems[4].y}px">`+ `${makeItem(OneItemShownColor)} </p>`;
ListOfItems[4].ItemBLANK = `<p style = "position:absolute; margin-top: 0em; left: ${ListOfItems[4].x}px; top: ${ListOfItems[4].y}px">`+ `${makeItem(OneItemBlinkColor)}</p>`;
ListOfItems[4].ItemACKNW = `<p style = "position:absolute; margin-top: 0em; left: ${ListOfItems[4].x}px; top: ${ListOfItems[4].y}px">`+ `${makeItem(OneItemClickColor)}</p>`;

ListOfItems[5].ItemHTML  = `<p style = "position:absolute; margin-top: 0em; left: ${ListOfItems[5].x}px; top: ${ListOfItems[5].y}px">`+ `${makeItem(OneItemShownColor)} </p>`;
ListOfItems[5].ItemBLANK = `<p style = "position:absolute; margin-top: 0em; left: ${ListOfItems[5].x}px; top: ${ListOfItems[5].y}px">`+ `${makeItem(OneItemBlinkColor)}</p>`;
ListOfItems[5].ItemACKNW = `<p style = "position:absolute; margin-top: 0em; left: ${ListOfItems[5].x}px; top: ${ListOfItems[5].y}px">`+ `${makeItem(OneItemClickColor)}</p>`;


ListOfItems[6].ItemHTML  = `<p style = "position:absolute; margin-top: 0em; left: ${ListOfItems[6].x}px; top: ${ListOfItems[6].y}px">`+ `${makeItem(OneItemShownColor)} </p>`;
ListOfItems[6].ItemBLANK = `<p style = "position:absolute; margin-top: 0em; left: ${ListOfItems[6].x}px; top: ${ListOfItems[6].y}px">`+ `${makeItem(OneItemBlinkColor)}</p>`;
ListOfItems[6].ItemACKNW = `<p style = "position:absolute; margin-top: 0em; left: ${ListOfItems[6].x}px; top: ${ListOfItems[6].y}px">`+ `${makeItem(OneItemClickColor)}</p>`;

                                        
ListOfItems[7].ItemHTML  = `<p style = "position:absolute; margin-top: 0em; left: ${ListOfItems[7].x}px; top: ${ListOfItems[7].y}px">`+ `${makeItem(OneItemShownColor)} </p>`;
ListOfItems[7].ItemBLANK = `<p style = "position:absolute; margin-top: 0em; left: ${ListOfItems[7].x}px; top: ${ListOfItems[7].y}px">`+ `${makeItem(OneItemBlinkColor)}</p>`;
ListOfItems[7].ItemACKNW = `<p style = "position:absolute; margin-top: 0em; left: ${ListOfItems[7].x}px; top: ${ListOfItems[7].y}px">`+ `${makeItem(OneItemClickColor)}</p>`;

ListOfItems[8].ItemHTML  = `<p style = "position:absolute; margin-top: 0em; left: ${ListOfItems[8].x}px; top: ${ListOfItems[8].y}px">`+ `${makeItem(OneItemShownColor)} </p>`;
ListOfItems[8].ItemBLANK = `<p style = "position:absolute; margin-top: 0em; left: ${ListOfItems[8].x}px; top: ${ListOfItems[8].y}px">`+ `${makeItem(OneItemBlinkColor)}</p>`;
ListOfItems[8].ItemACKNW = `<p style = "position:absolute; margin-top: 0em; left: ${ListOfItems[8].x}px; top: ${ListOfItems[8].y}px">`+ `${makeItem(OneItemClickColor)}</p>`;

console.log('List of items done.')
console.log(ListOfItems)
console.log(ListOfItems[1].x)


// list of blinking items
ListOfBlinkingItems[0] = [];
ListOfBlinkingItems[0].x = ListOfItems[0].x;
ListOfBlinkingItems[0].y = ListOfItems[0].y;
ListOfBlinkingItems[0].ItemHTML  = `<p style = "position:absolute; margin-top: 0em; left: ${ListOfBlinkingItems[0].x}px; top: ${ListOfBlinkingItems[0].y}px">${makeItem(OneItemShownColor)}</p>`;
ListOfBlinkingItems[0].ItemBLANK = `<p style = "position:absolute; margin-top: 0em; left: ${ListOfBlinkingItems[0].x}px; top: ${ListOfBlinkingItems[0].y}px">${makeItem(OneItemBlinkColor)}</p>`;                                       

ListOfBlinkingItems[1] = [];
ListOfBlinkingItems[1].x = ListOfItems[1].x;
ListOfBlinkingItems[1].y = ListOfItems[1].y;
ListOfBlinkingItems[1].ItemHTML  = `<p style = "position:absolute; margin-top: 0em; left: ${ListOfBlinkingItems[1].x}px; top: ${ListOfBlinkingItems[1].y}px">${makeItem(OneItemShownColor)}</p>`;
ListOfBlinkingItems[1].ItemBLANK = `<p style = "position:absolute; margin-top: 0em; left: ${ListOfBlinkingItems[1].x}px; top: ${ListOfBlinkingItems[1].y}px">${makeItem(OneItemBlinkColor)}</p>`;   

ListOfBlinkingItems[2] = [];
ListOfBlinkingItems[2].x = ListOfItems[2].x;
ListOfBlinkingItems[2].y = ListOfItems[2].y;
ListOfBlinkingItems[2].ItemHTML  = `<p style = "position:absolute; margin-top: 0em; left: ${ListOfBlinkingItems[2].x}px; top: ${ListOfBlinkingItems[2].y}px">${makeItem(OneItemShownColor)}</p>`;
ListOfBlinkingItems[2].ItemBLANK = `<p style = "position:absolute; margin-top: 0em; left: ${ListOfBlinkingItems[2].x}px; top: ${ListOfBlinkingItems[2].y}px">${makeItem(OneItemBlinkColor)}</p>`;   

ListOfBlinkingItems[3] = [];
ListOfBlinkingItems[3].x = ListOfItems[3].x;
ListOfBlinkingItems[3].y = ListOfItems[3].y;
ListOfBlinkingItems[3].ItemHTML  = `<p style = "position:absolute; margin-top: 0em; left: ${ListOfBlinkingItems[3].x}px; top: ${ListOfBlinkingItems[3].y}px">${makeItem(OneItemShownColor)}</p>`;
ListOfBlinkingItems[3].ItemBLANK = `<p style = "position:absolute; margin-top: 0em; left: ${ListOfBlinkingItems[3].x}px; top: ${ListOfBlinkingItems[3].y}px">${makeItem(OneItemBlinkColor)}</p>`;   

ListOfBlinkingItems[4] = [];
ListOfBlinkingItems[4].x = ListOfItems[4].x;
ListOfBlinkingItems[4].y = ListOfItems[4].y;
ListOfBlinkingItems[4].ItemHTML  = `<p style = "position:absolute; margin-top: 0em; left: ${ListOfBlinkingItems[4].x}px; top: ${ListOfBlinkingItems[4].y}px">${makeItem(OneItemShownColor)}</p>`;
ListOfBlinkingItems[4].ItemBLANK = `<p style = "position:absolute; margin-top: 0em; left: ${ListOfBlinkingItems[4].x}px; top: ${ListOfBlinkingItems[4].y}px">${makeItem(OneItemBlinkColor)}</p>`;   

ListOfBlinkingItems[5] = [];
ListOfBlinkingItems[5].x = ListOfItems[5].x;
ListOfBlinkingItems[5].y = ListOfItems[5].y;
ListOfBlinkingItems[5].ItemHTML  = `<p style = "position:absolute; margin-top: 0em; left: ${ListOfBlinkingItems[5].x}px; top: ${ListOfBlinkingItems[5].y}px">${makeItem(OneItemShownColor)}</p>`;
ListOfBlinkingItems[5].ItemBLANK = `<p style = "position:absolute; margin-top: 0em; left: ${ListOfBlinkingItems[5].x}px; top: ${ListOfBlinkingItems[5].y}px">${makeItem(OneItemBlinkColor)}</p>`;   

ListOfBlinkingItems[6] = [];
ListOfBlinkingItems[6].x = ListOfItems[6].x;
ListOfBlinkingItems[6].y = ListOfItems[6].y;
ListOfBlinkingItems[6].ItemHTML  = `<p style = "position:absolute; margin-top: 0em; left: ${ListOfBlinkingItems[6].x}px; top: ${ListOfBlinkingItems[6].y}px">${makeItem(OneItemShownColor)}</p>`;
ListOfBlinkingItems[6].ItemBLANK = `<p style = "position:absolute; margin-top: 0em; left: ${ListOfBlinkingItems[6].x}px; top: ${ListOfBlinkingItems[6].y}px">${makeItem(OneItemBlinkColor)}</p>`;   

ListOfBlinkingItems[7] = [];
ListOfBlinkingItems[7].x = ListOfItems[7].x;
ListOfBlinkingItems[7].y = ListOfItems[7].y;
ListOfBlinkingItems[7].ItemHTML  = `<p style = "position:absolute; margin-top: 0em; left: ${ListOfBlinkingItems[7].x}px; top: ${ListOfBlinkingItems[7].y}px">${makeItem(OneItemShownColor)}</p>`;
ListOfBlinkingItems[7].ItemBLANK = `<p style = "position:absolute; margin-top: 0em; left: ${ListOfBlinkingItems[7].x}px; top: ${ListOfBlinkingItems[7].y}px">${makeItem(OneItemBlinkColor)}</p>`;   

ListOfBlinkingItems[8] = [];
ListOfBlinkingItems[8].x = ListOfItems[8].x;
ListOfBlinkingItems[8].y = ListOfItems[8].y;
ListOfBlinkingItems[8].ItemHTML  = `<p style = "position:absolute; margin-top: 0em; left: ${ListOfBlinkingItems[8].x}px; top: ${ListOfBlinkingItems[8].y}px">${makeItem(OneItemShownColor)}</p>`;
ListOfBlinkingItems[8].ItemBLANK = `<p style = "position:absolute; margin-top: 0em; left: ${ListOfBlinkingItems[8].x}px; top: ${ListOfBlinkingItems[8].y}px">${makeItem(OneItemBlinkColor)}</p>`;   

console.log('List of bliking items done.')
console.log('End of the items definitions')
console.log(ListOfBlinkingItems)



// they are also concatenated in a list of buttons 
ListOfButtons.push(`<button type=button style = "position:absolute; `+ `margin-top: 0px; padding: 0px; background: none; `+ 
`border: none; left: ${ListOfItems[0].x}px; top: ${ListOfItems[0].y}px">`+ `${makeItem(OneItemShownColor)}</button>` )

ListOfButtons.push(`<button type=button style = "position:absolute; `+ `margin-top: 0px; padding: 0px; background: none; `+ 
`border: none; left: ${ListOfItems[1].x}px; top: ${ListOfItems[1].y}px">`+ `${makeItem(OneItemShownColor)}</button>` )

ListOfButtons.push(`<button type=button style = "position:absolute; `+ `margin-top: 0px; padding: 0px; background: none; `+ 
`border: none; left: ${ListOfItems[2].x}px; top: ${ListOfItems[2].y}px">`+ `${makeItem(OneItemShownColor)}</button>` )

ListOfButtons.push(`<button type=button style = "position:absolute; `+ `margin-top: 0px; padding: 0px; background: none; `+ 
`border: none; left: ${ListOfItems[3].x}px; top: ${ListOfItems[3].y}px">`+ `${makeItem(OneItemShownColor)}</button>` )

ListOfButtons.push(`<button type=button style = "position:absolute; `+ `margin-top: 0px; padding: 0px; background: none; `+ 
`border: none; left: ${ListOfItems[4].x}px; top: ${ListOfItems[4].y}px">`+ `${makeItem(OneItemShownColor)}</button>` )

ListOfButtons.push(`<button type=button style = "position:absolute; `+ `margin-top: 0px; padding: 0px; background: none; `+ 
`border: none; left: ${ListOfItems[5].x}px; top: ${ListOfItems[5].y}px">`+ `${makeItem(OneItemShownColor)}</button>` )

ListOfButtons.push(`<button type=button style = "position:absolute; `+ `margin-top: 0px; padding: 0px; background: none; `+ 
`border: none; left: ${ListOfItems[6].x}px; top: ${ListOfItems[6].y}px">`+ `${makeItem(OneItemShownColor)}</button>` )

ListOfButtons.push(`<button type=button style = "position:absolute; `+ `margin-top: 0px; padding: 0px; background: none; `+ 
`border: none; left: ${ListOfItems[7].x}px; top: ${ListOfItems[7].y}px">`+ `${makeItem(OneItemShownColor)}</button>` )

ListOfButtons.push(`<button type=button style = "position:absolute; `+ `margin-top: 0px; padding: 0px; background: none; `+ 
`border: none; left: ${ListOfItems[8].x}px; top: ${ListOfItems[8].y}px">`+ `${makeItem(OneItemShownColor)}</button>` )

console.log('List of buttons done.')
console.log(ListOfButtons)





// mouse pointer functions 
var HideMouse = function() { if (MouseToBeHidden) {
        document.querySelector('head').insertAdjacentHTML('beforeend', '<style id="cursor-toggle"> html { cursor: none; } </style>');
    }
}
var ShowMouse = function() { if (MouseToBeHidden) {
        document.querySelector('#cursor-toggle').remove();
    }
}

console.log('hide mouse ')

// *************************************** 
// *   Defining experiment-level events  * 
// *************************************** 

// // Toggle full screen on or off 
// var FullScreenOn = {
//     type: 'fullscreen',
//     message: "<p>The experiment will be in full screen mode once you click on the button.</p>",
//     button_label: 'Full Screen Mode',
//     fullscreen_mode: true
// }
// var FullScreenOff = {
//     type: 'fullscreen',
//     fullscreen_mode: false
// }
// the Welcome and Bye object descriptions 
var SayWelcome = {
    type: 'html-button-response',
    stimulus: 'Welcome to the Corsi Task. </p> In this task, we would like to know how well you can reproduce the order of blocks highlighted on the screen. </p> '+
    'First, you will be shown the order of blocks highlighted one by one on the screen and you should try to remember the order of the blocks highlighted as accurately as possible.</p>' +
    'You will then immediately reproduce the same order of blocks highlighted by clicking on the blocks in exactly the same order as shown before.</p>' +
    'Click on the Next button to begin the practice trials.',
    choices: ['Next'],
}

var SayFormal = {
    type: 'html-button-response',
    stimulus: 'This is the end of the practice trials. You will now begin the experiment trials. </p>Click on the Next button to begin.',
    choices: ['Next'],
}

var SayBye = {
    type: 'html-button-response',
    stimulus: 'Thank you for your participation.</p> Click on Next button to start next task.',
    choices: ['Next'],
}


// *************************************** 
// *     Defining trial-level events     * 
// *************************************** 

var SetnBlinkingItems = {
    type: 'call-function',
    func: function() {
            nBlinkingItems =  jsPsych.timelineVariable("OneSequenceLength", true); 
            console.log("<<<<<<<<<<<<<<<<<<<<<<<<<number of blinking items:", nBlinkingItems);
            console.log(nBlinkingItems);
            currentBlinkingItem = 0;  // counter that will count the number of blinks    
            currentResponse = 0;      // counter that will count the number of responses  
        },
}


var WaitInterTrialDuration = {
    type: 'html-keyboard-response-noerase',
    stimulus: '',
    choices: "NO_KEYS",
    trial_duration: InterTrialDuration
}


var WaitPreBlinkDuration = {
    type: 'html-keyboard-response-noerase',
    stimulus: '',
    choices: "NO_KEYS",
    trial_duration: PreBlinkDuration
}


var WaitBlinkDuration = {
    type: 'html-keyboard-response-noerase',
    stimulus: '',
    choices: "NO_KEYS",
    trial_duration: BlinkDuration
}


var WaitInterBlinkDuration = {
    type: 'html-keyboard-response-noerase',
    stimulus: '',
    choices: "NO_KEYS",
    trial_duration: InterBlinkDuration
}


var WaitPostBlinkDuration = {
    type: 'html-keyboard-response-noerase',
    stimulus: '',
    choices: "NO_KEYS",
    trial_duration: PostBlinkDuration,
}


var ShowFixation = {
    type: 'html-keyboard-response',
    stimulus: '+',
    choices: "NO_KEYS",
    trial_duration: FixationDuration,
    on_start: HideMouse
}


var ShowOneItem = {
    type: 'html-keyboard-response-noerase',
    stimulus: jsPsych.timelineVariable('ItemHTML'),
    choices: "NO_KEYS",
    trial_duration: 0
}


var ShowAllItems = {
    timeline: [ ShowOneItem ],
    timeline_variables: ListOfItems
}


var BlinkOneItem = {
    type: 'html-keyboard-response-noerase',
    stimulus: jsPsych.timelineVariable('ItemBLANK'),
    choices: jsPsych.NO_KEYS,
    trial_duration: 0,
    data: {phase: 'BlinkedItemsPhase'},
}


var BlinkAllItems = {
    timeline: [ BlinkOneItem, WaitBlinkDuration, ShowOneItem, WaitInterBlinkDuration ],
    timeline_variables: ListOfBlinkingItems,
    sample: {type: 'without-replacement'},
    conditional_function: function() {if(currentBlinkingItem++ < nBlinkingItems) {return true;} else {return false;}}
}



var StartResponding = {
    type: 'audio-keyboard-response',
    stimulus: RecallSignal,
    choices: jsPsych.NO_KEYS,
    trial_duration: RecallSignalDuration,
    on_start: ShowMouse
}


var BlinkThatResponse = {
    type: 'html-button-response',
    stimulus: '',
    button_html: function() {
                    var choice = jsPsych.data.get().last(1).values()[0].button_pressed; 
                    if (choice !== null) {return ListOfButtons.concat(ListOfItems[choice].ItemACKNW);} 
                    else {return "";}
                },
    trial_duration: AcknowledgeDuration,
    choices: function() {return [...Array(ListOfButtons.length+1).keys()]}
}



var ReadOneResponse = {
    type: 'html-button-response',
    stimulus: '',
    button_html: ListOfButtons,
    choices: function() {return [...Array(ListOfButtons.length).keys()] },
    trial_duration: 5000
}



var ReadAllResponses = {
    timeline: [ ReadOneResponse, BlinkThatResponse ], 
    timeline_variables: ListOfBlinkingItems,
    conditional_function: function() {if(currentResponse++ < nBlinkingItems) {return true;} else {return false;}}
}

let j = 1;
let terminate = false;
var GatherResponses = {
    // jsPsych.data collects everything, so needs to filter
    // the odd button presses on the last 2*nBlinkingItems events
    type: 'call-function',
    func: function() {
        
        // Find the blink positions. 
        var blinkedItems = jsPsych.data.get().filter({phase: 'BlinkedItemsPhase'}).last(nBlinkingItems).select('stimulus').values;
        let xPositions = "";
        let xPositions_index = "";
        for (let i = 0; i < blinkedItems.length; i++) {
            xPositions = blinkedItems[i].match(/(-\d+|\d+)(,\d+)*(\.\d+)*/g)[1] // extract X position numbers;
            xPositions_index = xPositions_index + [ListOfItemsXPositions.findIndex(element => element == xPositions)]
        }


        var stem = jsPsych.data.get().filter({trial_type: 'html-button-response'}).last(2*nBlinkingItems);
        var responses = stem.select('button_pressed').values.filter((a,i)=>i%2===0);
        responses = responses.map(Number);
        jsPsych.data.addProperties({resp: responses});
        console.log("click order: ", responses )

        var correct   =  Array.from(String(xPositions_index), Number);
        jsPsych.data.addProperties({stimuli: correct});
        console.log("Correct: ", correct)
        
        var acc       = responses.every(function(value, index) { return value === correct[index]});
        jsPsych.data.addProperties({accuracy: acc});
        
        var rts = stem.select('rt').values.filter((a,i)=>i%2===0);
        jsPsych.data.addProperties({RT: rts});
        
        console.log("Responses: ", responses, " accuracty: ", acc, " RT: ", rts);

        // calculate acc for two trials in one sequence
        if (j%2===0 && j!=0) {
            acc_accumulation = acc_accumulation+acc;
            // console.log("acc_accumulation 1: ",acc_accumulation)
            if (acc_accumulation==0){terminate = true;} else {terminate = false}
            // console.log("termination status 1:", terminate)
            acc_accumulation = 0;
            j = 1;
        } else {
            acc_accumulation = acc_accumulation+acc;
            j++;                    
        }

        // console.log("acc_accumulation: ",acc_accumulation, "j ",j, "termination status:", terminate)
    }
}



var break_trial = {
    type: 'html-button-response',
    stimulus:  " ",
    choices: " ",
    trial_duration: 1000,
  };
  
  var break_conditional = {
      timeline: [break_trial],
      // terminate experiment if two errors in a row. 
      conditional_function: function() {
          if (terminate==true) {
            return jsPsych.endExperiment('This task has been terminated.');;
          } else {
            return null;
          }
    }
  };



  var RunOneTrial_prac = {
    timeline: [ SetnBlinkingItems,
                WaitInterTrialDuration,
                ShowFixation, 
                ShowAllItems, 
                WaitPreBlinkDuration, 
                BlinkAllItems, 
                WaitPostBlinkDuration,
                StartResponding,
                ReadAllResponses,
                //GatherResponses,
            ],
    randomize_order:    false,
    repetitions:        sequenceRepetition
}



var RunOneTrial = {
    timeline: [ SetnBlinkingItems,
                WaitInterTrialDuration,
                ShowFixation, 
                ShowAllItems, 
                WaitPreBlinkDuration, 
                BlinkAllItems, 
                WaitPostBlinkDuration,
                StartResponding,
                ReadAllResponses,
                GatherResponses,
                break_conditional // break if fails both trials in one sequence. 
            ],
    randomize_order:    false,
    repetitions:        sequenceRepetition
}


var RunPractice = {
    timeline:           [ RunOneTrial_prac ],
    timeline_variables: sequenceLengths_prac,
    randomize_order:    sequenceRandomOrder
}

var RunAllTrials = {
    timeline:           [ RunOneTrial ],
    timeline_variables: sequenceLengths,
    randomize_order:    sequenceRandomOrder
}


jsPsych.init({
    use_webaudio: false,
    timeline: [SayWelcome, RunPractice, SayFormal, RunAllTrials, SayBye],
    on_finish: function(){
      window.location.href = debrifurl},
    })
