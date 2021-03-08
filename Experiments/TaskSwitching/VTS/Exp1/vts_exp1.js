// Online version of a voluntary self-organised multitasking experiment
// Starting Point: Mittelstädt, Schaffernak, Miller, & Kiesel (2020). Balancing
// cognitive and environmental constraints when deciding to switch tasks:
// Exploring self-reported task-selection strategies in self-organised
// multitasking. QJEP, 1-12.
//
// Method Section
// Stimuli:
//  Presented on black background
//  Number task (odd vs. even) were the digits 2-9
//  Letter task (vowel vs. consonant) were the letters A,E,G,I,K,M,R, and U (uppercase)
//  Presented one above the other (number vs. letter constant within, counter-balanced across)
//
// Responses:
//  Left/right index finger responses with the "y", "x", ",", "." keys (NB. changed to "Q", "W", "O", and "P")
//  Task to hand mapping counter-balanced across participants
//  Finger response mapping randomly selected for each participants
//
// Block/Trial Structure
// 10 blocks of 100 trials (50 trials of each task)
//    1st 1/2 blocks (repetition stimulus presented at an SOA delay of +50 ms to previous)
//    2nd 1/2 blocks (repetition stimulus presented at a random SOA, 50-350 ms, steps of 50 ms)
// Correct response -> Next stimulus display presented after 300 ms
// Incorrect response -> Error screen showing S-R mappings presented for 2500 ms
// Self-paced breaks with performance feedback (total time + number of errors)
//    If more than 10 block errors, additional screen for 30 seconds indicating
//    too many errors + correct S-R mappings

////////////////////////////////////////////////////////////////////////
//                         Canvas Properties                          //
////////////////////////////////////////////////////////////////////////
const canvas_colour = 'rgba(200, 200, 200, 1)';
const canvas_size = [1280, 720];
const canvas_border = '5px solid black';

const check_screen = {
  type: 'check-screen-resolution',
  width: canvas_size[0],
  height: canvas_size[1],
  timing_post_trial: 0,
  on_finish: function () {
    reload_if_not_fullscreen();
  },
};

////////////////////////////////////////////////////////////////////////
//                             Experiment                             //
////////////////////////////////////////////////////////////////////////
const expName = getFileName();
const dirName = getDirName();
const vpNum = genVpNum();
const pcInfo = getComputerInfo();
const nFiles = getNumberOfFiles('/Common/num_files.php', dirName + 'data/');

////////////////////////////////////////////////////////////////////////
//                           Exp Parameters                           //
////////////////////////////////////////////////////////////////////////
const prms = {
  nTrls: 10, // 100, // number of trials within a block
  nBlks: 10, // number of blocks
  nPoor: 2, // 10, // number of within block errors before poor performance warning
  fbDur: [0, 2500], // feedback duration for correct and incorrect trials, respectively
  waitDur: 1000,
  stimFont: '50px Arial',
  stimPos: 25,
  fbTxt: ['', 'Falsch'],
  fbFont: '28px Arial',
  numbers: [2, 3, 4, 5, 6, 7, 8, 9],
  numbersEven: [2, 4, 6, 8],
  numbersOdd: [3, 5, 7, 9],
  letters: ['A', 'E', 'G', 'I', 'K', 'M', 'R', 'U'],
  lettersVowel: ['A', 'E', 'I', 'U'],
  lettersConsonant: ['G', 'K', 'M', 'R'],
  rsi: 300,
  soaStep: 50,
  soas: [50, 100, 150, 200, 250, 300, 350],
  numberPos: null,
  letterPos: null,
  contKey: [' '],
  respKeys: ['Q', 'W', 'O', 'P'],
  respKeysNumber: null,
  respKeysLetter: null,
};

const vts_data = {
  cTrl: 1,
  cBlk: 1,
  nLetter: 0,
  nNumber: 0,
  previousTask: 'na',
  soa: 0,
  repetitionCounter: 0,
  poor_performance: false,
};

const nVersion = getVersionNumber(nFiles, 4);
jsPsych.data.addProperties({ version: nVersion });
let handMapping, handMappingInstructions;
let fingerMapping;
if ([1, 3].includes(nVersion)) {
  handMapping = ['number', 'letter'];
  handMappingInstructions = ['Zahlenaufgabe', 'Buchstabenaufgabe'];
  prms.respKeysNumber = [prms.respKeys[0], prms.respKeys[1]];
  prms.respKeysLetter = [prms.respKeys[2], prms.respKeys[3]];
  prms.numberPos = prms.stimPos;
  prms.letterPos = -prms.stimPos;
  fingerMapping = shuffle(['Ungerade', 'Gerade']).concat(shuffle(['Vokal', 'Konsonant']));
} else {
  handMapping = ['letter', 'number'];
  handMappingInstructions = ['Buchstabenaufgabe', 'Zahlenaufgabe'];
  prms.respKeysLetter = [prms.respKeys[0], prms.respKeys[1]];
  prms.respKeysNumber = [prms.respKeys[2], prms.respKeys[3]];
  prms.numberPos = -prms.stimPos;
  prms.letterPos = prms.stimPos;
  fingerMapping = shuffle(['Vokal', 'Konsonant']).concat(shuffle(['Ungerade', 'Gerade']));
}

let soaCondition;
if ([1, 2].includes(nVersion)) {
  soaCondition = repeatArray('predictable', prms.nBlks / 2).concat(repeatArray(('random', prms.nBlks / 2)));
} else if ([3, 4].includes(nVersion)) {
  soaCondition = repeatArray('random', prms.nBlks / 2).concat(repeatArray(('predictable', prms.nBlks / 2)));
}

let respText = generate_formatted_html({
  text: `${handMappingInstructions[0]} &ensp;&ensp;&ensp;&ensp;&ensp;&ensp;&ensp;&ensp;&ensp;&ensp; ${handMappingInstructions[1]}<br><br>
    ${fingerMapping[0]} &ensp;&ensp;&ensp;&ensp; ${fingerMapping[1]} &ensp;&ensp;&ensp;&ensp;&ensp;&ensp;&ensp;&ensp;&ensp; ${fingerMapping[2]} &ensp;&ensp;&ensp;&ensp; ${fingerMapping[3]} <br>
    ("${prms.respKeys[0]}-Taste") &ensp;&ensp; ("${prms.respKeys[1]}-Taste") &ensp;&ensp;&ensp; ("${prms.respKeys[2]}-Taste") &ensp;&ensp; ("${prms.respKeys[3]}-Taste")`,
  fontsize: 26,
  bold: true,
});

////////////////////////////////////////////////////////////////////////
//                      Experiment Instructions                       //
////////////////////////////////////////////////////////////////////////

const task_instructions1 = {
  type: 'html-keyboard-response-canvas',
  canvas_colour: canvas_colour,
  canvas_size: canvas_size,
  canvas_border: canvas_border,
  stimulus: generate_formatted_html({
    text: `Willkommen bei unserem Experiment:<br><br>
    Die Teilnahme ist freiwillig und du darfst das Experiment jederzeit abbrechen.
    Bitte stelle sicher, dass du dich in einer ruhigen Umgebung befindest und
    genügend Zeit hast, um das Experiment durchzuführen.
    Wir bitten dich die ca. 45 Minuten konzentriert zu arbeiten.<br><br>
    Drücke eine beliebige Taste, um fortzufahren!`,
    fontsize: 26,
    align: 'left',
    lineheight: 1.5,
  }),
};

const task_instructions2 = {
  type: 'html-keyboard-response-canvas',
  canvas_colour: canvas_colour,
  canvas_size: canvas_size,
  canvas_border: canvas_border,
  stimulus: generate_formatted_html({
    text: `Du erhaelst den Code für die Versuchspersonenstunden und weitere Anweisungen
    am Ende des Experimentes. Bei Fragen oder Problemen wende dich bitte an:<br><br>
    hiwipibio@gmail.com<br><br>
    Drücke eine beliebige Taste, um fortzufahren!`,
    fontsize: 26,
    align: 'left',
    lineheight: 1.5,
  }),
};

const task_instructions3 = {
  type: 'html-keyboard-response-canvas',
  canvas_colour: canvas_colour,
  canvas_size: canvas_size,
  canvas_border: canvas_border,
  stimulus: generate_formatted_html({
    text: `Du wirst die folgenden Antworttasten der Tastatur benötigen:<br><br>
    Verwende den Zeige- und Mittelfinger deiner linken Hand für die Tasten "${prms.respKeys[0]}" und "${prms.respKeys[1]}" auf der linken Seite.<br><br>
    Verwende den Zeige- und Mittelfinger deiner rechten Hand für die Tasten "${prms.respKeys[2]}" und "${prms.respKeys[3]}" auf der rechten Seite.<br><br><br>
    Drücke eine beliebige Taste, um fortzufahren.`,
    fontsize: 26,
    align: 'left',
    lineheight: 1.5,
  }),
};

const task_instructions4 = {
  type: 'html-keyboard-response-canvas',
  canvas_colour: canvas_colour,
  canvas_size: canvas_size,
  canvas_border: canvas_border,
  stimulus:
    generate_formatted_html({
      text: `Für die Buchstabenaufgabe musst du entscheiden ob der Buchstabe ein Vokal oder Konsonant ist.
    Für die Zahlenaufgabe musst du entscheiden ob die Zahl gerade oder ungerade ist.
    Jede Aufgabe wird mit einer Hand bearbeitet:<br>`,
      fontsize: 26,
      align: 'left',
      lineheight: 1.5,
    }) +
    respText +
    generate_formatted_html({
      text: `<br>Drücke eine beliebige Taste, um fortzufahren.`,
      fontsize: 26,
      align: 'left',
      lineheight: 1.5,
    }),
};

const task_instructions5 = {
  type: 'html-keyboard-response-canvas',
  canvas_colour: canvas_colour,
  canvas_size: canvas_size,
  canvas_border: canvas_border,
  stimulus: generate_formatted_html({
    text: `In jedem einzelnen Durchgang erscheint ein Buchstabe und eine Zahl,
    aber eine Aufgabe erscheint später wie die andere Aufgabe. Die
    Reaktionszeitmessung in jedem Durchgang beginnt sobald die erste Aufgabe
    erscheint.<br>
    Du darfst in einem Durchgang entscheiden ob du auf die zuerst
    erscheinende Aufgabe reagieren willst oder auf die andere Aufgabe
    wartest, aber versuche so schnell und so genau wie möglich zu sein!<br>
    Verwende zur Bearbeitung einer Aufgabe einfach die entsprechende Hand mit
    der korrekten Antworttaste.<br><br>
    Drücke eine beliebige Taste, um fortzufahren.`,
    fontsize: 26,
    align: 'left',
    lineheight: 1.5,
  }),
};

const task_instructions6 = {
  type: 'html-keyboard-response-canvas',
  canvas_colour: canvas_colour,
  canvas_size: canvas_size,
  canvas_border: canvas_border,
  stimulus: generate_formatted_html({
    text: `Insgesamt müssen jedoch auf ${prms.nTrls / 2} Buchstaben und ${prms.nTrls / 2} Zahlen reagiert
    werden. Solang beide Aufgaben verfügbar sind darfst du entscheiden welche
    der beiden Aufgaben du bearbeiten willst Wenn nur ein “#”- Zeichen statt
      dem Buchstabe/Zahl erscheint, dann hast du die nötige Anzahl von Aufgaben
      dieses Typs bearbeitet und musst dementsprechend immer auf die andere
      Aufgabe warten bis der Block zu Ende ist.<br><br>
      Drücke eine beliebige Taste, um fortzufahren.`,
    fontsize: 26,
    align: 'left',
    lineheight: 1.5,
  }),
};

const task_instructions_responses = {
  type: 'html-keyboard-response-canvas',
  canvas_colour: canvas_colour,
  canvas_size: canvas_size,
  canvas_border: canvas_border,
  stimulus:
    respText +
    generate_formatted_html({
      text: `Drücke eine beliebige Taste, um fortzufahren.`,
      align: 'center',
      fontsize: 26,
      lineheight: 1.5,
    }),
};

const task_instructions_responses_reminder = {
  type: 'html-keyboard-response-canvas',
  canvas_colour: canvas_colour,
  canvas_size: canvas_size,
  canvas_border: canvas_border,
  stimulus: '',
  on_start: function (trial) {
    trial.stimulus =
      generate_formatted_html({
        text: `Block ${vts_data.cBlk} von ${prms.nBlks}<br><br>
        In jedem Block gibt es ${prms.nTrls / 2} Buchstaben und ${
          prms.nTrls / 2
        } Zahlenaufgaben und du musst somit insgesamt ${prms.nTrls} Aufgaben
        bearbeiten. Eine Aufgabe (Buchstabe oder Zahl) erscheint jedoch später
        als die andere Aufgabe. Du kannst entscheiden ob du die zuerst
        erscheinende Aufgtabe bearbeitest oder auf die andere Aufgabe
        bearbeitest sofern beide Aufgaben verfügbar sind, aber versuche so
        schnell und so genau wie möglich zu sein! Wenn ein “#”- Zeichen statt
        einer Aufgabe erscheint, dann musst du die andere Aufgabe bearbeiten.
        Verwende zur Bearbeitung einer Aufgabe einfach die entsprechende Hand
        mit der korrekten Antworttaste.`,
        fontsize: 26,
        align: 'left',
      }) +
      respText +
      generate_formatted_html({
        text: `Drücke eine beliebige Taste, um fortzufahren.`,
        align: 'center',
        fontsize: 26,
        lineheight: 1.5,
      });
  },
};

const blank_canvas = {
  type: 'html-keyboard-response-canvas',
  canvas_colour: canvas_colour,
  canvas_size: canvas_size,
  canvas_border: canvas_border,
  stimulus: '',
  trial_duration: prms.waitDur,
};

function drawStimulus(args) {
  'use strict';
  let ctx = document.getElementById('canvas').getContext('2d');
  ctx.font = prms.stimFont;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = 'black';

  // draw surrounding rectangle
  ctx.strokeStyle = 'black';
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.rect(-40, -50, 80, 100);
  ctx.stroke();

  // letter task
  if (args.draw_letter === 1) {
    ctx.fillText(args.letter, 0, prms.letterPos);
  }

  // number task
  if (args.draw_number === 1) {
    ctx.fillText(args.number, 0, prms.numberPos);
  }
}

function draw_rsi() {
  'use strict';
  let ctx = document.getElementById('canvas').getContext('2d');

  // draw surrounding rectangle
  ctx.strokeStyle = 'grey';
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.rect(-40, -50, 80, 100);
  ctx.stroke();
}

const rsi = {
  type: 'static-canvas-keyboard-response',
  canvas_colour: canvas_colour,
  canvas_size: canvas_size,
  canvas_border: canvas_border,
  translate_origin: true,
  trial_duration: prms.rsi,
  response_ends_trial: false,
  func: draw_rsi,
};

function codeTrial() {
  'use strict';

  let dat = jsPsych.data.get().last(1).values()[0];

  console.log(dat);
  // Which hand/task did they respond with/to?
  let respHand = prms.respKeys.slice(0, 2).includes(dat.key_press.toUpperCase()) ? 'left' : 'right';
  let respTask = respHand === 'left' ? handMapping[0] : handMapping[1];

  // Was it a repeat or repetition of task?
  let transition = 'na';
  if (vts_data.previousTask !== 'na') {
    transition = respTask === vts_data.previousTask ? 'repeat' : 'switch';
  }
  vts_data.repetitionCounter = transition === 'repeat' ? vts_data.repetitionCounter + 1 : 0;

  let error = 1; // If correct, this is changed to 0
  let offset = respHand === 'left' ? 0 : 2;
  if (respTask === 'letter') {
    if (prms.lettersVowel.includes(dat.letter)) {
      if (
        (fingerMapping[0 + offset] === 'Vokal' &&
          jsPsych.pluginAPI.compareKeys(dat.key_press, prms.respKeys[0 + offset])) ||
        (fingerMapping[1 + offset] === 'Vokal' &&
          jsPsych.pluginAPI.compareKeys(dat.key_press, prms.respKeys[1 + offset]))
      ) {
        error = 0;
      }
    } else if (prms.lettersConsonant.includes(dat.letter)) {
      if (
        (fingerMapping[0 + offset] === 'Konsonant' &&
          jsPsych.pluginAPI.compareKeys(dat.key_press, prms.respKeys[0 + offset])) ||
        (fingerMapping[1 + offset] === 'Konsonant' &&
          jsPsych.pluginAPI.compareKeys(dat.key_press, prms.respKeys[1 + offset]))
      ) {
        error = 0;
      }
    }
  } else if (respTask === 'number') {
    if (prms.numbersOdd.includes(dat.number)) {
      if (
        (fingerMapping[0 + offset] === 'Ungerade' &&
          jsPsych.pluginAPI.compareKeys(dat.key_press, prms.respKeys[0 + offset])) ||
        (fingerMapping[1 + offset] === 'Ungerade' &&
          jsPsych.pluginAPI.compareKeys(dat.key_press, prms.respKeys[1 + offset]))
      ) {
        error = 0;
      }
    } else if (prms.numbersEven.includes(dat.number)) {
      if (
        (fingerMapping[0 + offset] === 'Gerade' &&
          jsPsych.pluginAPI.compareKeys(dat.key_press, prms.respKeys[0 + offset])) ||
        (fingerMapping[1 + offset] === 'Gerade' &&
          jsPsych.pluginAPI.compareKeys(dat.key_press, prms.respKeys[1 + offset]))
      ) {
        error = 0;
      }
    }
  }

  // Calculate RT: NB if responding to the repeat stimulus, subtract SOA
  let rt1 = dat.rt;
  let rt2 = transition !== 'repeat' ? dat.rt : dat.rt - vts_data.soa;

  console.log('Resp hand: ', respHand);
  console.log('Resp task: ', respTask);
  console.log('Transitiion: ', transition);
  console.log('SOA: ', vts_data.soa);
  console.log('SOA Condition: ', soaCondition[vts_data.cBlk]);
  console.log('Transitiion: ', transition);
  console.log('RepetitionCounter: ', vts_data.repetitionCounter);
  console.log('RT1: ', rt1);
  console.log('RT2: ', rt2);
  console.log('Error: ', error);

  jsPsych.data.addDataToLastTrial({
    date: Date(),
    blockNum: vts_data.cBlk,
    trialNum: vts_data.cTrl,
    respHand: respHand,
    respTask: respTask,
    transition: transition,
    repetitionCounter: vts_data.repetitionCounter,
    soaCondition: soaCondition[vts_data.cBlk],
    soa: vts_data.soa,
    rt1: rt1,
    rt2: rt2,
    error: error,
  });

  // Update vts_data for next trial
  vts_data.cTrl++;
  if (respTask === 'number') vts_data.nNumber++;
  if (respTask === 'letter') vts_data.nLetter++;
  vts_data.previousTask = respTask;
  if (vts_data.cBlk < prms.nBlks / 2) {
    // if (error === 0) {
    vts_data.soa = transition === 'repeat' ? vts_data.soa + prms.soaStep : 0;
    // } else {
    //   vts_data.soa = 0; // error so reset to 0 ms
    // }
  } else {
    vts_data.soa = prms.soas[getRandomInt(0, prms.soas.length)];
  }
}

const vts_stimulus = {
  type: 'static-canvas-keyboard-response',
  canvas_colour: canvas_colour,
  canvas_size: canvas_size,
  canvas_border: canvas_border,
  translate_origin: true,
  response_ends_trial: true,
  choices: [],
  trial_duration: prms.tooSlow,
  func: [drawStimulus, drawStimulus],
  stimulus_onset: null,
  letter: null,
  number: null,
  func_args: null,
  data: {},
  on_start: function (trial) {
    'use strict';
    // Which letter/number to show
    trial.letter = vts_data.nLetter < prms.nTrls / 2 ? prms.letters[getRandomInt(0, 4)] : '#';
    trial.number = vts_data.nNumber < prms.nTrls / 2 ? prms.numbers[getRandomInt(0, 4)] : '#';

    // activate only response keys for available task
    if (trial.letter !== '#') {
      trial.choices = trial.choices.concat(prms.respKeysLetter);
    }
    if (trial.number !== '#') {
      trial.choices = trial.choices.concat(prms.respKeysNumber);
    }

    // place-holder
    trial.placeholder = 'both';
    if (trial.letter === '#') {
      trial.placeholder = 'number';
    } else if (trial.number === '#') {
      trial.placeholder = 'letter';
    }

    // SOA interval
    trial.stimulus_onset = vts_data.cTrl === 1 ? [0, 0] : [0, vts_data.soa];

    // repeat vs. switch task
    let draw_number, draw_letter;
    if (vts_data.previousTask === 'na') {
      draw_number = [1, 1];
      draw_letter = [1, 1];
    } else if (vts_data.previousTask === 'number') {
      draw_number = [0, 1];
      draw_letter = [1, 1];
    } else if (vts_data.previousTask === 'letter') {
      draw_number = [1, 1];
      draw_letter = [0, 1];
    }

    trial.func_args = [
      { letter: trial.letter, number: trial.number, draw_number: draw_number[0], draw_letter: draw_letter[0] },
      { letter: trial.letter, number: trial.number, draw_number: draw_number[1], draw_letter: draw_letter[1] },
    ];

    trial.data = { stim: 'vts', letter: trial.letter, number: trial.number, placeholder: trial.placeholder };
  },
  on_finish: function () {
    codeTrial();
  },
};

const trial_feedback = {
  type: 'static-canvas-keyboard-response',
  canvas_colour: canvas_colour,
  canvas_size: canvas_size,
  canvas_border: canvas_border,
  translate_origin: true,
  response_ends_trial: false,
  func: drawTrialFeedback,
  on_start: function (trial) {
    let dat = jsPsych.data.get().last(1).values()[0];
    trial.trial_duration = prms.fbDur[dat.error];
  },
};

// prettier-ignore
function drawTrialFeedback() {
  'use strict';
  let ctx = document.getElementById('canvas').getContext('2d');
  let dat = jsPsych.data.get().last(1).values()[0];

  ctx.fillStyle = 'black';
  ctx.font = prms.fbFont;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  if (dat.error === 0) {
    // draw square
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.rect(-40, -50, 80, 100);
    ctx.stroke();

    // draw text
    ctx.fillText(prms.fbTxt[dat.error], 0, 0);
  } else {
    ctx.fillText(`${handMappingInstructions[0]}               ${handMappingInstructions[1]}`, 0, -50);
    ctx.fillText(`${fingerMapping[0]}   ${fingerMapping[1]}              ${fingerMapping[2]}   ${fingerMapping[3]}`, 0, 0);
    ctx.fillText( `("${prms.respKeys[0]}-Taste") ("${prms.respKeys[1]}-Taste")         ("${prms.respKeys[2]}-Taste") ("${prms.respKeys[3]}-Taste")`, 0, 25);
  }
}

function blockFeedbackTxt(filter_options) {
  'use strict';
  let dat = jsPsych.data.get().filter({ ...filter_options, blockNum: vts_data.cBlk });
  let totalTime = Math.round(dat.select('rt1').sum() / 1000);
  let nError = dat.select('error').values.filter(function (x) {
    return x === 1;
  }).length;
  let blockFbTxt = generate_formatted_html({
    text: `Block ${vts_data.cBlk} of ${prms.nBlks}<br>
    Kurze Pause.
    Du hast in den ${prms.nTrls} Durchgängen im Schnitt ${totalTime}s gebraucht. Dabei
    hast du ${nError} Fehler gemacht. Versuche weiterhin so schnell und so genau wie
    möglich zu sein.<br><br>
    Drücke eine beliebige Taste, um fortzufahren!`,
    fontsize: 30,
    lineheight: 1.5,
    align: 'left',
  });

  // reset vts_data for next block
  vts_data.cTrl = 1;
  vts_data.cBlk += 1;
  vts_data.nNumber = 0;
  vts_data.nLetter = 0;
  vts_data.previousTask = 'na';
  vts_data.soa = 0;
  vts_data.poor_performance = nError >= prms.nPoor ? true : false;

  return blockFbTxt;
}

const block_feedback1 = {
  type: 'html-keyboard-response-canvas',
  canvas_colour: canvas_colour,
  canvas_size: canvas_size,
  canvas_border: canvas_border,
  stimulus: '',
  response_ends_trial: true,
  on_start: function (trial) {
    trial.stimulus = blockFeedbackTxt({ stim: 'vts' });
  },
};

const block_feedback2 = {
  type: 'html-keyboard-response-canvas',
  canvas_colour: canvas_colour,
  canvas_size: canvas_size,
  canvas_border: canvas_border,
  stimulus:
    generate_formatted_html({
      text: `Bitte beachten: Du hast viele Fehler in diesem Block gemacht,
        bitte schaue dir nochmal die Antorttasten genau an. Du sollst zwar so
        schnell wie möglich sein, aber dabei auch nicht zuviele Fehler Machen.
        Es geht in 30s weiter.`,
      fontsize: 26,
      align: 'left',
    }) + respText,
  response_ends_trial: false,
  on_start: function (trial) {
    if (vts_data.poor_performance) {
      trial.trial_duration = 30000;
    } else {
      trial.trial_duration = 0;
    }
  },
};

////////////////////////////////////////////////////////////////////////
//                              De-brief                              //
////////////////////////////////////////////////////////////////////////

// For VP Stunden
const randomString = generateRandomStringWithExpName('vts1', 16);

const alpha_num = {
  type: 'html-keyboard-response-canvas',
  canvas_colour: canvas_colour,
  canvas_size: canvas_size,
  canvas_border: canvas_border,
  stimulus:
    generate_formatted_html({
      text: `Wenn du eine Versuchspersonenstunde benötigst, kopiere den folgenden
      zufällig generierten Code und sende diesen zusammen mit deiner Matrikelnummer
      und deiner Universität (Tübingen) per Email an:<br><br>
    hiwipibio@gmail.com<br>`,
      fontsize: 26,
      align: 'left',
    }) +
    generate_formatted_html({
      text: `Code: ${randomString}<br>`,
      fontsize: 26,
      align: 'left',
    }) +
    generate_formatted_html({
      text: `Drücke die Leertaste, um fortzufahren!`,
      fontsize: 26,
      align: 'left',
    }),
};

////////////////////////////////////////////////////////////////////////
//                                Save                                //
////////////////////////////////////////////////////////////////////////
const save_data = {
  type: 'call-function',
  func: function () {
    let data_filename = dirName + 'data/' + expName + '_' + vpNum;
    saveData('/Common/write_data.php', data_filename, { stim_type: 'vts' });
  },
  timing_post_trial: 1000,
};

const save_interaction_data = {
  type: 'call-function',
  func: function () {
    let data_filename = dirName + 'interaction/' + expName + '_interaction_data_' + vpNum;
    saveInteractionData('/Common/write_data.php', data_filename);
  },
  timing_post_trial: 200,
};

const save_code = {
  type: 'call-function',
  func: function () {
    let code_filename = dirName + 'code/' + expName;
    saveRandomCode('/Common/write_code.php', code_filename, randomString);
  },
  timing_post_trial: 200,
};

////////////////////////////////////////////////////////////////////////
//                    Generate and run experiment                     //
////////////////////////////////////////////////////////////////////////
function genExpSeq() {
  'use strict';

  let exp = [];

  exp.push(fullscreen_on);
  exp.push(check_screen);
  exp.push(welcome_de);
  exp.push(resize_de);
  // exp.push(vpInfoForm_de);
  exp.push(hideMouseCursor);
  exp.push(task_instructions1);
  exp.push(task_instructions2);
  exp.push(task_instructions3);
  exp.push(task_instructions4);
  exp.push(task_instructions5);

  exp.push(task_instructions_responses);
  exp.push(blank_canvas);
  for (let blk = 0; blk < prms.nBlks; blk++) {
    if (blk > 0) {
      exp.push(task_instructions_responses_reminder);
      exp.push(blank_canvas);
    }
    // trials within block
    for (let trl = 0; trl < prms.nTrls; trl++) {
      exp.push(vts_stimulus);
      exp.push(trial_feedback);
      exp.push(rsi);
    }
    // between block feedback
    exp.push(block_feedback1);
    exp.push(block_feedback2);
  }

  // save data
  exp.push(save_data);
  exp.push(save_interaction_data);
  exp.push(save_code);

  // debrief
  exp.push(alpha_num);
  exp.push(debrief_de);
  exp.push(showMouseCursor);
  exp.push(fullscreen_off);

  return exp;
}
const EXP = genExpSeq();

jsPsych.init({
  timeline: EXP,
  on_interaction_data_update: function (data) {
    update_user_interaction_data(data);
  },
});
